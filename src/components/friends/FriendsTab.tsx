// Figma 134:9837 / 168:3794 — 내 정보 > 친구 탭.
//
// 3섹션: ① 새 친구(요청 수락/거절 + 친구 추가 CTA) ② 친구들의 수영 일정
// (주간 달력 + 비공개 제외, '나도 참여' → 일정 추가) ③ 친구 목록(검색).
// 백엔드 미연동(Phase1): friends store 메모리. 친구 요청 보내기는 Phase2.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, Dimensions, Image,
  type NativeSyntheticEvent, type NativeScrollEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { XCircle, Plus } from 'lucide-react-native';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import IconUserDouble from '@assets/icons/user-double.svg';
import IconIdBadgeWhite from '@assets/icons/id-badge-white.svg';
import { type MockAccount } from '@/lib/mockData';
import { useOtherSchedules } from '@/hooks/useOtherSchedules';
import { resolveAvatarUri } from '@/lib/avatars';
import { Avatar as UiAvatar } from '@/components/ui/Avatar';
import { useFriendList } from '@/hooks/useFriendList';
import { RejectFriendModal } from '@/components/friends/RejectFriendModal';
import { AddFriendSheet } from '@/components/friends/AddFriendSheet';
import { FriendRequestSentModal } from '@/components/friends/FriendRequestSentModal';
import { dispatchMessage, dispatchMessageTo } from '@/lib/messages/dispatch';
import { useProfile } from '@/store/profile';
import { WeekCalendar } from '@/components/calendar/WeekCalendar';
import { useFriends, type FriendRequest } from '@/store/friends';
import { useSwimSchedules, dateKey } from '@/store/swimSchedule';
import { useAddScheduleIntent } from '@/store/addScheduleIntent';
import { usePools } from '@/hooks/usePools';
import type { Pool } from '@/types/pool';
import { tokens } from '@/styles/tokens';
import { formatDateTime } from '@/lib/dateFormat';

const SCREEN_H = Dimensions.get('window').height;

/** "YYYY-MM-DD","HH:MM" → 앱 통일 "YY.MM.DD(요일) 오전/오후 H:MM". */
function formatWhen(date: string, start: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = start.split(':').map(Number);
  return formatDateTime(new Date(y, m - 1, d, hh, mm));
}

interface FriendSlot {
  key: string;
  poolId: string;
  poolName: string;
  date: string;
  start: string;
  end: string;
  participants: {
    userId: string;
    nickname: string;
    avatar: string;
    avatarThumb?: string;
  }[];
}

