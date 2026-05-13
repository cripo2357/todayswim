// Figma: 5:12241 (선택 없음) / 5:12919 (작성하기) / 5:11479 (보기) / 5:19049 (50m+ 보기)
//
// 메인 지도 — Naver Maps SDK 기반 (@mj-studio/react-native-naver-map).
// 마커 아이콘은 PNG image prop, 라벨은 SDK 네이티브 caption — RN 비트맵 캡처 우회.
// 클러스터링은 supercluster JS로 처리 (Naver native clustering은 caption 미지원이라 직접 관리).

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  type NaverMapViewRef,
  type Camera,
} from '@mj-studio/react-native-naver-map';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Supercluster from 'supercluster';

import IconFilter from '@assets/icons/filter.svg';
import IconSettings from '@assets/icons/settings.svg';
import IconLocate from '@assets/icons/locate.svg';

import type { RootStackParamList } from '@/navigation/types';
import type { Pool } from '@/types/pool';
import { usePools } from '@/hooks/usePools';
import { useSchedules } from '@/hooks/useSchedules';
import { PoolBottomCard } from '@/components/map/PoolBottomCard';
import { useSelection } from '@/store/selection';
import { useScheduleDraft } from '@/store/scheduleDraft';
import { usePoolFilter, isFilterActive, filterPools } from '@/store/poolFilter';
import { useGeolocation } from '@/hooks/useGeolocation';
import { tokens } from '@/styles/tokens';

// 마커 PNG — Naver SDK가 BitmapDescriptor로 직접 변환, 캡처 없음.
// preview/dim 변종은 폐기 (디자인 정책 변경: 다른 풀 선택 중에도 마커 외형 동일).
const MARKER_BIG           = require('@assets/markers/marker-big.png');
const MARKER_SMALL         = require('@assets/markers/marker-small.png');
const MARKER_LOCATION      = require('@assets/markers/marker-location.png');
const MARKER_CLUSTER       = require('@assets/markers/cluster.png');

const INITIAL_CAMERA: Camera = {
  latitude: 37.5165,
  longitude: 127.0731,
  zoom: 12,
};

// 선택된 풀에서 이 거리(미터)만큼 사용자가 pan하면 자동 deselect.
// 500m ≈ 한국 위도 기준 약 0.0045 deg lat — 줌 15에서 화면 절반 정도, 줌 12에서 화면의 ~1/16.
const PAN_DESELECT_M = 500;

// 선택 시점의 zoom 기준 이 값 이상 핀치로 변하면 deselect.
// Naver zoom 1단계 = 2배 축척. 1.0 = 사용자가 명확히 줌인/줌아웃 의도한 수준.
const ZOOM_DESELECT_LEVELS = 1.0;

// 단순 평면 근사 거리(m). 짧은 거리/한국 위도에선 haversine과 차이 무시 가능.
function approxDistanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = (lat2 - lat1) * 111_000;
  const dLng = (lng2 - lng1) * 111_000 * Math.cos((lat1 * Math.PI) / 180);
  return Math.hypot(dLat, dLng);
}

interface PoolProps {
  pool: Pool;
}

type ClusterFeature =
  | Supercluster.PointFeature<PoolProps>
  | Supercluster.ClusterFeature<Supercluster.AnyProps>;

