/**
 * 사용자 위치 훅.
 *
 * - 마운트 시 자동으로 권한 요청 (auto=false면 수동 트리거)
 * - 권한 거부 시 fallback 카피: "위치를 알려주시면 가까운 풀부터 보여드려요"
 *   (SPEC.md §7-2 거리순 정렬 거부 시)
 */
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export type Coords = { lat: number; lng: number };

export interface GeoState {
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
  coords: Coords | null;
  /**
   * 위치 다시 측정. 새 좌표(또는 권한 없을 때 null) 반환.
   * - 캐시(getLastKnownPositionAsync) 활용해 빠르게 시작하고 fresh fix로 refine
   * - 반환값으로 호출자가 stale closure 회피 가능 (state는 비동기 반영)
   */
  request: () => Promise<Coords | null>;
  error?: string;
}

export function useGeolocation(opts: { auto?: boolean } = {}): GeoState {
  const { auto = false } = opts;
  const [status, setStatus] = useState<GeoState['status']>('idle');
  const [coords, setCoords] = useState<GeoState['coords']>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const request = useCallback(async (): Promise<Coords | null> => {
    setStatus('requesting');
    setError(undefined);
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        return null;
      }

      // 1단계: 캐시된 마지막 위치 즉시 표시 — 마커 바로 뜸 (좀 부정확해도 OK).
      // Cold start에서 fresh fix는 5~30초 걸려서 그 동안 마커 안 보이는 UX 회피.
      const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });
      if (last) {
        setCoords({ lat: last.coords.latitude, lng: last.coords.longitude });
        setStatus('granted');
      }

      // 2단계: 정확한 fresh fix를 백그라운드로 받아 위치 refine.
      // Lowest 정확도 — 풀 찾기엔 ~수백m 정확도면 충분, 빠른 fix 우선.
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Lowest,
      });
      const fresh: Coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(fresh);
      setStatus('granted');
      return fresh;
    } catch (e: any) {
      setStatus('error');
      setError(e?.message ?? 'unknown error');
      return null;
    }
  }, []);

  useEffect(() => {
    if (auto) void request();
  }, [auto, request]);

  return { status, coords, request, error };
}
