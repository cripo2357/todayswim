/**
 * 사용자 위치 훅.
 *
 * - 마운트 시 자동으로 권한 요청 (auto=false면 수동 트리거)
 * - 권한 거부 시 fallback 카피: "위치를 알려주시면 가까운 풀부터 보여드려요"
 *   (SPEC.md §7-2 거리순 정렬 거부 시)
 */
import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

export interface GeoState {
  status: 'idle' | 'requesting' | 'granted' | 'denied' | 'error';
  coords: { lat: number; lng: number } | null;
  request: () => Promise<void>;
  error?: string;
}

export function useGeolocation(opts: { auto?: boolean } = {}): GeoState {
  const { auto = false } = opts;
  const [status, setStatus] = useState<GeoState['status']>('idle');
  const [coords, setCoords] = useState<GeoState['coords']>(null);
  const [error, setError] = useState<string | undefined>(undefined);

  const request = useCallback(async () => {
    setStatus('requesting');
    setError(undefined);
    try {
      const { status: perm } = await Location.requestForegroundPermissionsAsync();
      if (perm !== 'granted') {
        setStatus('denied');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      setStatus('granted');
    } catch (e: any) {
      setStatus('error');
      setError(e?.message ?? 'unknown error');
    }
  }, []);

  useEffect(() => {
    if (auto) void request();
  }, [auto, request]);

  return { status, coords, request, error };
}
