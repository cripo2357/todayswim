// Figma 134:9837 / 168:3794 — 내 정보 > 친구 탭.
//
// 3섹션: ① 새 친구(요청 수락/거절 + 친구 추가 CTA) ② 친구들의 수영 일정
// (주간 달력 + 비공개 제외, '나도 참여' → 일정 추가) ③ 친구 목록(검색).
// 백엔드 미연동(Phase1): friends store 메모리. 친구 요청 보내기는 Phase2.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { XCircle, Plus, User } from 'lucide-react-native';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import IconUserDouble from '@assets/icons/user-double.svg';
import IconChatSmile from '@assets/icons/chat-bubble-smile.svg';
import IconIdBadgeWhite from '@assets/icons/id-badge-white.svg';
import { MOCK_OTHER_SCHEDULES } from '@/lib/mockData';
import { BUNDLE_AVATARS, type AvatarId } from '@/lib/avatars';
import { RejectFriendModal } from '@/components/friends/RejectFriendModal';
import { dispatchMessage } from '@/lib/messages/dispatch';
import { WeekCalendar } from '@/components/calendar/WeekCalendar';
import { useFriends, type FriendRequest } from '@/store/friends';
import { useSwimSchedules, dateKey } from '@/store/swimSchedule';
import { useAddScheduleIntent } from '@/store/addScheduleIntent';
import { usePools } from '@/hooks/usePools';
import { tokens } from '@/styles/tokens';

const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const SCREEN_H = Dimensions.get('window').height;

