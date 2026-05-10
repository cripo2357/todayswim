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

  /** 지도 이동 가능 범위 — 한국 본토 + 제주 + 독도 수준의 bounding box */
  const onMapReady = () => {
    mapRef.current?.setMapBoundaries(
      { latitude: 38.7, longitude: 132 }, // NE
      { latitude: 33, longitude: 124 }, // SW
    );
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

  /** 사용자 제스처(pan/줌)로 지도가 움직이면 선택 해제 — animateToRegion 같은 프로그래매틱은 무시. */
  const onRegionChangeComplete = (_: Region, details?: { isGesture?: boolean }) => {
    if (details?.isGesture && selectedPoolId) {
      select(null);
    }
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

  /** Figma 38:1078 — 36px 검정 원 + 4px 보더 + 파란 그림자, 노랑 16px 텍스트. count 무관 사이즈 고정. */
  const renderCluster = (cluster: any) => {
    const { id, geometry, onPress, properties } = cluster;
    const count: number = properties.point_count;
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
          {/* Figma 그림자 0px 4px 4px 0px rgba(0,122,255,0.15) — RN blur 없으니 옅은 다층 */}
          <View style={[styles.clusterShadow, { opacity: 0.15 }]} />
          <View style={styles.cluster}>
            <Text style={styles.clusterCount}>{count}</Text>
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
        minZoomLevel={6}
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
  // Figma 38:1078 cluster — 36x36 검정 원 + 4px 보더 + 파란 그림자
  clusterWrap: {
    width: 44,
    height: 48,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  clusterShadow: {
    position: 'absolute',
    top: 4 + 4, // marker top + offsetY 4
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.color.brandBlue,
  },
  cluster: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.color.black,
    borderWidth: 4,
    borderColor: '#090909',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterCount: {
    fontFamily: tokens.font.serifBold,
    fontSize: 16,
    lineHeight: 24,
    color: tokens.color.brandYellow,
    textAlign: 'center',
  },
});
