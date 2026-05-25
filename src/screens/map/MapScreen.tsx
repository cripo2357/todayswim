// Figma: 5:12241 (선택 없음) / 5:12919 (작성하기) / 5:11479 (보기) / 5:19049 (50m+ 보기)
//
// 메인 지도 — Naver Maps SDK 기반 (@mj-studio/react-native-naver-map).
// 마커 아이콘은 PNG image prop, 라벨은 SDK 네이티브 caption — RN 비트맵 캡처 우회.
// 클러스터링은 supercluster JS로 처리 (Naver native clustering은 caption 미지원이라 직접 관리).

import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Image, ScrollView, Dimensions, BackHandler } from 'react-native';
import {
  NaverMapView,
  NaverMapMarkerOverlay,
  type NaverMapViewRef,
  type Camera,
} from '@mj-studio/react-native-naver-map';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Supercluster from 'supercluster';

import IconFilter from '@assets/icons/filter.svg';
import IconCloseCircle from '@assets/icons/close-circle.svg';
import IconLocate from '@assets/icons/locate.svg';
import IconProfile from '@assets/icons/profile.svg';
import IconLifeBuoy from '@assets/icons/life-buoy.svg';

import type { RootStackParamList } from '@/navigation/types';
import type { Pool } from '@/types/pool';
import { usePools } from '@/hooks/usePools';
import { useSchedules } from '@/hooks/useSchedules';
import { PoolBottomCard } from '@/components/map/PoolBottomCard';
import { useSelection } from '@/store/selection';
import { usePoolFilter, isFilterActive, filterPools } from '@/store/poolFilter';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useProfile } from '@/store/profile';
import { useUnreadCount } from '@/hooks/useNotifications';
import { useSwimSchedules } from '@/store/swimSchedule';
import { useFriends } from '@/store/friends';
import { useFavorites } from '@/store/favorites';
import { MOCK_OTHER_LESSONS, MOCK_OTHER_SCHEDULES } from '@/lib/mockData';
import { logEvent } from '@/lib/analytics';
// MapScreen 한정 — useOtherSchedules 사용 금지 ([[naver_map_oob_mock_only]]).
// 2026-05-20 회귀: 6배치(f529ecf)에서 useOtherSchedules 도입 시 naver-map
// 마운트에서 java.lang.IndexOutOfBoundsException(ArrayList.get) 발생.
// CalendarTab은 무영향 — 같은 훅 사용 OK. MapScreen만 mock 직접 사용.
// React Query 캐시 효과는 CalendarTab의 useOtherSchedules 호출로 살아있음.
import {
  buildPoolProfileStacks,
  type PoolStack,
} from '@/lib/mapProfileStacks';
import {
  usePrefs,
  MAP_FRIEND_HORIZON_MS,
  MAP_PUBLIC_HORIZON_MS,
} from '@/store/prefs';
import {
  MapProfileStack,
  STACK_W,
  STACK_H,
} from '@/components/map/MapProfileStack';
import { BUNDLE_AVATARS, isBundleAvatar } from '@/lib/avatars';
import { Toast } from '@/components/ui/Toast';
import { tokens } from '@/styles/tokens';

// 뒤로가기 종료 안내 노출 시간(ms). 이 시간 내 한 번 더 누르면 앱 종료.
// Figma 277:6852 — "한 번 더 뒤로가기를 하면 앱이 종료됩니다."
const EXIT_TOAST_MS = 5000;

// 마커 PNG — Naver SDK가 BitmapDescriptor로 직접 변환, 캡처 없음.
// preview/dim 변종은 폐기 (디자인 정책 변경: 다른 풀 선택 중에도 마커 외형 동일).
const MARKER_BIG           = require('@assets/markers/marker-big.png');
const MARKER_SMALL         = require('@assets/markers/marker-small.png');
const MARKER_HOTEL         = require('@assets/markers/marker-hotel.png');
// 즐겨찾기 풀 마커 — 본체 좌상단에 하트가 베이크된 PNG. 본체 크기는 원본과 동일,
// PNG 자체가 하트만큼 좌·상으로 더 큼. anchor를 본체 중앙(=실제 풀 좌표)으로 보정.
const MARKER_BIG_FAV       = require('@assets/markers/marker-big-fav.png');
const MARKER_SMALL_FAV     = require('@assets/markers/marker-small-fav.png');
const MARKER_HOTEL_FAV     = require('@assets/markers/marker-hotel-fav.png');
const MARKER_ME            = require('@assets/markers/marker-me.png'); // 내 위치 노란 링(로그인)
const MARKER_ME_GUEST      = require('@assets/markers/marker-me-guest.png'); // 로그아웃(노란 원+검은 팔벌린 사람 baked)
const MARKER_CLUSTER       = require('@assets/markers/cluster.png');