export function FriendsTab() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // 친구 탭 진입(mount)마다 서버 동기 — 상대가 한 친구 추가/삭제를 반영.
  // (로컬 우선 store라 App.tsx 콜드시작 외엔 자동 갱신이 없던 갭 보완. 탭은
  //  MyInfoScreen에서 조건부 렌더라 진입 시 mount → 이 effect 1회 실행.)
  React.useEffect(() => {
    void useFriends.getState().serverSync();
  }, []);
  const requests = useFriends((s) => s.requests);
  const accept = useFriends((s) => s.accept);
  const reject = useFriends((s) => s.reject);
  const friends = useFriends((s) => s.friends);
  const blockedIds = useFriends((s) => s.blocked);
  // 차단 제외 가시 친구 수 — 0이면 친구 일정/목록 영역 모두 hide.
  const visibleFriendCount = React.useMemo(() => {
    const blocked = new Set(blockedIds);
    return friends.filter((f) => !blocked.has(f.id)).length;
  }, [friends, blockedIds]);
  // 새 친구 추가 시트 + 요청완료 모달(169:5727 재사용) 상태
  const [addOpen, setAddOpen] = React.useState(false);
  const [sentName, setSentName] = React.useState<string | null>(null);
  const mySchedules = useSwimSchedules((s) => s.schedules);
  const setIntent = useAddScheduleIntent((s) => s.setIntent);
  const otherSchedules = useOtherSchedules();
  const { data: pools } = usePools();
  // 풀 사진 lookup — 매 카드 렌더마다 pools.find() 선형 탐색하던 비효율
  // 제거 (perf #2). pools 가 안 바뀌면 같은 Map 재사용.
  const poolPhotoMap = React.useMemo(() => {
    const m = new Map<string, Pool['photoUrl']>();
    for (const p of pools ?? []) m.set(p.id, p.photoUrl);
    return m;
  }, [pools]);

  // 다른 사용자 프로필 진입 — 셀마다 새 화살표 함수 만들지 말고 userId
  // 인자 받는 안정 콜백 1회 생성 (perf #2 셀 memo 친화).
  const handleOpenProfile = React.useCallback(
    (userId: string) => {
      navigation.navigate('OtherUserProfile', { userId });
    },
    [navigation],
  );

  // 친구 일정 "나도 참여" — slot 데이터 받아 intent 설정 (perf #2).
  const handleJoinSlot = React.useCallback(
    (poolId: string, date: string, start: string, end: string) => {
      setIntent({ poolId, date, start, end });
    },
    [setIntent],
  );

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
    for (const o of otherSchedules) {
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
      if (!g.participants.some((p) => p.nickname === o.nickname)) {
        g.participants.push({
          userId: o.userId,
          nickname: o.nickname,
          avatar: o.avatar,
          avatarThumb: o.avatarThumb,
        });
      }
    }
    return [...m.values()].sort(
      (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start),
    );
  }, [mySlots, blockedIds, otherSchedules]);

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
  // 친구 목록 페이지네이션 seam — 12개씩 윈도잉 + 검색. Phase2: 이 훅의
  // 구현만 서버 커서/검색으로 교체(이 컴포넌트 무수정). friends_scalability.
  const {
    items: pagedFriends,
    hasMore: friendsHasMore,
    loadMore: loadMoreFriends,
    query,
    setQuery,
  } = useFriendList();
  const onOpenProfile = React.useCallback(
    (userId: string) => navigation.navigate('OtherUserProfile', { userId }),
    [navigation],
  );
  const onListScroll = React.useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!friendsHasMore) return;
      const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
      if (
        layoutMeasurement.height + contentOffset.y >=
        contentSize.height - 400
      ) {
        loadMoreFriends();
      }
    },
    [friendsHasMore, loadMoreFriends],
  );

  const openSearch = () => {
    setSearchOpen(true);
    // 스페이서가 렌더된 다음 프레임에 섹션을 화면 상단으로
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: sectionY, animated: true });
    });
  };

  const draftQ = draft.trim().toLowerCase();
  // 드롭다운 친구 목록도 항상 닉네임 가나다순 (목록과 동일 기준).
  const dropdownFriends = React.useMemo(() => {
    const base = draftQ
      ? friends.filter((f) => f.nickname.toLowerCase().includes(draftQ))
      : friends;
    return [...base].sort((a, b) => a.nickname.localeCompare(b.nickname, 'ko'));
  }, [draftQ, friends]);
  // 친구 목록 정렬·필터·페이징은 useFriendList(pagedFriends)가 담당.

  const confirmReject = () => {
    if (!rejectTarget) return;
    void dispatchMessage('friend_request_rejected', { name: rejectTarget.nickname });
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
        onScroll={onListScroll}
        scrollEventThrottle={16}
      >
        {/* ── 새 친구 ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>새 친구</Text>
          {requests.length > 0 ? (
            <View style={styles.list}>
              {requests.map((req) => (
                <View key={req.id} style={styles.card}>
                  <Pressable
                    onPress={() => handleOpenProfile(req.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${req.nickname} 프로필 보기`}
                  >
                    <Avatar size={40} avatarId={req.avatar} />
                  </Pressable>
                  <View style={styles.cardBody}>
                    <View style={styles.cardHeadGroup}>
                      <View style={styles.cardHead}>
                        <Text style={styles.notifTitle} numberOfLines={1}>
                          {req.nickname}
                        </Text>
                        <Text style={styles.time}>{req.time}</Text>
                      </View>
                      <View style={styles.lines}>
                        <Text style={styles.line}>
                          {req.nickname}님이 친구가 되고 싶어합니다.
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
                        accessibilityLabel={`${req.nickname} 친구 요청 거절`}
                      >
                        <XCircle size={16} color="#4B5563" strokeWidth={2} />
                        <Text style={styles.badgeOutlineLabel}>거절</Text>
                      </Pressable>
                      <Pressable
                        style={styles.badgeOutline}
                        onPress={() => {
                          accept(req.id);
                          // P2: friend_request_accepted 양측 적재. 본문의 {name}이
                          // 양측에서 달라(나=상대닉, 상대=내닉) 명시적 두 번 호출.
                          const my = useProfile.getState().profile;
                          // 아바타도 양측 다름: 내 카드=신청자 / 신청자 카드=나.
                          void dispatchMessage(
                            'friend_request_accepted',
                            { name: req.nickname },
                            { senderAvatar: req.avatar },
                          );
                          if (my?.name) {
                            void dispatchMessageTo(
                              req.id,
                              'friend_request_accepted',
                              { name: my.name },
                              { senderUserId: my.id, senderAvatar: my.photoUri },
                            );
                          }
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={`${req.nickname} 친구로 등록`}
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

          {/* 새 친구 추가 — 시트 오픈 (Figma 134:9837 / 168:7488) */}
          <Pressable
            onPress={() => setAddOpen(true)}
            style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
            accessibilityRole="button"
            accessibilityLabel="새 친구 추가"
          >
            <Text style={styles.ctaLabel}>새 친구 추가</Text>
            <IconUserDouble width={20} height={20} />
          </Pressable>
        </View>

        {/* ── 친구들의 수영 일정 ── 친구 0명이면 영역 자체 숨김 */}
        {visibleFriendCount > 0 ? (
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
                // Map lookup — 옛 pools.find() 선형 탐색 제거 (perf #2).
                const photo = poolPhotoMap.get(s.poolId);
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
                        onPress={() => handleJoinSlot(s.poolId, s.date, s.start, s.end)}
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
                    {s.participants.map((p, i) => (
                      <Pressable
                        key={i}
                        style={styles.miniRow}
                        onPress={() => handleOpenProfile(p.userId)}
                        accessibilityRole="button"
                        accessibilityLabel={`${p.nickname} 프로필 보기`}
                      >
                        <View style={styles.miniAvatar}>
                          <Image
                            source={{
                              uri: resolveAvatarUri(p.avatar, {
                                thumbUri: p.avatarThumb,
                                size: 24,
                              }),
                            }}
                            style={styles.miniAvatarImg}
                            resizeMode="cover"
                          />
                        </View>
                        <Text style={styles.miniName} numberOfLines={1}>
                          {p.nickname}
                        </Text>
                      </Pressable>
                    ))}
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
        ) : null}

        {/* ── 친구 목록 ── 친구 0명이면 영역 자체 숨김 */}
        {visibleFriendCount > 0 ? (
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
            {pagedFriends.map((f) => (
              <FriendRow key={f.id} friend={f} onOpen={onOpenProfile} />
            ))}
            {pagedFriends.length === 0 ? (
              <Text style={styles.empty}>검색 결과가 없어요.</Text>
            ) : null}
          </View>
        </View>
        ) : null}

        {/* 검색 중에만: 마지막 섹션을 화면 상단까지 끌어올리기 위한 스페이서 */}
        {searchOpen ? <View style={{ height: SCREEN_H }} /> : null}

        {/* 검색 float — ScrollView 직속. backdrop은 contentContainer 전체에
            깔려 패널 밖 어디를 탭해도 닫힘. 패널은 sectionY+triggerY로 트리거
            위치에 anchor. 패널/backdrop을 섹션 안에 두면 섹션 바깥(스페이서
            등)이 닫기 영역에서 빠지는 회귀가 생긴다 — 옮기지 말 것. */}
        {searchOpen ? (
          <>
            <Pressable
              style={styles.searchBackdrop}
              onPress={() => {
                // 패널 밖 탭 = 닫기 + 검색 초기화(전체 친구 노출).
                setDraft('');
                setQuery('');
                setSearchOpen(false);
              }}
              accessibilityRole="button"
              accessibilityLabel="친구 검색 닫기"
            />
            <View style={[styles.searchPanel, { top: sectionY + triggerY }]}>
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
                // iOS 바운스 끌림 방지 — 결과 적으면 고정.
                alwaysBounceVertical={false}
              >
                {dropdownFriends.map((f) => (
                  <Pressable
                    key={f.id}
                    style={styles.searchItem}
                    onPress={() => {
                      setQuery(f.nickname);
                      setDraft(f.nickname);
                      setSearchOpen(false);
                    }}
                  >
                    <Avatar size={32} avatarId={f.avatar} />
                    <Text style={styles.searchItemName} numberOfLines={1}>
                      {f.nickname}
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
      </ScrollView>

      <RejectFriendModal
        visible={rejectTarget !== null}
        name={rejectTarget?.nickname ?? ''}
        onReject={confirmReject}
        onLater={() => setRejectTarget(null)}
      />

      <AddFriendSheet
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSent={(name) => {
          // AddFriendSheet(Modal) 닫고 → 완료 모달은 닫힘 애니메이션 후 오픈.
          // iOS는 모달 닫히는 중 새 모달 띄우면 멈춤(모달 전환 직렬화).
          setAddOpen(false);
          setTimeout(() => setSentName(name), 320);
        }}
      />
      <FriendRequestSentModal
        visible={sentName !== null}
        name={sentName ?? ''}
        onClose={() => setSentName(null)}
      />
    </>
  );
}

// 친구·요청·검색 아바타 — 공유 ui/Avatar 위임(번들=PNG 티어, 친구
// 관계 mint 링 2px). SVG 벡터 트리 다수 마운트 제거(friends_scalability).
function Avatar({ size, avatarId }: { size: number; avatarId?: string }) {
  return (
    <UiAvatar
      photoUri={avatarId}
      size={size}
      relation="friend"
      borderWidth={2}
    />
  );
}

/** 친구 목록 행 — React.memo 로 검색/스크롤 state 변경 시 보이는 행만
 *  재렌더(friends_scalability). 콜백은 안정 참조로 받는다. */
const FriendRow = React.memo(function FriendRow({
  friend,
  onOpen,
}: {
  friend: MockAccount;
  onOpen: (userId: string) => void;
}) {
  return (
    <View style={styles.friendRow}>
      <Pressable
        onPress={() => onOpen(friend.id)}
        accessibilityRole="button"
        accessibilityLabel={`${friend.nickname} 프로필 보기`}
      >
        <Avatar size={48} avatarId={friend.avatar} />
      </Pressable>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName} numberOfLines={1}>
          {friend.nickname}
        </Text>
        <View style={styles.friendStatusRow}>
          <Text style={styles.friendStatus} numberOfLines={1}>
            {friend.status}
          </Text>
        </View>
      </View>
      <Pressable
        style={styles.profileBtn}
        onPress={() => onOpen(friend.id)}
        accessibilityRole="button"
        accessibilityLabel={`${friend.nickname} 프로필`}
      >
        <Text style={styles.profileBtnLabel}>프로필</Text>
        <IconIdBadgeWhite width={16} height={16} />
      </Pressable>
    </View>
  );
});

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
  miniAvatarImg: { width: 24, height: 24 },
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
  // ScrollView contentContainer 직속 absolute float. backdrop은 컨테이너
  // 전체에 깔린다(visible viewport 전부 = 패널 밖 어디든 탭 시 닫힘).
  // 패널은 sectionY+triggerY로 트리거 위치에 anchor. left/right=16은
  // contentContainer 가로 padding 보정(absolute 자식은 부모 padding을 무시).
  searchBackdrop: { ...StyleSheet.absoluteFillObject },
  searchPanel: {
    position: 'absolute',
    left: 16,
    right: 16,
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
