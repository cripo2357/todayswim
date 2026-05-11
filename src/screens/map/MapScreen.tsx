// Figma: 5:12241 (선택 없음) / 5:12919 (작성하기) / 5:11479 (보기) / 5:19049 (50m+ 보기)
//
// 메인 지도. react-native-maps + Google provider.
// 마커 색은 풀 사이즈 기준 (50m+ 노랑 / ≤25m 파랑). 선택 시 중앙으로 + 사이즈 ↑.

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Linking } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import ClusteredMapView from 'react-native-map-clustering';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import IconPencil from '@assets/icons/pencil.svg';
import IconPlus from '@assets/icons/plus.svg';
import IconMinus from '@assets/icons/minus.svg';
import IconLocate from '@assets/icons/locate.svg';
import ClusterSvg from '@assets/markers/cluster.svg';

import type { RootStackParamList } from '@/navigation/types';
import type { Pool } from '@/types/pool';
import { dummyPools, dummySchedules } from '@/data/dummyPools';
import { PoolMarker } from '@/components/map/PoolMarker';
import { PoolBottomCard } from '@/components/map/PoolBottomCard';
import { mapStyle } from '@/screens/map/mapStyle';
import { useSelection } from '@/store/selection';
import { useScheduleDraft } from '@/store/scheduleDraft';
import { useGeolocation } from '@/hooks/useGeolocation';
import { tokens } from '@/styles/tokens';

const INITIAL_REGION: Region = {
  latitude: 37.5165,
  longitude: 127.0731,
  latitudeDelta: 0.04,
  longitudeDelta: 0.03,
};

/**
 * 한국(남한 + 제주 + 독도) 카메라 이동 범위.
 * SW: Baekryeong/Jeju 끝, NE: Dokdo + DMZ.
 */
const KR_BOUNDS = {
  ne: { latitude: 38.7,  longitude: 132.0 },
  sw: { latitude: 32.95, longitude: 124.5 },
} as const;

function clampToKorea(r: Region): Region | null {
  const lat = Math.min(KR_BOUNDS.ne.latitude,  Math.max(KR_BOUNDS.sw.latitude,  r.latitude));
  const lng = Math.min(KR_BOUNDS.ne.longitude, Math.max(KR_BOUNDS.sw.longitude, r.longitude));
  if (lat === r.latitude && lng === r.longitude) return null;
  return { ...r, latitude: lat, longitude: lng };
}


