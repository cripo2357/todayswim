// Figma: 5:12241 (선택 없음) / 5:12919 (작성하기) / 5:11479 (보기) / 5:19049 (찜)
//
// 메인 지도. react-native-maps + Google provider.
// 풀 마커 + 선택 시 하단 카드. 4상태는 모두 한 화면에서 분기.

import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Minus, Crosshair, Menu, Search } from 'lucide-react-native';

import type { RootStackParamList } from '@/navigation/types';
import { dummyPools, dummySchedules } from '@/data/dummyPools';
import { PoolMarker } from '@/components/map/PoolMarker';
import { PoolBottomCard } from '@/components/map/PoolBottomCard';
import { useFavorites } from '@/store/favorites';
import { useSelection } from '@/store/selection';
import { useScheduleDraft } from '@/store/scheduleDraft';
import { tokens } from '@/styles/tokens';

const INITIAL_REGION: Region = {
  latitude: 37.5165,
  longitude: 127.0731,
  latitudeDelta: 0.04,
  longitudeDelta: 0.03,
};

export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const mapRef = React.useRef<MapView>(null);

  const selectedPoolId = useSelection((s) => s.selectedPoolId);
  const select = useSelection((s) => s.select);
  const favoriteIds = useFavorites((s) => s.ids);
  const initDraft = useScheduleDraft((s) => s.init);

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
    if (pool) {
      mapRef.current?.animateToRegion(
        { latitude: pool.lat, longitude: pool.lng, latitudeDelta: 0.02, longitudeDelta: 0.015 },
        300,
      );
    }
  };

  const onMapPress = () => {
    select(null);
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

  const zoom = (delta: number) => {
    mapRef.current?.getCamera().then((cam: any) => {
      if (!cam) return;
      cam.zoom = Math.max(0, Math.min(20, (cam.zoom ?? 14) + delta));
      mapRef.current?.animateCamera(cam, { duration: 200 });
    });
  };

  return (
    <View style={styles.root}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        onPress={onMapPress}
        showsCompass={false}
        showsMyLocationButton={false}
      >
        {dummyPools.map((p) => {
          const isSelected = p.id === selectedPoolId;
          const isFav = favoriteIds.has(p.id);
          return (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lng }}
              onPress={(e) => { e.stopPropagation?.(); onMarkerPress(p.id); }}
              tracksViewChanges={false}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <PoolMarker
                variant={isFav ? 'favorite' : isSelected ? 'default' : 'preview'}
                selected={isSelected}
              />
            </Marker>
          );
        })}
      </MapView>

      {/* 상단 좌측: 메뉴 / 우측: 검색 */}
      <SafeAreaView style={styles.topBar} pointerEvents="box-none" edges={['top']}>
        <Pressable onPress={() => navigation.navigate('More')} style={styles.fabSm}>
          <Menu size={20} color={tokens.color.ink900} strokeWidth={1.8} />
        </Pressable>
        <Pressable style={styles.fabSm}>
          <Search size={20} color={tokens.color.ink900} strokeWidth={1.8} />
        </Pressable>
      </SafeAreaView>

      {/* 우측 줌 + 내 위치 */}
      <View style={[styles.controls, { bottom: selectedPool ? 280 : 100 }]} pointerEvents="box-none">
        <Pressable onPress={() => zoom(1)} style={[styles.fabDark, styles.fabRound]}>
          <Plus size={20} color={tokens.color.white} strokeWidth={2} />
        </Pressable>
        <Pressable onPress={() => zoom(-1)} style={[styles.fabDark, styles.fabRound]}>
          <Minus size={20} color={tokens.color.white} strokeWidth={2} />
        </Pressable>
        <Pressable style={[styles.fabDark, styles.fabRound]}>
          <Crosshair size={20} color={tokens.color.white} strokeWidth={2} />
        </Pressable>
      </View>

      {/* 하단 카드 */}
      {selectedPool ? (
        <SafeAreaView style={styles.bottomWrap} edges={['bottom']} pointerEvents="box-none">
          <PoolBottomCard
            pool={selectedPool}
            hasSchedule={scheduleByPool.has(selectedPool.id)}
            favorited={favoriteIds.has(selectedPool.id)}
            onPressScheduleAction={onScheduleAction}
          />
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgCream },
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.layout.pagePadMobile,
    paddingTop: tokens.space[2],
  },
  fabSm: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: tokens.color.bgPaper,
    alignItems: 'center', justifyContent: 'center',
    ...tokens.shadow.md,
  },
  controls: {
    position: 'absolute',
    right: tokens.layout.pagePadMobile,
    gap: tokens.space[2],
    alignItems: 'flex-end',
  },
  fabDark: {
    backgroundColor: tokens.color.ink900,
  },
  fabRound: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    ...(Platform.OS === 'ios' ? tokens.shadow.md : { elevation: 4 }),
  },
  bottomWrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
  },
});
