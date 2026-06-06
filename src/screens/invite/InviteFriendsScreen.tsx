// Figma 150:8692 / 154:3850 — 친구 초대 (일정 확정 → 초대 대상만 추가).
// 바텀시트: "초대 일정" 카드(읽기전용) + "초대 친구" 멀티선택 + 초대장 보내기.
// 멀티선택 검색은 AddScheduleSheet 수영장 검색에서 검증된 패턴 재사용:
//  · 열림 패널 = body의 "마지막 자식" + absolute(top=트리거 onLayout y)
//    → 트리 최상위라 elevation/그림자 없이 터치 우선([[android_nested_modal_float]])
//  · body가 ScrollView가 아니라 View → 목록 ScrollView가 유일 스크롤러(중첩 X)
//  · float이라 레이아웃 안 밀어 시트 높이 불변. 항목 탭=토글(안 닫힘, 멀티),
//    바깥 backdrop·트리거 ⌄=닫힘.

import React from 'react';
import {
  View, Text, Image, TextInput, ScrollView, StyleSheet, Pressable,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, XCircle, Check } from 'lucide-react-native';
import IconChevronDown from '@assets/icons/chevron-down.svg';

import type { RootStackParamList } from '@/navigation/types';
import { BottomSheet, SheetCtaButton } from '@/components/ui/BottomSheet';
import type { MockAccount } from '@/lib/mockData';
import { bundleAvatarPng, isBundleAvatar } from '@/lib/avatars';
import { useFriends } from '@/store/friends';
import { useSentInvites, inviteSlotKey } from '@/store/sentInvites';
import { dispatchMessage, dispatchMessageTo } from '@/lib/messages/dispatch';
import { useProfile } from '@/store/profile';
import { tokens } from '@/styles/tokens';
import { formatDateTime } from '@/lib/dateFormat';
import { logEvent } from '@/lib/analytics';

const SCREEN_H = Dimensions.get('window').height;
// 시트 본문 고정 높이 — 멀티선택 열림/닫힘과 무관하게 시트 총높이 일정.
const BODY_H = Math.round(SCREEN_H * 0.62);
// 안정적 빈 배열(미초대 슬롯에서 매 렌더 새 [] 생성으로 인한 리렌더 방지)
const EMPTY_IDS: string[] = [];
// 참여 중 친구 제외 — 서버 슬롯 조회 연동 전까지 항상 빈 집합(reference-stable).
const EMPTY_JOINED: Set<string> = new Set();

// 앱 통일 "YY.MM.DD(요일) 오전/오후 H:MM" — @/lib/dateFormat 위임.
function formatScheduleLine(iso: string, start: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const [hh, mm] = start.split(':').map(Number);
  return formatDateTime(new Date(y, m - 1, d, hh, mm));
}

