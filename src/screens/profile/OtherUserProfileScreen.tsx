// 다른 사용자 프로필 — Figma 172:9735(신청가능)/11530(신청중)/
// 12010(신청받음)/10725(친구) + 차단 172:11694 / 친구삭제 172:11852.
// dim 배경 + 중앙 카드. 4상태는 CTA 버튼 + 상단 배지(차단/삭제)만 차이.
// 다양한 화면에서 사용자 아바타/이름 탭 → navigate('OtherUserProfile',{userId}).

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Plus, Users, CalendarCheck, Ban, Trash2 } from 'lucide-react-native';
import SwimmerGray from '@assets/icons/swimmer-gray.svg';
import IconUserTriple from '@assets/icons/user-triple.svg';
import type { RootStackParamList } from '@/navigation/types';
import { useFriends, friendRelation, type FriendRelation } from '@/store/friends';
import {
  getOtherProfile,
  profileLabels,
  formatWeeklyAvg,
  upcomingSchedulesFor,
} from '@/lib/otherProfile';
import { useSwimSchedules } from '@/store/swimSchedule';
import { useAddScheduleIntent } from '@/store/addScheduleIntent';
import { usePools } from '@/hooks/usePools';
import { BUNDLE_AVATARS } from '@/lib/avatars';
import { ConfirmFriendActionModal } from '@/components/friends/ConfirmFriendActionModal';
import { FriendRequestSentModal } from '@/components/friends/FriendRequestSentModal';
import { tokens } from '@/styles/tokens';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

