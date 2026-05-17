// 지도 시작 위치 — Figma 179:4805.
//
// 내 위치(항상) + 즐겨찾는 수영장 목록 중 단일 선택. 핀=선택 표시
// (선택=pd-mint 채움 / 비선택=pd-gray 외곽). 선택값은 prefs.mapStartPoolId
// (null=내 위치). 즐겨찾기 해제 시 useFavorites가 시작위치를 null로 리셋.
// 즐겨찾기가 없으면 '즐겨찾는 수영장' 섹션은 표시하지 않음(선택지=내 위치뿐).

import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Pin, User } from 'lucide-react-native';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { tokens } from '@/styles/tokens';
import { usePrefs } from '@/store/prefs';
import { useFavorites } from '@/store/favorites';
import { useProfile } from '@/store/profile';
import { usePools } from '@/hooks/usePools';
import { BUNDLE_AVATARS, isBundleAvatar } from '@/lib/avatars';
import type { Pool } from '@/types/pool';

const AV = 42;

function PinIcon({ selected }: { selected: boolean }) {
  return (
    <Pin
      size={32}
      color={selected ? tokens.color.pdMint : tokens.color.pdGray}
      fill={selected ? tokens.color.pdMint : 'transparent'}
      strokeWidth={2}
    />
  );
}

/** 내 아바타 — 42 정사각 r6 (Figma 179:5033, 원형 아님). */
function MyAvatar({ photoUri }: { photoUri?: string }) {
  return (
    <View style={styles.thumb}>
      {isBundleAvatar(photoUri) ? (
        React.createElement(BUNDLE_AVATARS[photoUri], { width: AV, height: AV })
      ) : photoUri ? (
        <Image source={{ uri: photoUri }} style={styles.thumbImg} />
      ) : (
        <User size={22} color={tokens.color.ink400} strokeWidth={2} />
      )}
    </View>
  );
}

export function MapStartLocationScreen() {
  const navigation = useNavigation();
  const profile = useProfile((s) => s.profile);
  const favIds = useFavorites((s) => s.ids);
  const mapStartPoolId = usePrefs((s) => s.mapStartPoolId);
  const setMapStartPoolId = usePrefs((s) => s.setMapStartPoolId);
  const { data: poolsData } = usePools();

  const favoritePools: Pool[] = React.useMemo(() => {
    const pools = poolsData ?? [];
    return favIds
      .map((id) => pools.find((p) => p.id === id))
      .filter((p): p is Pool => !!p);
  }, [poolsData, favIds]);

  const meSelected = mapStartPoolId === null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        title="지도 시작 위치"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* 내 위치 */}
        <View style={styles.group}>
          <Text style={styles.groupLabel}>내 위치</Text>
          <Pressable
            onPress={() => setMapStartPoolId(null)}
            style={styles.card}
            accessibilityRole="button"
            accessibilityState={{ selected: meSelected }}
          >
            <View style={styles.cardLeft}>
              <MyAvatar photoUri={profile?.photoThumbUri ?? profile?.photoUri} />
              <View style={styles.cardText}>
                <Text style={styles.name} numberOfLines={1}>
                  {profile?.name?.trim() || '내 위치'}
                </Text>
              </View>
            </View>
            <PinIcon selected={meSelected} />
          </Pressable>
        </View>

        {/* 즐겨찾는 수영장 — 없으면 섹션 자체 미표시 */}
        {favoritePools.length > 0 ? (
          <View style={styles.group}>
            <Text style={styles.groupLabel}>즐겨찾는 수영장</Text>
            {favoritePools.map((p) => {
              const sel = mapStartPoolId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setMapStartPoolId(p.id)}
                  style={styles.card}
                  accessibilityRole="button"
                  accessibilityState={{ selected: sel }}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.thumb}>
                      {p.photoUrl ? (
                        <Image
                          source={p.photoUrl}
                          style={styles.thumbImg}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={styles.thumbPlaceholder} />
                      )}
                    </View>
                    <View style={styles.cardText}>
                      <Text style={styles.name} numberOfLines={1}>
                        {p.name}
                      </Text>
                      <Text style={styles.addr} numberOfLines={2}>
                        {p.address}
                      </Text>
                    </View>
                  </View>
                  <PinIcon selected={sel} />
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  // Figma 179:4816 — px16 py8 gap14
  body: { paddingHorizontal: 16, paddingVertical: 8, gap: 14 },
  // 섹션 (라벨 + 카드들). Figma gap 8
  group: { gap: 8 },
  // Figma 179:4989 — SemiBold 14/20 -0.084 #4B5563
  groupLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  // Figma 179:5031 — 흰 카드 r24 p12 gap16 + Shadow/md
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: tokens.color.white,
    borderRadius: 24,
    padding: 12,
    ...tokens.shadow.md,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  // 42 정사각 r6 (원형 아님 — Figma)
  thumb: {
    width: AV,
    height: AV,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: tokens.color.bgSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbImg: { width: AV, height: AV },
  thumbPlaceholder: {
    width: AV,
    height: AV,
    backgroundColor: tokens.color.bgSubtle,
  },
  cardText: { flex: 1, gap: 4, justifyContent: 'center' },
  // Figma 179:5035 — SemiBold 16/22 -0.112 #1F2937
  name: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  // Figma 179:5074 — Regular 12/16 -0.06 #1F2937
  addr: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
});