export function InviteFriendsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { poolId, poolName, poolPhotoUrl, date, start, end } =
    useRoute<RouteProp<RootStackParamList, 'InviteFriends'>>().params;

  const [selected, setSelected] = React.useState<MockAccount[]>([]);
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [triggerY, setTriggerY] = React.useState(0);
  // 자동 포커스/키보드 X — 사용자가 입력칸을 직접 탭해야 포커스(요청).

  // 이 슬롯에 이미 초대장 보낸 친구(한 번이면 충분) — 검색 대상 제외.
  const slotKey = inviteSlotKey(poolId, date, start, end);
  const sentBySlot = useSentInvites((st) => st.bySlot);
  const markInvited = useSentInvites((st) => st.markInvited);
  const sentIds = sentBySlot[slotKey] ?? EMPTY_IDS;

  // 이미 이 슬롯(풀+날짜+시작/끝)에 참여 중인 친구는 초대 불필요 → 제외.
  // (P3 prod, 2026-06-02): 슬롯 참여자 mock 소스 제거 — 서버 일정 fetch 미연동.
  // 참여 중 제외는 서버 슬롯-단위 조회 연동 시 복원. 현재는 빈 집합.
  const joinedIds = EMPTY_JOINED;
  // 제외 대상 = 이미 참여 중 + 이미 초대장 보낸 친구.
  const excludedIds = React.useMemo(
    () => new Set<string>([...joinedIds, ...sentIds]),
    [joinedIds, sentIds],
  );
  // 초대 후보 = 현재 친구(store) — block()/removeFriend()가 이미 반영된
  // 단일 출처라 차단·삭제된 사용자는 절대 후보에 안 뜸.
  const friends = useFriends((s) => s.friends);
  const sorted = React.useMemo(
    () =>
      friends
        .filter((f) => !excludedIds.has(f.id))
        .sort((a, b) => a.nickname.localeCompare(b.nickname, 'ko')),
    [friends, excludedIds],
  );
  const q = query.trim().toLowerCase();
  const filtered = q
    ? sorted.filter((f) => f.nickname.toLowerCase().includes(q))
    : sorted;
  const selectedIds = new Set(selected.map((f) => f.id));

  const toggle = (f: MockAccount) =>
    setSelected((prev) =>
      prev.some((s) => s.id === f.id)
        ? prev.filter((s) => s.id !== f.id)
        : [...prev, f],
    );

  const send = () => {
    if (selected.length === 0) return;
    void logEvent('friend_invite_sent', { invitee_count: selected.length });
    // 보낸 초대 기록 → 다음에 같은 슬롯 열면 검색 대상에서 제외.
    markInvited(slotKey, selected.map((f) => f.id));
    // 발송 이력 적재 (Rule: invite_sent — 본인 이력)
    // inviteeIds: 초대받은 친구 친구코드 — 나중에 알림 탭에서 '초대 취소' 누르면
    // 이들에게 invite_canceled 발송하기 위해 related에 보존.
    void dispatchMessage(
      'invite_sent',
      {
        name: selected.length === 1 ? selected[0].nickname : undefined,
        count: selected.length,
        pool: poolName,
        when: formatScheduleLine(date, start),
      },
      { poolId, date, start, end, inviteeIds: selected.map((f) => f.id) },
    );
    // P2(2026-05-20): 초대받은 각 친구에게 invite_received 적재. dispatchMessageTo
    // 는 rule.recipients 무시하고 toUserCode 알림함에 강제 적재 — 'invite_received'
    // 가 'self' 룰(받는 본인용)이라 발신자 본인에게 들어가면 안 되므로 별도 경로.
    // name 은 발신자(나) 닉네임 — 친구 화면에 "{내 닉네임}이 …" 표기.
    const myProfile = useProfile.getState().profile;
    const myName = myProfile?.name;
    const senderUserId = myProfile?.id;
    if (myName) {
      const time = start; // HH:MM
      for (const f of selected) {
        void dispatchMessageTo(
          f.id,
          'invite_received',
          { name: myName, pool: poolName, date, time },
          { poolId, date, start, end, senderUserId, senderAvatar: myProfile?.photoUri },
        );
      }
    }
    // BottomSheet는 RN Modal — navigate면 그 Modal이 위에 떠 완료 화면을
    // 가림. replace로 이 화면(시트 Modal)을 닫고 완료 화면을 노출.
    navigation.replace('InviteDone', { count: selected.length });
  };

  const Avatar = ({ f }: { f: MockAccount }) => (
    <View style={styles.avatar}>
      {isBundleAvatar(f.avatar) ? (
        <Image source={bundleAvatarPng(f.avatar, 24)} style={{ width: 24, height: 24 }} />
      ) : (
        <Image source={{ uri: f.avatar }} style={styles.avatarImg} />
      )}
    </View>
  );

  return (
    <BottomSheet
      visible
      onClose={() => navigation.goBack()}
      title="친구 초대"
      contentStyle={styles.sheet}
    >
      {/* 본문 고정 높이 View — 시트 총높이 불변. body가 ScrollView가 아니라
          목록(float 내부 ScrollView)이 유일 스크롤러라 중첩 충돌 없음. */}
      <View style={[styles.body, styles.bodyContent]}>
        {/* 초대 친구 — 상단 고정: 라벨(+안내문구) + 트리거. Figma 163:6309 */}
        <View style={styles.section}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>
              초대 친구{selected.length > 0 ? ` (${selected.length})` : ''}
            </Text>
            <Text style={styles.labelNote} numberOfLines={1}>
              초대중이거나 참여한 친구는 초대할 수 없습니다.
            </Text>
          </View>
          <View onLayout={(e) => setTriggerY(e.nativeEvent.layout.y)}>
            <Pressable
              onPress={() => setOpen((o) => !o)}
              style={styles.trigger}
            >
              <Text style={styles.triggerText} numberOfLines={1}>
                닉네임
              </Text>
              <IconChevronDown width={20} height={20} />
            </Pressable>
          </View>
        </View>

        {/* 선택 친구 목록 — 트리거~일정 사이 남는 공간을 flex로 채우고
            길면 스크롤. 열림 시엔 float 패널이 덮으므로 미표시.
            Figma 154:3850 (아바타+이름+상태+빨강 삭제). */}
        <View style={styles.fillArea}>
          {!open && selected.length > 0 ? (
            <ScrollView
              style={styles.selectedList}
              keyboardShouldPersistTaps="always"
              showsVerticalScrollIndicator={false}
              // iOS 바운스 끌림 방지 — 내용 짧으면 고정(풀카드와 동일).
              alwaysBounceVertical={false}
            >
              {selected.map((f) => (
                <View key={f.id} style={styles.selectedRow}>
                  <Avatar f={f} />
                  <Text style={styles.name} numberOfLines={1}>
                    {f.nickname}
                  </Text>
                  <Text style={styles.sub} numberOfLines={1}>
                    {f.status}
                  </Text>
                  <Pressable
                    onPress={() => toggle(f)}
                    hitSlop={6}
                    style={({ pressed }) => [
                      styles.removeBtn,
                      pressed && { opacity: 0.7 },
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`${f.nickname} 삭제`}
                  >
                    <Text style={styles.removeLabel}>삭제</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          ) : null}
        </View>

        {/* 초대 일정 — 하단 고정(초대장 보내기 버튼 바로 위, 위치 불변) */}
        <View style={styles.section}>
          <Text style={styles.label}>초대 일정</Text>
          <View style={styles.scheduleCard}>
            <View style={styles.scheduleInfo}>
              <Text style={styles.poolName} numberOfLines={1}>
                {poolName}
              </Text>
              <Text style={styles.when} numberOfLines={1}>
                {formatScheduleLine(date, start)}
              </Text>
            </View>
            {poolPhotoUrl ? (
              <Image source={{ uri: poolPhotoUrl }} style={styles.thumb} />
            ) : null}
          </View>
        </View>

        {/* 열림 float — body의 마지막 자식 + absolute(top=트리거y).
            트리 최상위라 elevation/그림자 없이 터치 우선. */}
        {open ? (
          <>
            <Pressable
              style={styles.backdrop}
              onPress={() => setOpen(false)}
              accessibilityRole="button"
              accessibilityLabel="친구 검색 닫기"
            />
            <View style={[styles.panel, { top: triggerY }]}>
              {/* Figma 154:4424 — 검색칸 #F8FAFC 알약 */}
              <View style={styles.search}>
                <View style={styles.searchInputWrap}>
                  <TextInput
                    value={query}
                    onChangeText={setQuery}
                    style={styles.searchInput}
                  />
                  {query.length === 0 ? (
                    <Text style={styles.searchPlaceholder} pointerEvents="none">
                      닉네임
                    </Text>
                  ) : null}
                </View>
                {query.length > 0 ? (
                  <Pressable
                    onPress={() => setQuery('')}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel="검색어 지우기"
                  >
                    <XCircle size={20} color="#94A3B8" strokeWidth={2} />
                  </Pressable>
                ) : null}
              </View>
              <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                nestedScrollEnabled
                keyboardShouldPersistTaps="always"
                // iOS 바운스 끌림 방지 — 목록 짧으면 고정.
                alwaysBounceVertical={false}
              >
                {filtered.map((f) => {
                  const on = selectedIds.has(f.id);
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() => toggle(f)}
                      style={styles.row}
                    >
                      <View
                        style={[styles.checkbox, on && styles.checkboxOn]}
                      >
                        {on ? (
                          <Check
                            size={11}
                            color={tokens.color.white}
                            strokeWidth={3}
                          />
                        ) : null}
                      </View>
                      <Avatar f={f} />
                      <Text style={styles.name} numberOfLines={1}>
                        {f.nickname}
                      </Text>
                      <Text style={styles.sub} numberOfLines={1}>
                        {f.status}
                      </Text>
                    </Pressable>
                  );
                })}
                {filtered.length === 0 ? (
                  <Text style={styles.empty}>검색 결과가 없어요.</Text>
                ) : null}
              </ScrollView>
            </View>
          </>
        ) : null}
      </View>

      <SheetCtaButton
        label="초대장 보내기"
        onPress={send}
        disabled={selected.length === 0}
        icon={
          <Mail
            size={20}
            color={
              selected.length === 0 ? tokens.color.pdGray : tokens.color.black
            }
            strokeWidth={2}
          />
        }
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { gap: 24 },
  body: { height: BODY_H },
  bodyContent: { gap: 24 },
  section: { gap: 8 },
  // 트리거~일정 사이 남는 공간 — 선택 목록이 이만큼 차지(없으면 빈 공간).
  // 덕분에 초대 일정 카드가 항상 하단(보내기 버튼 위)에 고정.
  fillArea: { flex: 1 },
  // Figma 163:6309 — 라벨 + 안내문구 한 줄(gap8). 안내는 우측 정렬·남는폭.
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  // Figma 150:9110 — SemiBold 14/20 -0.084 #4B5563
  label: {
    flexShrink: 0,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  // Figma 163:6307 — Regular 12/16 -0.06 rgba(27,31,38,0.72) 우측정렬
  labelNote: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: 'rgba(27, 31, 38, 0.72)',
    textAlign: 'right',
  },
  // Figma 150:9129 — 흰 카드 r16 h72 p16 Shadow/lg (보더 없음)
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 72,
    padding: 16,
    borderRadius: 16,
    backgroundColor: tokens.color.white,
    ...tokens.shadow.lg,
  },
  scheduleInfo: { flex: 1, gap: 4 },
  poolName: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  when: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
  },
  thumb: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#E2E8F0' },

  // 트리거(닉네임 + ⌄) — SearchSelect 톤(border #94A3B8 r14 minH48 px12)
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },

  // 선택 목록 — fillArea를 채우고(flex:1) 넘치면 스크롤(중첩 아님: body가 View)
  selectedList: { flex: 1 },
  // Figma 154:3850 — 행 gap8 minH40 p8 + 우측 빨강 삭제
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
  },
  removeBtn: {
    backgroundColor: tokens.color.red,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  removeLabel: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.white,
  },

  // 열림 시 본문 덮는 투명 영역 — 탭하면 닫힘(패널은 그 위, 트리 최상위)
  backdrop: { ...StyleSheet.absoluteFillObject },
  // Figma 154:4423 — 흰 카드 border #E2E8F0 r15 p8 gap4 Shadow/lg.
  // body 마지막 자식 + absolute(top=트리거y) → 그림자/elevation 없이 최상위.
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 15,
    backgroundColor: tokens.color.white,
    padding: 8,
    gap: 4,
    ...tokens.shadow.lg,
  },
  // Figma 154:4424 — 검색칸 #F8FAFC 알약 minH40 p8 gap8
  search: {
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
  // 5개 노출 고정(아이템 minH40 + gap4 → 5*40 + 4*4 = 216, 여유 220)
  list: { height: 220 },
  listContent: { gap: 4 },
  // Figma 154:4540 — 행 gap8 minH40 p8 rounded-full
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    padding: 8,
    borderRadius: 9999,
  },
  // Figma 154:4546 — 체크박스 원형 16, 미선택 border #CBD5E1 / 선택 pd-mint
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdMint,
  },
  // 아바타 24 원형 + pd-mint 보더(친구=mint, [[profile_border_policy]])
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.pdMint,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 24, height: 24 },
  // Figma 154:4544 — Medium 16/22 -0.112 #4B5563
  name: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  // Figma 154:4545 — Medium 14/20 -0.084 #94A3B8
  sub: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#94A3B8',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
    textAlign: 'center',
    paddingVertical: 16,
  },
});