const INITIAL_CAMERA: Camera = {
  latitude: 37.5165,
  longitude: 127.0731,
  // 14 = STACK_MIN_ZOOM. 시작 직후부터 풀 위 아바타 스택이 보이도록.
  // 보이는 영역은 동네 단위로 좁아지지만 정보 밀도(친구·다른 사용자 일정) 우선.
  zoom: 14,
};

// 선택된 풀에서 이 거리(미터)만큼 사용자가 pan하면 자동 deselect.
// 500m ≈ 한국 위도 기준 약 0.0045 deg lat — 줌 15에서 화면 절반 정도, 줌 12에서 화면의 ~1/16.
const PAN_DESELECT_M = 500;

// 선택 시점의 zoom 기준 이 값 이상 핀치로 변하면 deselect.
// Naver zoom 1단계 = 2배 축척. 1.0 = 사용자가 명확히 줌인/줌아웃 의도한 수준.
const ZOOM_DESELECT_LEVELS = 1.0;

// 마커 핀과 프로필 스택 사이 간격(px). Figma 173:13595 기준 스택이 핀 우측에
// 살짝 겹쳐 붙음 — 음수 = 핀 쪽으로 tuck.
const STACK_PIN_GAP = -7;

// 프로필 스택을 핀 바텀 정렬 기준에서 위로 올리는 양(px). 양수=위로.
const STACK_LIFT = 9;

// 이 정수 줌 이상에서만 프로필 스택 렌더. 줌아웃 시 풀이 점처럼 작아
// 스택 가독성 0인데 동시에 수십 풀×29아바타 비트맵 캡처가 폭발 →
// 최대 성능 비용. supercluster maxZoom=13이라 14↑은 거의 개별 풀.
// (preview 측정: 스택이 release에서도 최대 부하 — 줌 게이팅이 핵심 레버)
const STACK_MIN_ZOOM = 14;

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

/** 프로필 FAB 내용 — 로그인(프로필 있음)이면 아바타, 아니면 기본 아이콘. */
function ProfileFabContent({ photoUri }: { photoUri?: string }) {
  if (!photoUri) return <IconProfile width={20} height={20} />;
  if (isBundleAvatar(photoUri)) {
    const Svg = BUNDLE_AVATARS[photoUri];
    return <Svg width={44} height={44} />;
  }
  return <Image source={{ uri: photoUri }} style={styles.fabAvatarImg} />;
}

/** 내 위치 마커(로그인) — marker-me.png(50, 노란 원+halo) 위에 34 프로필.
 *  가장자리 (50-34)/2 = 8px 노란 테두리가 보임 (Figma 130:3622).
 *  로그아웃은 marker-me-guest.png(노란 원+검은 사람 baked)를 image 직접. */
function LocationProfileMarker({ photoUri }: { photoUri: string }) {
  return (
    <View style={styles.locMarker}>
      <Image source={MARKER_ME} style={styles.locRing} />
      <View style={styles.locInner}>
        {isBundleAvatar(photoUri) ? (
          React.createElement(BUNDLE_AVATARS[photoUri], {
            width: 34,
            height: 34,
          })
        ) : (
          <Image source={{ uri: photoUri }} style={styles.locInnerImg} />
        )}
      </View>
    </View>
  );
}