export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mapRef = React.useRef<NaverMapViewRef | null>(null);
  const insets = useSafeAreaInsets();

  const selectedPoolId = useSelection((s) => s.selectedPoolId);
  const select = useSelection((s) => s.select);
  const initDraft = useScheduleDraft((s) => s.init);

  const filter = usePoolFilter();
  const filterActive = isFilterActive(filter);
  // Supabase에서 풀/시간표 fetch — react-query 캐시. 로딩 중에는 빈 배열로 fallback.
  const { data: poolsData } = usePools();
  const { data: schedulesData } = useSchedules();
  const pools = poolsData ?? [];
  const schedules = schedulesData ?? [];
  const filteredPools = React.useMemo(
    () => filterPools(pools, schedules, filter),
    [pools, schedules, filter],
  );
  const filteredIds = React.useMemo(
    () => new Set(filteredPools.map((p) => p.id)),
    [filteredPools],
  );

  const geo = useGeolocation({ auto: true });

  // 카메라 추적 — 두 가지로 분리해서 불필요한 리렌더 방지:
  // (1) cameraRef: 최신 카메라 (lat/lng/zoom). 매 onCameraChanged마다 갱신. 리렌더 X.
  // (2) zoomInt: supercluster용 정수 zoom. 정수 변할 때만 setState → 리렌더.
  // 효과: 마커 탭/애니메이션 중 매 프레임 리렌더 60회+ → 정수 zoom 변화 시점만 (보통 2~3회).
  const cameraRef = React.useRef<Camera>(INITIAL_CAMERA);
  const [zoomInt, setZoomInt] = React.useState(Math.round(INITIAL_CAMERA.zoom));

  // 좌표 잡히면 첫 1회 카메라를 사용자 위치로 이동
  // 비-Gesture 이벤트에서 마지막으로 본 zoom — 사용자 핀치 시작 직전의 baseline.
  // animateCameraTo(Developer)/Control/Location 종료 시점에 갱신되고,
  // Gesture 이벤트는 이 값과의 누적 diff로 deselect 판정.
  const baselineZoomRef = React.useRef(INITIAL_CAMERA.zoom);

  const flewToUserOnce = React.useRef(false);
  React.useEffect(() => {
    if (flewToUserOnce.current) return;
    if (geo.status !== 'granted' || !geo.coords) return;
    flewToUserOnce.current = true;
    setTimeout(() => {
      mapRef.current?.animateCameraTo({
        latitude: geo.coords!.lat,
        longitude: geo.coords!.lng,
        zoom: 13,
        duration: 600,
      });
    }, 300);
  }, [geo.status, geo.coords]);

  const selectedPool = React.useMemo(
    () => pools.find((p) => p.id === selectedPoolId) ?? null,
    [pools, selectedPoolId],
  );

  const scheduleByPool = React.useMemo(
    () => new Map(schedules.map((s) => [s.poolId, s])),
    [schedules],
  );

  /**
   * supercluster 인스턴스 — pools 데이터 변할 때마다 재빌드.
   * Naver 마커는 unmount/remount 시 잔존 핀 이슈 없음 (SDK 네이티브 처리) — 안전하게 동적 마커 가능.
   */
  const cluster = React.useMemo(() => {
    const sc = new Supercluster<PoolProps>({
      radius: 60,
      maxZoom: 13,
      minPoints: 2,
    });
    sc.load(
      pools.map((p) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: { pool: p },
      })),
    );
    return sc;
  }, [pools]);

  const visibleClusters = React.useMemo<ClusterFeature[]>(() => {
    return cluster.getClusters([-180, -85, 180, 85], zoomInt) as ClusterFeature[];
  }, [cluster, zoomInt]);

  const onMarkerPress = (poolId: string) => {
    select(poolId);
    const pool = pools.find((p) => p.id === poolId);
    if (!pool) return;
    mapRef.current?.animateCameraTo({
      latitude: pool.lat,
      longitude: pool.lng,
      zoom: Math.max(cameraRef.current.zoom, 15),
      duration: 300,
    });
  };

  const onClusterPress = (clusterId: number, lat: number, lng: number) => {
    const expansionZoom = Math.min(cluster.getClusterExpansionZoom(clusterId), 15);
    mapRef.current?.animateCameraTo({
      latitude: lat,
      longitude: lng,
      zoom: expansionZoom,
      duration: 300,
    });
  };

  const onCameraChanged = (cam: {
    latitude: number;
    longitude: number;
    zoom: number;
    reason: 'Developer' | 'Gesture' | 'Control' | 'Location';
  }) => {
    // ref만 즉시 갱신 — 리렌더 안 일어남
    cameraRef.current = { latitude: cam.latitude, longitude: cam.longitude, zoom: cam.zoom };
    // 정수 zoom 바뀔 때만 state 업데이트 → visibleClusters 재계산
    const newZoomInt = Math.round(cam.zoom);
    if (newZoomInt !== zoomInt) {
      setZoomInt(newZoomInt);
    }

    // 비-Gesture 이벤트(animateCameraTo 등)는 baseline만 갱신하고 deselect 평가 안함.
    // → 마커 탭으로 카메라가 zoom 15로 이동해도 카드 유지, 그 이후 사용자 핀치만 평가.
    if (cam.reason !== 'Gesture') {
      baselineZoomRef.current = cam.zoom;
      return;
    }

    if (!selectedPool) return; // 선택 없으면 평가 불필요

    // (a) 핀치 zoom 변화: baseline 기준 ZOOM_DESELECT_LEVELS 이상 변하면 deselect
    if (Math.abs(cam.zoom - baselineZoomRef.current) >= ZOOM_DESELECT_LEVELS) {
      select(null);
      return;
    }

    // (b) pan 거리: 선택된 풀에서 PAN_DESELECT_M 이상 멀어지면 deselect
    const dist = approxDistanceMeters(
      cam.latitude,
      cam.longitude,
      selectedPool.lat,
      selectedPool.lng,
    );
    if (dist > PAN_DESELECT_M) {
      select(null);
    }
  };

  const onScheduleAction = () => {
    if (!selectedPool) return;
    if (scheduleByPool.has(selectedPool.id)) {
      navigation.navigate('ScheduleView', { poolId: selectedPool.id });
    } else {
      initDraft(selectedPool.id);
      // 새 흐름: 시간표 작성 → (요일별 Time modal) → 닉네임(마지막). Nickname 화면 우회.
      navigation.navigate('ScheduleWrite', { poolId: selectedPool.id });
    }
  };

  const flyToMyLocation = async () => {
    // 항상 새로 측정 — 사용자가 이동했을 수 있으므로 캐시된 geo.coords 무시.
    // request()는 캐시→fresh 2단계로 최신 좌표 반환. 권한 거부 시 null.
    const fresh = await geo.request();
    if (fresh) {
      // 내 위치 이동은 다른 기능 사용으로 간주 → deselect
      select(null);
      mapRef.current?.animateCameraTo({
        latitude: fresh.lat,
        longitude: fresh.lng,
        zoom: 13,
        duration: 400,
      });
    }
  };

  return (
    <View style={styles.root}>
      <NaverMapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialCamera={INITIAL_CAMERA}
        onCameraChanged={onCameraChanged}
        minZoom={7} // 한국 전체 + α — 답답함 줄이고 줌아웃 자유롭게
        maxZoom={15} // 거리 단위 — 풀 위치 주변 도로/블록 식별 가능
        isShowCompass={false}
        isShowZoomControls={false}
        isShowLocationButton={false}
        isShowIndoorLevelPicker={false}
        isRotateGesturesEnabled={false}
        isTiltGesturesEnabled={false}
        // Naver Style Editor에서 만든 커스텀 스타일 — 도로/POI/색상 등 모든 시각 요소 제어.
        // mapType/lightness/layerGroups는 커스텀 스타일이 덮어쓰므로 생략.
        // 스타일 수정/재발행은 https://console.ncloud.com/maps/styles 에서.
        customStyleId="c52a2948-bdea-4a26-8a59-92a5cf711f42"
      >
        {/* 내 위치 마커 — Naver caption으로 "내 위치" 라벨 네이티브 렌더 */}
        {geo.status === 'granted' && geo.coords ? (
          <NaverMapMarkerOverlay
            latitude={geo.coords.lat}
            longitude={geo.coords.lng}
            image={MARKER_LOCATION}
            width={47}
            height={47}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={5}
            caption={{
              text: '내 위치',
              textSize: 14,
              color: tokens.color.ink900,
              haloColor: tokens.color.white,
              minZoom: 10,
            }}
          />
        ) : null}

        {visibleClusters.map((c) => {
          const [lng, lat] = c.geometry.coordinates;

          // 클러스터 마커 — Figma 38:1866 (≤2자리) / 38:1870 (3자리+)
          // 카운트는 caption으로 marker 중앙에 겹침 (align Center). textSize는 자릿수 기준 가변.
          if ((c.properties as any).cluster) {
            const props = c.properties as Supercluster.ClusterProperties;
            // 필터 비활성 시 supercluster의 point_count 그대로 사용 (O(1)).
            // 필터 활성 시에만 leaves 순회해서 매칭 카운트 (비용 큼).
            let visibleCount: number;
            if (filterActive) {
              const leaves = cluster.getLeaves(
                props.cluster_id,
                Infinity,
              ) as Supercluster.PointFeature<PoolProps>[];
              visibleCount = leaves.filter((l) => filteredIds.has(l.properties.pool.id)).length;
            } else {
              visibleCount = props.point_count;
            }
            if (visibleCount === 0) return null;
            const countStr = String(visibleCount);
            const captionSize = countStr.length >= 3 ? 12 : 16;
            return (
              <NaverMapMarkerOverlay
                key={`cluster-${props.cluster_id}`}
                latitude={lat}
                longitude={lng}
                image={MARKER_CLUSTER}
                width={47}
                height={47}
                anchor={{ x: 0.5, y: 0.5 }}
                caption={{
                  text: countStr,
                  textSize: captionSize,
                  color: tokens.color.brandYellow,
                  haloColor: tokens.color.ink900,
                  // cluster.png가 위쪽에 원 + 아래쪽 halo로 비대칭이라 'Center'는 원 아래로 쏠림.
                  // 'Top' 기준 offset: 양수=마커 위로 멀어짐, 음수=마커 안으로 침투.
                  align: 'Top',
                  offset: -28,
                }}
                onTap={() => onClusterPress(props.cluster_id, lat, lng)}
              />
            );
          }

          // 풀 마커
          const p = (c.properties as PoolProps).pool;
          const included = filteredIds.has(p.id);
          if (!included) return null; // 필터 제외된 풀은 unmount (Naver는 잔존 핀 이슈 없음)

          const isSelected = p.id === selectedPoolId;
          const isBig = (p.poolLength ?? 0) >= 50;
          const img = isBig ? MARKER_BIG : MARKER_SMALL;
          const size = isBig ? 50 : 47;
          return (
            <NaverMapMarkerOverlay
              key={p.id}
              latitude={p.lat}
              longitude={p.lng}
              image={img}
              width={size}
              height={size}
              anchor={{ x: 0.5, y: 0.5 }}
              zIndex={isSelected ? 10 : 1}
              caption={{
                text: p.name,
                textSize: 14,
                color: tokens.color.ink900,
                haloColor: tokens.color.white,
                minZoom: 11,
              }}
              onTap={() => onMarkerPress(p.id)}
            />
          );
        })}
      </NaverMapView>

      {/* Figma 38:1203 — 우측 FAB 3개: 필터 / 작성(More) / 위치 */}
      <View
        style={[styles.controls, { top: insets.top + 80 }]}
        pointerEvents="box-none"
      >
        {/* Figma 57:4623 — 필터 적용중일 땐 알약 형태로 노랑 텍스트 + 노랑 아이콘 */}
        <Pressable
          onPress={() => {
            select(null); // 다른 기능 사용 → deselect 정책
            navigation.navigate('PoolFilter');
          }}
          style={[
            styles.fab,
            filterActive ? styles.fabFilterActive : styles.fabRound,
          ]}
          accessibilityRole="button"
          accessibilityLabel="수영장 검색 필터"
        >
          {filterActive ? (
            <Text style={styles.fabFilterActiveLabel}>
              필터 적용중 ({filteredPools.length})
            </Text>
          ) : null}
          <IconFilter
            width={20}
            height={20}
            color={filterActive ? tokens.color.brandYellow : tokens.color.white}
          />
        </Pressable>
        <Pressable
          onPress={() => {
            select(null); // 다른 기능 사용 → deselect 정책
            navigation.navigate('More');
          }}
          style={[styles.fab, styles.fabRound]}
          accessibilityRole="button"
          accessibilityLabel="부가 기능"
        >
          <IconSettings width={20} height={20} color={tokens.color.white} />
        </Pressable>
        <Pressable
          onPress={flyToMyLocation}
          style={[styles.fab, styles.fabRound]}
          accessibilityRole="button"
          accessibilityLabel="내 위치"
        >
          <IconLocate width={20} height={20} />
        </Pressable>
      </View>

      {/* 하단 카드 */}
      {selectedPool ? (
        <SafeAreaView style={styles.bottomWrap} edges={['bottom']} pointerEvents="box-none">
          <PoolBottomCard
            pool={selectedPool}
            // 자유수영 가능 여부 우선 → false면 'impossible'.
            // 가능하다면 시간표 등록 여부에 따라 'available' / 'no_schedule'.
            // freeSwimAvailable이 undefined인 경우 (DB 마이그레이션 전) 가능으로 간주.
            status={
              selectedPool.freeSwimAvailable === false
                ? 'impossible'
                : scheduleByPool.has(selectedPool.id)
                ? 'available'
                : 'no_schedule'
            }
            onPressScheduleAction={onScheduleAction}
          />
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgCream },
  controls: {
    position: 'absolute',
    right: tokens.layout.pagePadMobile,
    gap: tokens.space[2],
    alignItems: 'flex-end',
  },
  fab: {
    backgroundColor: tokens.color.black,
  },
  fabRound: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios' ? tokens.shadow.md : { elevation: 4 }),
  },
  fabFilterActive: {
    height: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    gap: 10,
    ...(Platform.OS === 'ios' ? tokens.shadow.md : { elevation: 4 }),
  },
  fabFilterActiveLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: tokens.color.brandYellow,
  },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});