function formatWhen(date: string, start: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
  const [hh, mm] = start.split(':').map(Number);
  const ampm = hh < 12 ? '오전' : '오후';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${y}년 ${m}월 ${d}일(${dow}) ${ampm} ${h12}:${String(mm).padStart(2, '0')}`;
}

// CTA: 상태별 라벨/색/동작. (Figma 172:9735/12010/11530)
// friend(172:10725)은 버튼 자체가 없음 → null.
type CtaConfig = {
  label: string;
  icon: 'plus' | 'users';
  yellow: boolean;
  action: 'send' | 'accept' | 'none';
};
function ctaConfig(rel: FriendRelation): CtaConfig | null {
  switch (rel) {
    case 'none':
      return { label: '친구 신청', icon: 'plus', yellow: true, action: 'send' };
    case 'incoming':
      return { label: '친구 신청 동의하고 친구하기', icon: 'users', yellow: true, action: 'accept' };
    case 'outgoing':
      return { label: '친구 신청 동의를 기다리고 있습니다', icon: 'users', yellow: false, action: 'none' };
    case 'friend':
    default:
      return null;
  }
}

export function OtherUserProfileScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { userId } =
    useRoute<RouteProp<RootStackParamList, 'OtherUserProfile'>>().params;

  const fStore = useFriends();
  const rel = friendRelation(fStore, userId);

  const profile = React.useMemo(() => getOtherProfile(userId), [userId]);
  const isFriend = rel === 'friend';
  const labels = profile ? profileLabels(profile) : [];
  const schedules = React.useMemo(
    () => (profile ? upcomingSchedulesFor(userId, isFriend) : []),
    [profile, userId, isFriend],
  );

  const mySchedules = useSwimSchedules((s) => s.schedules);
  const mySlots = React.useMemo(
    () =>
      new Set(
        mySchedules.map((s) => `${s.poolId}|${s.date}|${s.start}|${s.end}`),
      ),
    [mySchedules],
  );
  const setIntent = useAddScheduleIntent((s) => s.setIntent);
  const { data: pools } = usePools();
  const poolPhoto = (id: string) => pools?.find((p) => p.id === id)?.photoUrl;

  const [modal, setModal] = React.useState<null | 'block' | 'delete'>(null);
  // 친구 신청 직후 '친구 추가 요청 완료'(169:5727) 표시
  const [sentOpen, setSentOpen] = React.useState(false);
  const close = () => navigation.goBack();

  if (!profile || rel === 'blocked') {
    return (
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <View style={styles.card}>
          <Text style={styles.bio}>차단했거나 조회할 수 없는 사용자입니다.</Text>
        </View>
      </View>
    );
  }

  const cta = ctaConfig(rel);
  const onCta = () => {
    if (!cta) return;
    if (cta.action === 'send') {
      fStore.sendRequest(userId);
      setSentOpen(true);
    } else if (cta.action === 'accept') fStore.accept(userId);
  };
  const onJoin = (poolId: string, date: string, start: string, end: string) => {
    setIntent({ poolId, date, start, end });
    close();
  };

  return (
    <View style={styles.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      <View style={styles.card}>
        {/* 상단-좌 배지: 친구=삭제(휴지통) / 그 외=차단(금지). Figma 172:11658 pd-gray */}
        <Pressable
          onPress={() => setModal(isFriend ? 'delete' : 'block')}
          style={styles.topBadge}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFriend ? '친구 삭제' : '차단'}
        >
          {isFriend ? (
            <Trash2 size={20} color={tokens.color.white} strokeWidth={2} />
          ) : (
            <Ban size={20} color={tokens.color.white} strokeWidth={2} />
          )}
        </Pressable>

        {/* Figma 172:10637 — gap 32 (프로필 블록 / 예정 일정) */}
        <View style={styles.outer}>
          {/* Figma 172:10715 — gap 13 (아바타 / 그룹) */}
          <View style={styles.profileBlock}>
            {/* 아바타 80, border-2 — 외곽선=관계(친구 mint / 비친구 gray) */}
            <View
              style={[
                styles.avatar,
                {
                  borderColor: isFriend
                    ? tokens.color.pdMint
                    : tokens.color.pdGray,
                },
              ]}
            >
              {React.createElement(BUNDLE_AVATARS[profile.avatar], {
                width: 76,
                height: 76,
              })}
            </View>

            {/* Figma 172:10640 — gap 20 (이름/소개·칩·스탯·CTA) */}
            <View style={styles.group20}>
              {/* Figma 172:10641 — gap 4 (이름 + 한 줄 소개) */}
              <View style={styles.nameGroup}>
                <Text style={styles.name} numberOfLines={1}>
                  {profile.name}
                </Text>
                <Text style={styles.bio} numberOfLines={2}>
                  {profile.bio}
                </Text>
              </View>

              {labels.length > 0 ? (
                <View style={styles.chips}>
                  {labels.map((l) => (
                    <View key={l} style={styles.chip}>
                      <Text style={styles.chipText}>{l}</Text>
                    </View>
                  ))}
                </View>
              ) : null}

              {/* Figma 172:10644 — 3열, 사이 #CBD5E1 구분선. 평균 수영시간은
                  미노출 기간(가입 32일 미만 등 weeklyAvgHours=null)엔 칸 전체
                  (아이콘/값/라벨/구분선) 미표시 — 사용자 확정. 아이콘 색은
                  Figma Gray/40(#94A3B8), 수영친구는 user-triple. */}
              <View style={styles.stats}>
                {profile.weeklyAvgHours != null ? (
                  <View style={[styles.stat, styles.statDivider]}>
                    <SwimmerGray width={24} height={24} />
                    <Text style={styles.statValue}>
                      {formatWeeklyAvg(profile)}
                    </Text>
                    <Text style={styles.statLabel}>평균 수영시간</Text>
                  </View>
                ) : null}
                <View style={[styles.stat, styles.statDivider]}>
                  <CalendarCheck size={24} color="#94A3B8" strokeWidth={2} />
                  <Text style={styles.statValue}>
                    {profile.showServiceYears
                      ? profile.serviceYears < 1
                        ? '1년 미만'
                        : `${profile.serviceYears}년`
                      : '비공개'}
                  </Text>
                  <Text style={styles.statLabel}>수영 기간</Text>
                </View>
                <View style={styles.stat}>
                  <IconUserTriple width={24} height={24} />
                  <Text style={styles.statValue}>
                    {profile.friendCount > 999
                      ? '+999명'
                      : `${profile.friendCount.toLocaleString()}명`}
                  </Text>
                  <Text style={styles.statLabel}>수영 친구</Text>
                </View>
              </View>

              {cta ? (
                <Pressable
                  onPress={onCta}
                  disabled={cta.action === 'none'}
                  style={({ pressed }) => [
                    styles.cta,
                    cta.yellow ? styles.ctaYellow : styles.ctaBlue,
                    pressed && cta.action !== 'none' && { opacity: 0.85 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={cta.label}
                >
                  <Text
                    style={[
                      styles.ctaLabel,
                      cta.yellow ? styles.ctaLabelDark : styles.ctaLabelLight,
                    ]}
                  >
                    {cta.label}
                  </Text>
                  {cta.icon === 'plus' ? (
                    <Plus
                      size={20}
                      color={cta.yellow ? tokens.color.black : tokens.color.white}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <Users
                      size={20}
                      color={cta.yellow ? tokens.color.black : tokens.color.white}
                      strokeWidth={2}
                    />
                  )}
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* 예정된 수영 일정 — Figma 172:10662 gap 16 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>예정된 수영 일정</Text>
            {schedules.length === 0 ? (
              <Text style={styles.empty}>예정된 수영 일정이 없습니다.</Text>
            ) : (
              // 일정 많아도 모달이 무한정 길어지지 않게 ~2.3개만 보이고 스크롤
              // (바깥 ScrollView 제거 → 단일 스크롤러라 중첩 충돌 없음)
              <ScrollView
                style={styles.schedScroll}
                contentContainerStyle={styles.schedScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {schedules.map((s) => {
                  const mine = mySlots.has(
                    `${s.poolId}|${s.date}|${s.start}|${s.end}`,
                  );
                  const photo = poolPhoto(s.poolId);
                  return (
                    <View key={s.id} style={styles.schedCard}>
                      <View style={styles.schedInfo}>
                        <View style={styles.schedTextBlock}>
                          <Text style={styles.schedPool} numberOfLines={1}>
                            {s.poolName}
                          </Text>
                          <Text style={styles.schedWhen} numberOfLines={1}>
                            {formatWhen(s.date, s.start)}
                          </Text>
                        </View>
                        {mine ? (
                          <View style={[styles.joinChip, styles.joinChipFilled]}>
                            <Text style={styles.joinChipFilledText}>
                              나도 참여한 일정
                            </Text>
                          </View>
                        ) : (
                          <Pressable
                            onPress={() =>
                              onJoin(s.poolId, s.date, s.start, s.end)
                            }
                            style={styles.joinChip}
                            accessibilityRole="button"
                            accessibilityLabel={`${s.poolName} 나도 참여`}
                          >
                            <Text style={styles.joinChipText}>나도 참여</Text>
                            <Plus size={12} color={tokens.color.pdBlue} strokeWidth={2.4} />
                          </Pressable>
                        )}
                      </View>
                      {photo ? (
                        <Image source={photo} style={styles.schedThumb} />
                      ) : (
                        <View style={styles.schedThumb} />
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
        </View>
      </View>

      <ConfirmFriendActionModal
        visible={modal === 'block'}
        title={`${profile.name} 차단`}
        descLines={[
          '차단하면 서로에게 모든 정보가 비공개되며,',
          '영구 차단이므로 차단 해제 불가합니다.',
          '차단은 신중하게 결정하세요.',
        ]}
        primaryLabel="네, 차단합니다"
        onPrimary={() => {
          fStore.block(userId);
          setModal(null);
          close();
        }}
        secondaryLabel="나중에 결정하겠습니다."
        secondaryIcon="hourglass"
        onSecondary={() => setModal(null)}
        onClose={() => setModal(null)}
      />
      <ConfirmFriendActionModal
        visible={modal === 'delete'}
        title={`${profile.name} 친구 삭제`}
        descLines={[
          '친구를 삭제하겠습니까?',
          '삭제해도 나중에 다시 친구 추가 가능합니다.',
        ]}
        primaryLabel="네, 삭제합니다"
        onPrimary={() => {
          fStore.removeFriend(userId);
          setModal(null);
          close();
        }}
        secondaryLabel="차단하고 싶습니다."
        secondaryIcon="ban"
        onSecondary={() => setModal('block')}
        onClose={() => setModal(null)}
      />
      <FriendRequestSentModal
        visible={sentOpen}
        name={profile.name}
        onClose={() => {
          setSentOpen(false);
          close();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // 딤 + 중앙 카드. 바깥 ScrollView 없음 → 딤(absoluteFill Pressable)이
  // 카드 밖 어디든 탭 받아 닫힘. 일정 목록만 내부 스크롤(중첩 충돌 없음).
  root: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 32,
  },
  // Figma 172:9736 — 흰 카드 r32 p16 w343 (gap 없음 — 내부 계층별 명시 간격)
  card: {
    position: 'relative',
    width: '100%',
    maxWidth: 343,
    backgroundColor: tokens.color.white,
    borderRadius: 32,
    padding: 16,
    alignItems: 'center',
  },
  // Figma 172:10637 / 10715 / 10640 / 10641 — 계층별 간격
  outer: { width: '100%', alignItems: 'center', gap: 32 },
  profileBlock: { width: '100%', alignItems: 'center', gap: 13 },
  group20: { width: '100%', alignItems: 'center', gap: 20 },
  nameGroup: { width: '100%', alignItems: 'center', gap: 4 },
  // Figma 172:11658 — 상단-좌 배지 pd-gray r9 px10 py4
  topBadge: {
    position: 'absolute',
    left: 16,
    top: 16,
    backgroundColor: tokens.color.pdGray,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 2,
  },
  // Figma 172:10639 — 80 원형, border 2(관계색). profile_border_policy.
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  // Figma 172:10642 — Bold 24/32 -0.288 #1F2937
  name: {
    fontFamily: tokens.font.sansBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 172:10643 — Regular 14/20 -0.084 #4B5563
  bio: {
    fontFamily: tokens.font.sans,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Figma 172:11306 — flex-wrap gap8
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  // Figma 172:11307 — pd-mint bg, px10 py4 r9
  chip: {
    backgroundColor: tokens.color.pdMint,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  // Medium 14/20 -0.084 white
  chipText: {
    fontFamily: tokens.font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: tokens.color.white,
  },
  // Figma 172:10644 — 3열, 첫 2열 우측 #CBD5E1 구분선
  stats: { flexDirection: 'row', alignSelf: 'stretch' },
  stat: { flex: 1, alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  statDivider: { borderRightWidth: 1, borderRightColor: '#CBD5E1' },
  // 일정 목록 — ~2.3개(카드 ≈112 + gap12)만 보이고 나머지는 스크롤.
  // 모달 전체가 일정 수에 따라 무한정 길어지는 것 방지.
  // 카드 boxShadow 가 내부 ScrollView 뷰포트에 잘려 어색했음(#8) — 콘텐츠에
  // 좌우/상하 여백을 주고 스크롤 컨테이너를 음수 마진으로 당겨 카드 폭은 유지.
  schedScroll: { alignSelf: 'stretch', maxHeight: 280, marginHorizontal: -12 },
  schedScrollContent: { gap: 12, paddingHorizontal: 12, paddingVertical: 8 },
  // Figma 172:10647 — Bold 20/28 -0.2 #1F2937
  statValue: {
    fontFamily: tokens.font.sansBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: -0.2,
    color: '#1F2937',
    textAlign: 'center',
  },
  // Figma 172:10648 — Regular 14/20 -0.084 #4B5563
  statLabel: {
    fontFamily: tokens.font.sans,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#4B5563',
    textAlign: 'center',
  },
  // Figma 172:10717 — CTA r12 px16 py10 gap8
  cta: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ctaYellow: { backgroundColor: tokens.color.pdByellow },
  ctaBlue: { backgroundColor: tokens.color.pdBlue },
  ctaLabel: {
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
  },
  ctaLabelDark: { color: tokens.color.black },
  ctaLabelLight: { color: tokens.color.white },
  // Figma 172:10662 — gap16 (위 프로필과 간격은 outer gap32가 처리)
  section: { alignSelf: 'stretch', gap: 16 },
  sectionTitle: {
    fontFamily: tokens.font.sansBold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: '#1F2937',
  },
  empty: {
    fontFamily: tokens.font.sans,
    fontSize: 14,
    color: tokens.color.ink500,
  },
  // Figma 172:10665 — white r16 p16 shadow.lg
  // Figma 172:10668 — inner items-start (텍스트/칩 블록과 썸네일 상단 정렬).
  schedCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: tokens.color.white,
    borderRadius: 16,
    padding: 16,
    ...tokens.shadow.lg,
  },
  schedInfo: { flex: 1, gap: 10 },
  schedTextBlock: { gap: 4 },
  schedPool: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  schedWhen: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  joinChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: tokens.color.pdBlue,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  joinChipText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdBlue,
  },
  joinChipFilled: {
    backgroundColor: tokens.color.pdBlue,
  },
  joinChipFilledText: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.white,
  },
  schedThumb: {
    width: 74,
    height: 74,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
});