export function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  // 미열람 메시지 카운터 — 로그인(프로필) 시에만 의미. Figma 90:5963.
  // P3-A5: 서버 count(*) 기반 — 재시작/기기변경에도 정확.
  const unread = useUnreadCount();
  const mapRef = React.useRef<NaverMapViewRef | null>(null);
  const insets = useSafeAreaInsets();

  const selectedPoolId = useSelection((s) => s.selectedPoolId);
  const select = useSelection((s) => s.select);

  // Android 하드웨어 뒤로가기 — MapScreen 은 루트라 기본 동작은 즉시 앱 종료.
  // 실수 종료 방지를 위해 1차 안내 토스트 노출 + EXIT_TOAST_MS 내 2차 누르면 종료.
  // (iOS는 하드웨어 백 버튼 없음 — addEventListener 자체가 no-op.)
  const [exitToastVisible, setExitToastVisible] = React.useState(false);
  // 토스트 노출 중(=2차 누르면 종료) 여부. 콜백 안정성 위해 ref.
  const exitArmedRef = React.useRef(false);
  useFocusEffect(
    React.useCallback(() => {
      const sub = BackHandler.addEventListener('hardwareBackPress', () => {
        if (exitArmedRef.current) {
          BackHandler.exitApp();
          return true;
        }
        exitArmedRef.current = true;
        setExitToastVisible(true);
        return true;
      });
      return () => sub.remove();
    }, []),
  );

  const filter = usePoolFilter();
  const filterActive = isFilterActive(filter);
  const clearAllFilter = usePoolFilter((s) => s.clearAll);
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
  // 지도 시작 위치(null=내 위치, 그 외=즐겨찾기 poolId) + 친구 스택 표시 설정
  const mapStartPoolId = usePrefs((s) => s.mapStartPoolId);
  const mapFriendHorizon = usePrefs((s) => s.mapFriendHorizon);
  const mapPublicHorizon = usePrefs((s) => s.mapPublicHorizon);
  const profileVis = usePrefs((s) => s.profileVisibility);
  // 사람들(비친구 전체공개) horizon은 프로필 공개='public'일 때만 유효
  const effectivePublicHorizon =
    profileVis === 'public' ? mapPublicHorizon : 'off';
  // 2026-05-22 정책: 내 일정·친구는 항상 노출(둘 다 off 옵션 폐기).
  // 사람들(effectivePublicHorizon)만 'off' 가능 — 하지만 친구가 항상 있으니
  // 스택은 항상 표시. 변수 유지(향후 정책 변경 대비).
  const showStack = true;

  // 스택 셔플 시드 — 앱 세션당 1회(useState lazy init). buildPoolProfileStacks
  // 가 시드를 받아 풀별 9명 표본·순서를 추출(나는 시드 무관 0번 고정). MapMain은
  // freezeOnBlur로 unmount 안 되므로 한 세션 = 같은 9명, 앱 재실행 = 다른 9명.
  //
  // (회귀 정정 2026-05-21) 이전엔 useFocusEffect로 focus마다 새 시드를 발급했으나
  // 두 가지 비용을 일으킴:
  //   ① 초기 마운트에서 useFocusEffect도 fire → poolStacks가 2번 렌더 →
  //      stack overlay 비트맵 캡처 2배
  //   ② 다른 화면 갔다 돌아올 때마다 전체 마커 re-render
  // 화면 왕복 부담 제거 위해 mount-once로 전환.
  const [shuffleSeed] = React.useState(() =>
    Math.random().toString(36).slice(2),
  );

  // 카메라 추적 — 두 가지로 분리해서 불필요한 리렌더 방지:
  // (1) cameraRef: 최신 카메라 (lat/lng/zoom). 매 onCameraChanged마다 갱신. 리렌더 X.
  // (2) zoomInt: supercluster용 정수 zoom. 정수 변할 때만 setState → 리렌더.
  // 효과: 마커 탭/애니메이션 중 매 프레임 리렌더 60회+ → 정수 zoom 변화 시점만 (보통 2~3회).
  const cameraRef = React.useRef<Camera>(INITIAL_CAMERA);
  const [zoomInt, setZoomInt] = React.useState(Math.round(INITIAL_CAMERA.zoom));

  // (2026-05-21) 카메라 idle 게이팅 시도 → 깜빡임으로 거부. 비트맵 캡처
  // cascade는 이론적 우려였고 실제 frame drop이 측정되기 전까지 도입 X.
  // 사전 perf 하드닝은 사용자 체감 UI 우선 (대화 기록: ae259a8 → 2308948 →
  // 본 커밋에서 제거). 추후 진짜 느려지면 (a) avatar 비트맵 prefetch (b)
  // viewport bbox 좁히기 순. idle 게이팅은 후보에서 빼는 게 맞음.

  // 좌표 잡히면 첫 1회 카메라를 사용자 위치로 이동
  // 비-Gesture 이벤트에서 마지막으로 본 zoom — 사용자 핀치 시작 직전의 baseline.
  // animateCameraTo(Developer)/Control/Location 종료 시점에 갱신되고,
  // Gesture 이벤트는 이 값과의 누적 diff로 deselect 판정.
  const baselineZoomRef = React.useRef(INITIAL_CAMERA.zoom);

  // 목록 화면에서 풀 선택 후 복귀 시 — pendingFocus 소비해서 카메라 이동.
  const pendingFocusPoolId = useSelection((s) => s.pendingFocusPoolId);
  const clearPendingFocus = useSelection((s) => s.clearPendingFocus);

  const flewToUserOnce = React.useRef(false);
  React.useEffect(() => {
    if (flewToUserOnce.current) return;
    // 외부 포커스 요청(목록 → 지도에서 보기) 우선 — pendingFocus effect가 담당.
    if (useSelection.getState().pendingFocusPoolId) {
      flewToUserOnce.current = true;
      return;
    }
    // 지도 시작 위치 = 즐겨찾기 풀이면 그 풀로 시작 (geo 불필요).
    // 풀 데이터 로드 전이면 flag 미선점 → pools 도착 시 재실행.
    if (mapStartPoolId) {
      const sp = pools.find((p) => p.id === mapStartPoolId);
      if (sp) {
        flewToUserOnce.current = true;
        setTimeout(() => {
          mapRef.current?.animateCameraTo({
            latitude: sp.lat,
            longitude: sp.lng,
            zoom: 15,
            duration: 600,
          });
        }, 300);
      }
      return;
    }
    // 내 위치 — 좌표 잡히면 첫 1회 이동.
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
  }, [geo.status, geo.coords, mapStartPoolId, pools]);

  React.useEffect(() => {
    if (!pendingFocusPoolId) return;
    const target = pools.find((p) => p.id === pendingFocusPoolId);
    if (!target) return;
    // auto-fly보다 우선 동작하도록 flag 선점.
    flewToUserOnce.current = true;
    // 풀 데이터 fetch 후 호출되도록 setTimeout으로 살짝 지연.
    setTimeout(() => {
      mapRef.current?.animateCameraTo({
        latitude: target.lat,
        longitude: target.lng,
        zoom: Math.max(cameraRef.current.zoom, 15),
        duration: 400,
      });
      clearPendingFocus();
    }, 100);
  }, [pendingFocusPoolId, pools, clearPendingFocus]);

  const selectedPool = React.useMemo(
    () => pools.find((p) => p.id === selectedPoolId) ?? null,
    [pools, selectedPoolId],
  );

  const scheduleByPool = React.useMemo(
    () => new Map(schedules.map((s) => [s.poolId, s])),
    [schedules],
  );

  // 풀별 프로필 스택 — 나/친구 중 노출창(슬롯 시작 N 전 ~ 종료) 내 일정자.
  // N = prefs.mapFriendHorizon ('d1'/'h12'/'h6'). 'off'면 스택 전체 미표시(나 포함).
  // 친구 일정 소스 — naver-map race 회피로 mock 직접 사용
  // (위 import 코멘트 / [[naver_map_oob_mock_only]] 메모리). 노출/차단은
  // useFriends 경유. 실 서버 친구 일정 노출은 SDK race 해결 후 재진입 가능.
  const mySchedules = useSwimSchedules((s) => s.schedules);
  const friends = useFriends((s) => s.friends);
  const blocked = useFriends((s) => s.blocked);
  const favoriteIds = useFavorites((s) => s.ids);
  const otherSchedules = MOCK_OTHER_SCHEDULES;
  const poolStacks = React.useMemo<Map<string, PoolStack>>(
    () =>
      showStack
        ? buildPoolProfileStacks({
            pools,
            myProfile: profile,
            mySchedules,
            friends,
            blocked,
            otherSchedules,
            // 내 수영 일정·레슨 — Figma 179:4763. 2026-05-22 정책: 'off'/'self'
            // 옵션 폐기, 'friends'/'public' 둘 다 내 지도에서는 항상 표시.
            // 친구·전체 가시성 필터링은 서버단 Phase 2.
            showMine: true,
            myLessonPoolId: profile?.lessonPoolId ?? null,
            mySwimClasses: profile?.swimClasses ?? [],
            showMyLessons: true,
            otherLessons: MOCK_OTHER_LESSONS,
            friendHorizonMs: MAP_FRIEND_HORIZON_MS[mapFriendHorizon],
            publicHorizonMs: MAP_PUBLIC_HORIZON_MS[effectivePublicHorizon],
            shuffleSeed,
          })
        : new Map(),
    [
      pools,
      profile,
      mySchedules,
      friends,
      blocked,
      showStack,
      mapFriendHorizon,
      effectivePublicHorizon,
      otherSchedules,
      shuffleSeed,
    ],
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
    void logEvent('pool_marker_tap', { pool_id: poolId });
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
    // 정수 zoom 바뀔 때만 state 업데이트 → visibleClusters 재계산.
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

  // 시간표가 있는 풀만 조회 가능 — 없으면 'no_schedule' 비활성 CTA(액션 없음).
  const onScheduleAction = () => {
    if (!selectedPool) return;
    if (scheduleByPool.has(selectedPool.id)) {
      navigation.navigate('ScheduleView', { poolId: selectedPool.id });
    }
  };

  const flyToMyLocation = async () => {
    void logEvent('pool_search_my_location');

    const animate = (c: { lat: number; lng: number }) => {
      select(null); // 내 위치 이동은 다른 기능 사용으로 간주 → deselect
      mapRef.current?.animateCameraTo({
        latitude: c.lat,
        longitude: c.lng,
        // STACK_MIN_ZOOM(14) 일관 — 이동 직후 stack 즉시 가시화. 13 이었을 때는
        // 도착 후 사용자가 한 단계 더 줌인 필요했음.
        zoom: STACK_MIN_ZOOM,
        duration: 400,
      });
    };

    // 캐시 좌표가 있으면 즉시 이동(버튼 즉각 반응) + 백그라운드 fresh refresh.
    // 이전 구현은 await geo.request() 가 fresh fix 4초 타임아웃을 끝까지 기다려서
    // 사용자가 "버튼 누른 뒤 한참 있다 이동"으로 체감 — 그 지연 제거.
    if (geo.coords) {
      animate(geo.coords);
      void geo.request(); // fire-and-forget — 다음 탭 때 최신 좌표 사용
      return;
    }

    // 캐시 없는 첫 호출(콜드 스타트)만 fresh fix 까지 await.
    const fresh = await geo.request();
    if (fresh) animate(fresh);
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
        {/* 내 위치 마커 — 로그인이면 노란 원+프로필 사진(커스텀 children,
            Figma 130:3622, 50px), 로그아웃이면 marker-me-guest.png(노란 원+
            검은 팔벌린 사람 baked). 로그아웃 크기 = 25m 수영장 마커와 동일 47px
            (MARKER_SMALL size 47). 로그인은 50px 유지. */}
        {geo.status === 'granted' && geo.coords ? (
          <NaverMapMarkerOverlay
            latitude={geo.coords.lat}
            longitude={geo.coords.lng}
            {...(profile?.photoUri ? {} : { image: MARKER_ME_GUEST })}
            width={profile?.photoUri ? 50 : 47}
            height={profile?.photoUri ? 50 : 47}
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={5}
            caption={{
              text: profile?.name?.trim() || '내 위치',
              textSize: 14,
              color: tokens.color.ink900,
              haloColor: tokens.color.white,
              minZoom: 10,
            }}
            onTap={flyToMyLocation}
          >
            {profile?.photoUri ? (
              <LocationProfileMarker photoUri={profile.photoUri} />
            ) : null}
          </NaverMapMarkerOverlay>
        ) : null}

        {visibleClusters.map((c) => {
          const [lng, lat] = c.geometry.coordinates;

          // 클러스터 마커 — Figma 38:1866 (≤2자리) / 38:1870 (3자리+)
          // 카운트는 caption으로 marker 중앙에 겹침 (align Center). textSize는 자릿수 기준 가변.
          // .cluster는 ClusterFeature에만 있는 flag — TS 좁힘용 명시적 형 가드.
          if ('cluster' in c.properties && c.properties.cluster) {
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
            // Figma 91:9872 — 클러스터 카운트 텍스트: Plus Jakarta Bold 14/20 -0.084 #EAFF00.
            // Naver caption은 fontFamily/letterSpacing 미지원 — fontSize·color만 매칭.
            // 4자리(9999) 기준으로 34×34 원 안에 들어가도록 14 고정.
            const captionSize = 14;
            return (
              <NaverMapMarkerOverlay
                key={`cluster-${props.cluster_id}`}
                latitude={lat}
                longitude={lng}
                image={MARKER_CLUSTER}
                width={34}
                height={34}
                anchor={{ x: 0.5, y: 0.5 }}
                caption={{
                  text: countStr,
                  textSize: captionSize,
                  color: tokens.color.pdByellow,
                  haloColor: tokens.color.ink900,
                  // 'Center' align은 offset 무시 — 'Top' + 음수 offset으로 캡션을 마커 안 아래로 끌어내림.
                  // (양수=마커 위로 멀어짐, 음수=마커 안으로 내려옴)
                  // 시각 보정 -24.
                  align: 'Top',
                  offset: -24,
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
          const isHotel = !!p.isHotelPool;
          const isBig = (p.poolLength ?? 0) >= 50;
          const isFav = favoriteIds.includes(p.id);
          // 호텔 우선 → 50m 큰 풀 → 25m 작은 풀.
          // 즐겨찾기 시 하트 베이크 변종. 하트는 본체 좌상단으로 튀어나와 있어서
          // anchor를 본체 중앙(=풀 좌표)으로 보정해야 지도 위치와 정확히 일치.
          // 본체는 원본과 동일 크기, PNG가 하트만큼만 좌·상으로 더 큼.
          let img: number;
          let mw: number;
          let mh: number;
          let anchorX: number;
          let anchorY: number;
          if (isFav) {
            if (isHotel) {
              img = MARKER_HOTEL_FAV;
              mw = 51; mh = 48;
              // 본체 47×47, PNG 51×48 → 본체 시작 (4,1), 본체 중앙 (27.5, 24.5)
              anchorX = 27.5 / 51; anchorY = 24.5 / 48;
            } else if (isBig) {
              img = MARKER_BIG_FAV;
              mw = 58; mh = 55;
              // 본체 50×50, PNG 58×55 → 본체 시작 (8,5), 본체 중앙 (33, 30)
              anchorX = 33 / 58; anchorY = 30 / 55;
            } else {
              img = MARKER_SMALL_FAV;
              mw = 52; mh = 48;
              // 본체 47×47, PNG 52×48 → 본체 시작 (5,1), 본체 중앙 (28.5, 24.5)
              anchorX = 28.5 / 52; anchorY = 24.5 / 48;
            }
          } else {
            img = isHotel ? MARKER_HOTEL : isBig ? MARKER_BIG : MARKER_SMALL;
            const s = isBig && !isHotel ? 50 : 47;
            mw = s; mh = s;
            anchorX = 0.5; anchorY = 0.5;
          }
          // 스택 오버레이 위치 보정용 — 본체 사이즈 (PNG가 아닌 시각상 핀 크기).
          const size = isBig && !isHotel ? 50 : 47;
          const stack = poolStacks.get(p.id);
          // 핀(기존 그대로) + 같은 좌표에 스택 오버레이를 우측에 별도로 얹음.
          // 스택 오버레이 anchor={x:0,y:0.5}=좌-중앙이 좌표에 위치 → 투명
          // 스페이서(핀 절반+gap)만큼 우측으로 밀어 핀 오른쪽에 배치.
          return (
            <React.Fragment key={p.id}>
              <NaverMapMarkerOverlay
                latitude={p.lat}
                longitude={p.lng}
                image={img}
                width={mw}
                height={mh}
                anchor={{ x: anchorX, y: anchorY }}
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
              {stack &&
              stack.entries.length > 0 &&
              zoomInt >= STACK_MIN_ZOOM ? (
                <NaverMapMarkerOverlay
                  latitude={p.lat}
                  longitude={p.lng}
                  width={Math.round(size / 2 + STACK_PIN_GAP + STACK_W)}
                  height={STACK_H}
                  // Figma 173:13735 frame=flex items-end → 스택을 핀 '바텀'에
                  // 정렬. 핀은 anchor 중앙(0.5)이라 핀 하단 = 좌표 + size/2.
                  // 스택 박스(STACK_H) 하단이 핀 하단에 오도록 anchor.y 보정
                  // + STACK_LIFT 만큼 위로.
                  anchor={{ x: 0, y: 1 - (size / 2 - STACK_LIFT) / STACK_H }}
                  zIndex={isSelected ? 9 : 2}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: Math.round(size / 2 + STACK_PIN_GAP + STACK_W),
                      height: STACK_H,
                    }}
                  >
                    <View
                      style={{
                        width: Math.round(size / 2 + STACK_PIN_GAP),
                        height: STACK_H,
                      }}
                    />
                    <MapProfileStack
                      entries={stack.entries}
                      overflow={stack.overflow}
                    />
                  </View>
                </NaverMapMarkerOverlay>
              ) : null}
            </React.Fragment>
          );
        })}
      </NaverMapView>

      {/* Figma 38:1203 — 우측 FAB: 필터 / 내 위치 / 프로필 */}
      <View
        style={[styles.controls, { top: insets.top + 80 }]}
        pointerEvents="box-none"
      >
        {/* Figma 90:5957 — 필터 적용중 알약: 좌측 X(초기화, 지도 유지) + 우측 텍스트+아이콘(필터 화면으로) */}
        {filterActive ? (
          <View style={[styles.fab, styles.fabFilterPill]}>
            <Pressable
              onPress={() => {
                void logEvent('map_filter_clear');
                clearAllFilter();
              }}
              style={({ pressed }) => [
                styles.fabFilterReset,
                pressed && { opacity: 0.6 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="필터 해제"
              hitSlop={4}
            >
              <IconCloseCircle width={20} height={20} />
            </Pressable>
            <Pressable
              onPress={() => {
                select(null);
                navigation.navigate('PoolFilter');
              }}
              style={({ pressed }) => [
                styles.fabFilterMain,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="필터 설정 열기"
            >
              <Text style={styles.fabFilterActiveLabel}>필터 적용중</Text>
              <IconFilter width={20} height={20} color={tokens.color.pdByellow} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              select(null);
              navigation.navigate('PoolFilter');
            }}
            style={[styles.fab, styles.fabRound]}
            accessibilityRole="button"
            accessibilityLabel="수영장 검색 필터"
          >
            <IconFilter width={20} height={20} color={tokens.color.white} />
          </Pressable>
        )}
        <Pressable
          onPress={flyToMyLocation}
          style={[styles.fab, styles.fabRound]}
          accessibilityRole="button"
          accessibilityLabel="내 위치"
        >
          <IconLocate width={20} height={20} />
        </Pressable>
        {/* 수영 클럽 FAB — 로그인(프로필 있음) 한정. 프로필 FAB 바로 위.
         *  표기는 'C' 한 글자, 메뉴명은 "수영 클럽".
         *  bg ink900(#0F172A) + 'C' pdByellow(#EAFF00) — Figma 정합 색 규약. */}
        {profile ? (
          <Pressable
            onPress={() => navigation.navigate('ClubMain')}
            style={[styles.fab, styles.fabRound]}
            accessibilityRole="button"
            accessibilityLabel="수영 클럽"
          >
            <Text style={styles.fabClubLabel}>C</Text>
          </Pressable>
        ) : null}
        <View style={styles.profileFabWrap}>
          <Pressable
            onPress={() => {
              // 로그인(프로필 있음) → 내 정보, 비로그인 → Login.
              navigation.navigate(profile ? 'MyInfo' : 'Login');
            }}
            style={[
              styles.fab,
              styles.fabRound,
              profile?.photoUri ? styles.fabAvatar : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={profile ? '내 프로필' : '프로필 / 로그인'}
          >
            <ProfileFabContent photoUri={profile?.photoUri} />
          </Pressable>
          {/* 미열람 메시지 카운터 — 로그인 + 1+ 일 때만 (Figma 90:5963) */}
          {profile && unread > 0 ? (
            <View style={styles.unreadBadge} pointerEvents="none">
              <Text style={styles.unreadText}>
                {unread > 99 ? '99+' : unread}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* 하단 영역 — 풀 선택 시 카드, 선택 X면 "수영장 목록" 버튼 (Figma 101:1943) */}
      <SafeAreaView style={styles.bottomWrap} edges={['bottom']} pointerEvents="box-none">
        {selectedPool ? (
          // 풀 카드 — 일정카드 섹션이 길어지면 화면 초과 가능. 내부 스크롤로 처리.
          // maxHeight 65% 캡 → 지도 영역 일부 유지 + 카드 안에서 스크롤.
          <ScrollView
            style={styles.bottomScroll}
            contentContainerStyle={styles.bottomScrollContent}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>
        ) : (
          <Pressable
            onPress={() => navigation.navigate('PoolList')}
            style={({ pressed }) => [styles.poolListBtn, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="수영장 목록 보기"
          >
            <Text style={styles.poolListLabel}>수영장 목록 ({filteredPools.length})</Text>
            <IconLifeBuoy width={20} height={20} />
          </Pressable>
        )}
      </SafeAreaView>

      {/* 뒤로가기 종료 안내 토스트 — Figma 277:6852. 노출 5초 내 한 번 더
          뒤로가기 누르면 종료. 5초 경과 시 자동 사라짐 + armed 해제. */}
      {exitToastVisible ? (
        <Toast
          title="뒤로가기"
          message="한 번 더 뒤로가기를 하면 앱이 종료됩니다."
          autoDismissMs={EXIT_TOAST_MS}
          onDismiss={() => {
            setExitToastVisible(false);
            exitArmedRef.current = false;
          }}
          style={[
            styles.exitToast,
            { top: insets.top + 12 },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgCream },
  // 뒤로가기 종료 안내 토스트 위치 — 상단 safe-area 아래, 화면 좌우 16px 여백.
  // top은 insets.top + 12로 호출부에서 주입.
  exitToast: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 100,
  },
  controls: {
    position: 'absolute',
    right: tokens.layout.pagePadMobile,
    gap: tokens.space[2],
    alignItems: 'flex-end',
  },
  fab: {
    // Figma 90:6560 — bg #1F2937 (ink900, 순흑 X)
    backgroundColor: tokens.color.ink900,
  },
  fabRound: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'ios' ? tokens.shadow.md : { elevation: 4 }),
  },
  // C클럽 FAB 'C' 라벨 — Figma 정합. pdByellow(#EAFF00) 형광 노랑 on ink900 검정.
  // 색 규약 변경 금지(memory club_fab_color).
  fabClubLabel: {
    color: tokens.color.pdByellow,
    fontFamily: 'Pretendard-Bold',
    fontSize: 24,
    lineHeight: 28,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  // 프로필 FAB + 미열람 배지 래퍼 (배지가 FAB overflow에 안 잘리게 분리)
  profileFabWrap: { position: 'relative' },
  // Figma 90:5963 — 빨강 카운터 배지, FAB 우상단 모서리 겹침
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: tokens.color.red,
    borderWidth: 1.5,
    borderColor: tokens.color.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.white,
    textAlign: 'center',
  },
  // 로그인 시 — 아바타가 44원을 꽉 채우고 ink900 배경이 비치지 않게.
  // Figma 116:2822 — 아바타들과 동일하게 byellow 외곽선.
  fabAvatar: {
    overflow: 'hidden',
    backgroundColor: tokens.color.white,
    borderWidth: 2,
    borderColor: tokens.color.pdByellow,
  },
  fabAvatarImg: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  // 내 위치 마커 (Figma 130:3622) — marker-me.png 50 + 안쪽 34 프로필
  locMarker: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locRing: { ...StyleSheet.absoluteFillObject, width: 50, height: 50 },
  // 34 원형 — 노란 가장자리 (50-34)/2 = 8px 보임.
  // marker-me.png 시각 중심 보정: 프로필을 좌·상 1px씩 이동.
  locInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -1 }, { translateY: -1 }],
  },
  locInnerImg: { width: 34, height: 34 },
  // 필터 적용중 — 좌측 X(초기화) + 우측 텍스트+아이콘(설정), 하나의 알약처럼 보이는 통합 View
  fabFilterPill: {
    // 둥근 FAB(44)와 동일 높이 — 필터 적용/미적용 시 컬럼 y 어긋남 방지
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    overflow: 'hidden',
    ...(Platform.OS === 'ios' ? tokens.shadow.md : { elevation: 4 }),
  },
  // 좌측 X — 클릭 시 필터 초기화 (지도 유지)
  fabFilterReset: {
    height: '100%',
    paddingLeft: 12,
    paddingRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 우측 메인 — 클릭 시 필터 화면으로
  fabFilterMain: {
    height: '100%',
    paddingLeft: 4,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fabFilterActiveLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: tokens.color.pdByellow,
  },
  bottomWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  // 풀카드 내부 스크롤 — 화면 65% 캡(지도 일부 유지). 내용이 캡 안이면 콘텐츠
  // 크기로 줄어들고, 넘치면 카드 안에서 스크롤됨.
  bottomScroll: {
    maxHeight: Dimensions.get('window').height * 0.65,
  },
  bottomScrollContent: {
    flexGrow: 0,
  },
  // Figma 101:1943 — pd-byellow bg, radius 14, px 20 py 12, gap 10, content-sized 가운데
  poolListBtn: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    marginBottom: tokens.space[4],
    ...(Platform.OS === 'ios' ? tokens.shadow.md : { elevation: 4 }),
  },
  poolListLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
});