export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mapRef = React.useRef<MapView | null>(null);
  const insets = useSafeAreaInsets();

  const selectedPoolId = useSelection((s) => s.selectedPoolId);

  const select = useSelection((s) => s.select);
  const initDraft = useScheduleDraft((s) => s.init);
  const geo = useGeolocation();

  /**
   * tracksViewChanges 게이트.
   * - 평상시 true (SVG/텍스트 layout 캡처 + 줌·팬 시 클러스터 라이브러리 remount 시 정상 표시)
   * - 카메라 animateToRegion 시작~끝 동안만 false (비트맵 freeze 해서 캡처 글리치 방지)
   */
  const [tracking, setTracking] = React.useState(true);

  /** 지도 이동 가능 범위 — 한국 본토 + 제주 + 독도. Google Maps SDK 레벨 boundary. */
  const onMapReady = () => {
    mapRef.current?.setMapBoundaries(KR_BOUNDS.ne, KR_BOUNDS.sw);
  };

  const selectedPool = React.useMemo(
    () => dummyPools.find((p) => p.id === selectedPoolId) ?? null,
    [selectedPoolId],
  );

  const scheduleByPool = React.useMemo(
    () => new Map(dummySchedules.map((s) => [s.poolId, s])),
    [],
  );

  const onMarkerPress = (poolId: string) => {
    select(poolId);
    const pool = dummyPools.find((p) => p.id === poolId);
    if (!pool) return;
    // 1) 150ms — 마커 selected size(64) 레이아웃 안정 (트래킹 켜진 상태로 새 비트맵 캡처)
    // 2) tracking false — 비트맵 freeze
    // 3) 카메라 animateToRegion — 비트맵 frozen 상태로 이동 (잘림 방지)
    // 4) 카메라 끝나면 tracking true 복귀
    setTimeout(() => {
      setTracking(false);
      mapRef.current?.animateToRegion(
        { latitude: pool.lat, longitude: pool.lng, latitudeDelta: 0.02, longitudeDelta: 0.015 },
        250,
      );
      setTimeout(() => setTracking(true), 350);
    }, 150);
  };

  const onMapPress = () => {
    select(null);
  };

  /**
   * 지도 region 변경 완료 시:
   * 1) 한국 바깥이면 다시 한국 안으로 끌어옴 (gesture 여부 무관 — setMapBoundaries 안 먹히는 환경 대비)
   * 2) 사용자 제스처면 선택 해제
   *    (Android에선 `details.isGesture`가 undefined이라 그냥 region 변화 = 사용자 행동으로 간주)
   */
  const onRegionChangeComplete = (region: Region, details?: { isGesture?: boolean }) => {
    const clamped = clampToKorea(region);
    if (clamped) {
      mapRef.current?.animateToRegion(clamped, 200);
      return; // 다음 라운드에서 한국 안 region으로 다시 fire될 거니까 여기서 select 건드리지 않음
    }
    const isGesture = details?.isGesture !== false; // undefined도 gesture로 간주 (Android fallback)
    if (isGesture && selectedPoolId) select(null);
  };

  const onScheduleAction = () => {
    if (!selectedPool) return;
    if (scheduleByPool.has(selectedPool.id)) {
      navigation.navigate('ScheduleView', { poolId: selectedPool.id });
    } else {
      initDraft(selectedPool.id);
      navigation.navigate('ScheduleNickname', { poolId: selectedPool.id });
    }
  };

  const openExternalDirections = (pool: Pool) => {
    const dest = `${pool.lat},${pool.lng}`;
    const label = encodeURIComponent(pool.name);
    const url = Platform.select({
      ios: `maps://?daddr=${dest}&q=${label}`,
      android: `geo:0,0?q=${dest}(${label})`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${dest}`,
    })!;
    Linking.openURL(url).catch(() => {
      // 네이티브 지도앱이 없으면 웹 fallback
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${dest}`);
    });
  };

  const zoom = (delta: number) => {
    if (selectedPoolId) select(null);
    mapRef.current?.getCamera().then((cam: any) => {
      if (!cam) return;
      cam.zoom = Math.max(0, Math.min(20, (cam.zoom ?? 14) + delta));
      mapRef.current?.animateCamera(cam, { duration: 200 });
    });
  };

  const flyToMyLocation = async () => {
    if (geo.status !== 'granted') {
      await geo.request();
    }
    if (geo.coords) {
      mapRef.current?.animateToRegion(
        {
          latitude: geo.coords.lat,
          longitude: geo.coords.lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.015,
        },
        400,
      );
    }
  };

  /** Figma 38:1078 cluster — assets/markers/cluster.svg (거친 path 베이크 + 내장 shadow filter).
   *  SVG viewBox 47×47, 실제 원 36×36 @ (5.37, 1.54). RN 네이티브 shadow는 rough path 안쪽으로
   *  inset된 backing(28×28)에서 캐스팅 (SVG filter 미지원 대비). 숫자 텍스트는 원 중심 overlay.
   */
  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const count: number = properties.point_count;
    const countStr = String(count);
    const fontSize = countStr.length >= 4 ? 12 : 16;
    return (
      <Marker
        key={`cluster-${id}`}
        coordinate={{
          latitude: geometry.coordinates[1],
          longitude: geometry.coordinates[0],
        }}
        onPress={onPress}
        tracksViewChanges
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={styles.clusterWrap}>
          <View style={styles.clusterShadowBacking} />
          <View style={styles.clusterSvg}>
            <ClusterSvg width={47} height={47} />
          </View>
          <View style={styles.clusterTextWrap}>
            <Text style={[styles.clusterCount, { fontSize }]}>{countStr}</Text>
          </View>
        </View>
      </Marker>
    );
  };

  return (
    <View style={styles.root}>
      <ClusteredMapView
        mapRef={(ref) => {
          mapRef.current = ref as unknown as MapView;
        }}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyle}
        initialRegion={INITIAL_REGION}
        onMapReady={onMapReady}
        onPress={onMapPress}
        onRegionChangeComplete={onRegionChangeComplete}
        minZoomLevel={7}
        showsCompass={false}
        showsMyLocationButton={false}
        rotateEnabled={false}
        pitchEnabled={false}
        // 클러스터 임계값: maxZoom 이상 줌인 시 개별 마커. zoom 14까지(동네 레벨) 묶고 그 이상에서 풀림.
        radius={60}
        minPoints={2}
        maxZoom={14}
        renderCluster={renderCluster}
      >
        {dummyPools.map((p) => {
          const isSelected = p.id === selectedPoolId;
          const hasOtherSelection = !!selectedPoolId && !isSelected;
          const variant = (p.poolLength ?? 0) >= 50 ? 'big' : 'small';
          return (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lng }}
              onPress={(e) => {
                e.stopPropagation?.();
                onMarkerPress(p.id);
              }}
              tracksViewChanges={tracking}
              anchor={{ x: 0.5, y: 0.35 }}
            >
              <PoolMarker
                variant={variant}
                name={p.name}
                preview={hasOtherSelection}
                selected={isSelected}
              />
            </Marker>
          );
        })}

      </ClusteredMapView>

      {/* 우측 FAB 4개: 작성(More 진입) / + / − / 위치 — 상단 고정 */}
      <View
        style={[styles.controls, { top: insets.top + 80 }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => navigation.navigate('More')}
          style={[styles.fab, styles.fabRound]}
          accessibilityRole="button"
          accessibilityLabel="부가 기능"
        >
          <IconPencil width={20} height={20} />
        </Pressable>
        <Pressable
          onPress={() => zoom(1)}
          style={[styles.fab, styles.fabRound]}
          accessibilityRole="button"
          accessibilityLabel="확대"
        >
          <IconPlus width={20} height={20} />
        </Pressable>
        <Pressable
          onPress={() => zoom(-1)}
          style={[styles.fab, styles.fabRound]}
          accessibilityRole="button"
          accessibilityLabel="축소"
        >
          <IconMinus width={20} height={20} />
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
            hasSchedule={scheduleByPool.has(selectedPool.id)}
            onPressDirections={() => openExternalDirections(selectedPool)}
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
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  // Figma 38:1078 cluster — SVG asset (cluster.svg) 기반. viewBox 47x47.
  clusterWrap: {
    width: 47,
    height: 47,
  },
  // 거친 SVG 안쪽으로 inset된 smooth 28x28 backing — 시야에 안 보이지만 shadow 캐스팅용
  clusterShadowBacking: {
    position: 'absolute',
    left: 5.37 + 4,   // SVG 원 좌표 + 4px inset
    top: 1.54 + 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: tokens.color.black,
    shadowColor: tokens.color.brandBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  clusterSvg: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 47,
    height: 47,
    elevation: 20, // Android: backing 위
  },
  clusterTextWrap: {
    position: 'absolute',
    left: 5.37,
    top: 1.54,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 30, // Android: SVG 위
  },
  clusterCount: {
    fontFamily: tokens.font.graffiti,
    lineHeight: 24,
    color: tokens.color.brandYellow,
    textAlign: 'center',
  },
});