/** "YYYY-MM-DD","HH:MM" → "YYYY년 M월 D일(요일), 오전/오후 H:MM" */
function formatWhen(date: string, start: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dow = DOW[new Date(y, m - 1, d).getDay()];
  const [hh, mm] = start.split(':').map(Number);
  const ampm = hh < 12 ? '오전' : '오후';
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${y}년 ${m}월 ${d}일(${dow}), ${ampm} ${h12}:${String(mm).padStart(2, '0')}`;
}

interface FriendSlot {
  key: string;
  poolId: string;
  poolName: string;
  date: string;
  start: string;
  end: string;
  participants: { userId: string; name: string; avatar: AvatarId }[];
}

export function FriendsTab() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const requests = useFriends((s) => s.requests);
  const accept = useFriends((s) => s.accept);
  const reject = useFriends((s) => s.reject);
  const friends = useFriends((s) => s.friends);
  const blockedIds = useFriends((s) => s.blocked);
  const mySchedules = useSwimSchedules((s) => s.schedules);
  const setIntent = useAddScheduleIntent((s) => s.setIntent);
  const { data: pools } = usePools();
  const poolPhoto = (id: string) =>
    pools?.find((p) => p.id === id)?.photoUrl;

  const [rejectTarget, setRejectTarget] = React.useState<FriendRequest | null>(
    null,
  );

  // 내가 이미 참여한 슬롯 키 — 친구 일정에서 제외
  const mySlots = React.useMemo(
    () =>
      new Set(
        mySchedules.map((s) => `${s.poolId}|${s.date}|${s.start}|${s.end}`),
      ),
    [mySchedules],
  );

  // 친구의 '비공개 아님' 일정 슬롯(중복 참여자 묶음) — 내가 미참여인 것만
  const allFriendSlots = React.useMemo<FriendSlot[]>(() => {
    const blocked = new Set(blockedIds);
    // 예정 일정만 — 오늘 포함 30일(오늘 ~ 오늘+29). 지난 일정·범위 밖 제외.
    const t0 = new Date();
    t0.setHours(0, 0, 0, 0);
    const t29 = new Date(t0);
    t29.setDate(t29.getDate() + 29);
    const minD = dateKey(t0);
    const maxD = dateKey(t29);
    const m = new Map<string, FriendSlot>();
    for (const o of MOCK_OTHER_SCHEDULES) {
      if (!o.isFriend || o.visibility === 'private') continue;
      if (blocked.has(o.userId)) continue; // 차단 = 일정에서도 제외
      if (o.date < minD || o.date > maxD) continue; // 오늘~+29일만
      const key = `${o.poolId}|${o.date}|${o.start}|${o.end}`;
      if (mySlots.has(key)) continue;
      let g = m.get(key);
      if (!g) {
        g = {
          key,
          poolId: o.poolId,
          poolName: o.poolName,
          date: o.date,
          start: o.start,
          end: o.end,
          participants: [],
        };
        m.set(key, g);
      }
      if (!g.participants.some((p) => p.name === o.name)) {
        g.participants.push({
          userId: o.userId,
          name: o.name,
          avatar: o.avatar,
        });
      }
    }
    return [...m.values()].sort(
      (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start),
    );
  }, [mySlots, blockedIds]);

  // 기본 선택일 = 가장 이른 친구 일정 날짜(없으면 오늘)
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => {
    if (allFriendSlots.length === 0) return new Date();
    const [y, mo, d] = allFriendSlots[0].date.split('-').map(Number);
    return new Date(y, mo - 1, d);
  });

  // 주간 캘린더 이동 범위 — 오늘 포함 30일(오늘 ~ 오늘+29) 정책과 일치.
  const calMin = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const calMax = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 29);
    return d;
  }, []);

  const dayKey = dateKey(selectedDate);
  const daySlots = allFriendSlots.filter((s) => s.date === dayKey);

  // 친구 일정 있는 날짜만 캘린더에 dot (Figma 167:3714).
  const friendDateKeys = React.useMemo(
    () => new Set(allFriendSlots.map((s) => s.date)),
    [allFriendSlots],
  );

  // ── 친구 목록 검색 — 열면 친구목록을 상단으로 스크롤 후 그 자리에 float ──
  const scrollRef = React.useRef<ScrollView>(null);
  const [sectionY, setSectionY] = React.useState(0); // 친구목록 섹션 y(스크롤 콘텐츠 기준)
  const [triggerY, setTriggerY] = React.useState(0); // 트리거 y(섹션 기준)
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [draft, setDraft] = React.useState('');
  const [query, setQuery] = React.useState('');

  const openSearch = () => {
    setSearchOpen(true);
    // 스페이서가 렌더된 다음 프레임에 섹션을 화면 상단으로
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: sectionY, animated: true });
    });
  };

  const draftQ = draft.trim().toLowerCase();
  // 드롭다운 친구 목록도 항상 이름 가나다순 (목록과 동일 기준).
  const dropdownFriends = React.useMemo(() => {
    const base = draftQ
      ? friends.filter(
          (f) =>
            f.nickname.toLowerCase().includes(draftQ) ||
            f.name.toLowerCase().includes(draftQ),
        )
      : friends;
    return [...base].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [draftQ, friends]);
  const committedQ = query.trim().toLowerCase();
  // 친구 목록은 항상 이름 가나다순 (검색 필터 후에도 동일).
  const listFriends = React.useMemo(() => {
    const base = committedQ
      ? friends.filter(
          (f) =>
            f.nickname.toLowerCase().includes(committedQ) ||
            f.name.toLowerCase().includes(committedQ),
        )
      : friends;
    return [...base].sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }, [committedQ, friends]);

  const confirmReject = () => {
    if (!rejectTarget) return;
    void dispatchMessage('friend_request_rejected', { name: rejectTarget.name });
    reject(rejectTarget.id);
    setRejectTarget(null);
  };

  return (
    <>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!searchOpen}
      >
        {/* ── 새 친구 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>새 친구</Text>
          {requests.length > 0 ? (
            <View style={styles.list}>
              {requests.map((req) => (
                <View key={req.id} style={styles.card}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('OtherUserProfile', {
                        userId: req.id,
                      })
                    }
                    accessibilityRole="button"
                    accessibilityLabel={`${req.name} 프로필 보기`}
                  >
                    <Avatar size={40} avatarId={req.avatar} />
                  </Pressable>
                  <View style={styles.cardBody}>
                    <View style={styles.cardHeadGroup}>
                      <View style={styles.cardHead}>
                        <Text style={styles.notifTitle} numberOfLines={1}>
                          {req.name}
                        </Text>
                        <Text style={styles.time}>{req.time}</Text>
                      </View>
                      <View style={styles.lines}>
                        <Text style={styles.line}>
                          {req.name}님이 친구가 되고 싶어합니다.
                        </Text>
                        <Text style={styles.line}>
                          서로 친구로 추가하겠습니까?
                        </Text>
                      </View>
                    </View>
                    <View style={styles.actions}>
                      <Pressable
                        style={styles.badgeOutline}
                        onPress={() => setRejectTarget(req)}
                        accessibilityRole="button"
                        accessibilityLabel={`${req.name} 친구 요청 거절`}
                      >
                        <XCircle size={16} color="#4B5563" strokeWidth={2} />
                        <Text style={styles.badgeOutlineLabel}>거절</Text>
                      </Pressable>
                      <Pressable
                        style={styles.badgeOutline}
                        onPress={() => accept(req.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`${req.name} 친구로 등록`}
                      >
                        <IconUserDouble width={16} height={16} />
                        <Text style={styles.badgeOutlineLabel}>친구로 등록</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : null}

          {/* 친구 추가(요청 보내기) — Phase 2. 디자인대로 노출, 동작은 추후. */}
          <Pressable
            style={styles.cta}
            accessibilityRole="button"
            accessibilityLabel="친구 추가"
          >
            <Text style={styles.ctaLabel}>친구 추가</Text>
            <IconUserDouble width={20} height={20} />
          </Pressable>
        </View>

        {/* ── 친구들의 수영 일정 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            친구들의 수영 일정 ({allFriendSlots.length})
          </Text>
          <WeekCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            markedKeys={friendDateKeys}
            dotColor={tokens.color.pdBlue}
            minDate={calMin}
            maxDate={calMax}
            headerDivider
          />
          <View style={styles.list}>
            {daySlots.length > 0 ? (
              daySlots.map((s) => {
                const photo = poolPhoto(s.poolId);
                return (
                <View key={s.key} style={styles.schedCard}>
                  <View style={styles.schedTop}>
                    <View style={styles.schedInfo}>
                      <View style={styles.schedTitleBlock}>
                        <Text style={styles.schedPool} numberOfLines={1}>
                          {s.poolName}
                        </Text>
                        <Text style={styles.schedWhen} numberOfLines={1}>
                          {formatWhen(s.date, s.start)}
                        </Text>
                      </View>
                      <Pressable
                        style={styles.joinChip}
                        onPress={() =>
                          setIntent({
                            poolId: s.poolId,
                            date: s.date,
                            start: s.start,
                            end: s.end,
                          })
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`${s.poolName} ${formatWhen(s.date, s.start)} 나도 참여`}
                      >
                        <Text style={styles.joinChipLabel}>나도 참여</Text>
                        <Plus size={12} color={tokens.color.pdBlue} strokeWidth={2.4} />
                      </Pressable>
                    </View>
                    {photo ? (
                      <Image source={photo} style={styles.schedThumb} />
                    ) : (
                      <View style={styles.schedThumb} />
                    )}
                  </View>
                  <View style={styles.schedDivider} />
                  <View style={styles.schedFriends}>
                    {s.participants.map((p, i) => {
                      const Bundle = BUNDLE_AVATARS[p.avatar];
                      return (
                        <Pressable
                          key={i}
                          style={styles.miniRow}
                          onPress={() =>
                            navigation.navigate('OtherUserProfile', {
                              userId: p.userId,
                            })
                          }
                          accessibilityRole="button"
                          accessibilityLabel={`${p.name} 프로필 보기`}
                        >
                          <View style={styles.miniAvatar}>
                            {Bundle ? (
                              <Bundle width={24} height={24} />
                            ) : (
                              <User
                                size={12}
                                color={tokens.color.ink400}
                                strokeWidth={2}
                              />
                            )}
                          </View>
                          <Text style={styles.miniName} numberOfLines={1}>
                            {p.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
                );
              })
            ) : (
              <Text style={styles.empty}>
                선택한 날짜에 친구들의 수영 일정이 없습니다.
              </Text>
            )}
          </View>
        </View>

        {/* ── 친구 목록 ── */}
        <View
          style={styles.section}
          onLayout={(e) => setSectionY(e.nativeEvent.layout.y)}
        >
          <Text style={styles.sectionTitle}>친구 목록 ({friends.length})</Text>
          <View onLayout={(e) => setTriggerY(e.nativeEvent.layout.y)}>
          <Pressable
            onPress={openSearch}
            style={styles.searchTrigger}
            accessibilityRole="button"
            accessibilityLabel="닉네임으로 친구 검색"
          >
            <Text
              style={[
                styles.searchTriggerText,
                !query && styles.searchTriggerPlaceholder,
              ]}
              numberOfLines={1}
            >
              {query || '닉네임'}
            </Text>
            <IconChevronDown width={20} height={20} />
          </Pressable>
          </View>

          <View style={styles.list}>
            {listFriends.map((f) => (
              <View key={f.id} style={styles.friendRow}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('OtherUserProfile', { userId: f.id })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${f.name} 프로필 보기`}
                >
                  <Avatar size={48} avatarId={f.avatar} />
                </Pressable>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName} numberOfLines={1}>
                    {f.name}
                  </Text>
                  <View style={styles.friendStatusRow}>
                    <IconChatSmile width={20} height={20} />
                    <Text style={styles.friendStatus} numberOfLines={1}>
                      {f.status}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.profileBtn}
                  onPress={() =>
                    navigation.navigate('OtherUserProfile', { userId: f.id })
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${f.name} 프로필`}
                >
                  <Text style={styles.profileBtnLabel}>프로필</Text>
                  <IconIdBadgeWhite width={16} height={16} />
                </Pressable>
              </View>
            ))}
            {listFriends.length === 0 ? (
              <Text style={styles.empty}>검색 결과가 없어요.</Text>
            ) : null}
          </View>

          {/* 검색 float — 트리거 위치 anchor. 열 때 친구목록을 화면
              상단으로 스크롤(+하단 스페이서) → 키보드(하단)에 안 가림. */}
          {searchOpen ? (
            <>
              <Pressable
                style={styles.searchBackdrop}
                onPress={() => setSearchOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="친구 검색 닫기"
              />
              <View style={[styles.searchPanel, { top: triggerY }]}>
                <View style={styles.searchPill}>
                  <View style={styles.searchInputWrap}>
                    <TextInput
                      autoFocus
                      value={draft}
                      onChangeText={setDraft}
                      onSubmitEditing={() => {
                        setQuery(draft.trim());
                        setSearchOpen(false);
                      }}
                      returnKeyType="search"
                      style={styles.searchInput}
                    />
                    {draft.length === 0 ? (
                      <Text style={styles.searchPlaceholder} pointerEvents="none">
                        닉네임
                      </Text>
                    ) : null}
                  </View>
                  {draft.length > 0 ? (
                    <Pressable
                      onPress={() => setDraft('')}
                      hitSlop={8}
                      accessibilityRole="button"
                      accessibilityLabel="검색어 지우기"
                    >
                      <XCircle size={20} color="#94A3B8" strokeWidth={2} />
                    </Pressable>
                  ) : null}
                </View>
                <ScrollView
                  style={styles.searchList}
                  contentContainerStyle={styles.searchListContent}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="always"
                >
                  {dropdownFriends.map((f) => (
                    <Pressable
                      key={f.id}
                      style={styles.searchItem}
                      onPress={() => {
                        setQuery(f.name);
                        setDraft(f.name);
                        setSearchOpen(false);
                      }}
                    >
                      <Avatar size={32} avatarId={f.avatar} />
                      <Text style={styles.searchItemName} numberOfLines={1}>
                        {f.name}
                      </Text>
                      <Text style={styles.searchItemSub} numberOfLines={1}>
                        {f.status}
                      </Text>
                    </Pressable>
                  ))}
                  {dropdownFriends.length === 0 ? (
                    <Text style={styles.empty}>검색 결과가 없어요.</Text>
                  ) : null}
                </ScrollView>
              </View>
            </>
          ) : null}
        </View>

        {/* 검색 중에만: 마지막 섹션을 화면 상단까지 끌어올리기 위한 스페이서 */}
        {searchOpen ? <View style={{ height: SCREEN_H }} /> : null}
      </ScrollView>

      <RejectFriendModal
        visible={rejectTarget !== null}
        name={rejectTarget?.name ?? ''}
        onReject={confirmReject}
        onLater={() => setRejectTarget(null)}
      />
    </>
  );
}

function Avatar({ size, avatarId }: { size: number; avatarId?: AvatarId }) {
  const Bundle = avatarId ? BUNDLE_AVATARS[avatarId] : null;
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {Bundle ? (
        <Bundle width={size - 4} height={size - 4} />
      ) : (
        <User size={size * 0.5} color={tokens.color.ink400} strokeWidth={2} />
      )}
    </View>
  );
}

// RN 0.83 boxShadow(Shadow/md) — elevation 미사용. float 패널이 카드 위에
// 정상 표시되도록(Android elevation 스택 회피) + 레거시 shadow* 제거.
const SHADOW_MD = { ...tokens.shadow.md } as const;

const styles = StyleSheet.create({
  scroll: { padding: 16, gap: 32 },
  section: { gap: 12, position: 'relative' },
  sectionTitle: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  list: { gap: 12 },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 16,
  },

  // 새 친구 카드 — white r24 p16 Shadow/md
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 24,
    padding: 16,
    ...SHADOW_MD,
  },
  cardBody: { flex: 1, gap: 12 },
  cardHeadGroup: { gap: 6 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  notifTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  time: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  lines: { gap: 2 },
  line: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  actions: { flexDirection: 'row', gap: 12 },
  badgeOutline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeOutlineLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  // 친구 추가 CTA — pdByellow h48 r14
  cta: {
    height: 48,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
  },
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },

  avatar: {
    borderWidth: 2,
    borderColor: tokens.color.pdMint,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },

  // 친구 일정 카드 — white r16 p16 Shadow/lg, gap8
  schedCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    padding: 16,
    gap: 8,
    ...tokens.shadow.lg,
  },
  schedTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  schedInfo: { flex: 1, gap: 10, alignItems: 'flex-start' },
  schedTitleBlock: { gap: 4 },
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
  // Figma 167:3528 — 나도 참여: border pd-blue r8 px8 py4, Medium 12
  joinChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: tokens.color.pdBlue,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  joinChipLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.pdBlue,
  },
  schedThumb: {
    width: 74,
    height: 74,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  schedDivider: { height: 1, backgroundColor: tokens.color.lineDefault },
  // 참여자 목록 — 캘린더 일정 카드(CalendarTab ptGrid/ptCell)와 동일.
  // 1행 3명 고정(정확히 1/3 폭 → 화면 너비 무관, 좁은 기기 2열 붕괴 방지).
  schedFriends: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 8 },
  miniRow: {
    width: '33.333%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 8, // 열 간격(1/3 폭 유지 위해 내부 패딩)
  },
  // 프로필 테두리 정책 — 친구이므로 pd-mint. 테두리 항상 1px.
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: tokens.color.pdMint,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // CalendarTab ptName과 동일 — Medium 12/16 -0.06 #1F2937
  miniName: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansMedium,
    color: '#1F2937',
  },

  // 친구 목록 검색 트리거 — border #94A3B8 r14 minH48
  searchTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#94A3B8',
    backgroundColor: tokens.color.bgPaper,
  },
  searchTriggerText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  searchTriggerPlaceholder: { color: '#4B5563' },
  // 섹션 내 absolute float (트리거 y에 anchor). 섹션 position:relative.
  searchBackdrop: { ...StyleSheet.absoluteFillObject },
  searchPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
    padding: 8,
    gap: 4,
    ...tokens.shadow.lg,
  },
  searchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
  },
  searchInputWrap: { flex: 1, justifyContent: 'center' },
  searchInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    padding: 0,
  },
  searchPlaceholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    includeFontPadding: false,
  },
  searchList: { maxHeight: 260 },
  searchListContent: { gap: 4 },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    padding: 8,
    borderRadius: 12,
  },
  searchItemName: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  searchItemSub: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#94A3B8',
  },

  // 친구 행 (168:3855) — white r24 p12 h72 Shadow/md
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    height: 72,
    padding: 12,
    borderRadius: 24,
    backgroundColor: tokens.color.bgPaper,
    ...SHADOW_MD,
  },
  friendInfo: { flex: 1, gap: 4, justifyContent: 'center' },
  friendName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  friendStatusRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  friendStatus: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  // Figma 168:3872 — pd-mint bg r8 px10 py4
  profileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: tokens.color.pdMint,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  profileBtnLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.white,
  },
});
