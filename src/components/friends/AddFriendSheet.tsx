// 새 친구 추가 시트 — Figma 168:9186(닉네임) / 168:9354(ID).
//
// 공통 BottomSheet 쉘 + 세그먼트 탭 [닉네임으로 찾기 | ID로 찾기]
// + 탭별 라벨/안내 + 검색 입력 + "선택된 사용자" 행 + 하단 "초대장 보내기".
//
// 닉네임: 입력 박스(닫힘=트리거, "닉네임" 고정 + caret)를 탭하면 float
// 드롭다운(검색칸+결과). 한 명 탭하면 선택 + 드롭다운 닫힘. 선택된
// 사용자는 입력 아래 행(아바타+이름+상태)으로 표시.
// ID: 6자리 정확 입력 → 자동 조회. 찾으면 같은 행으로 표시, 6자인데
// 못 찾으면 실패 문구. (findByCode = accountCode 완전일치, 부분검색 X)
//
// Phase-1: friendSearch(목업). 서버 조회/상대 비공개 게이팅은 Phase-2 갭.
// 아바타 외곽선: 비친구라 profile_border_policy 따라 relation="other"
// (pd-gray). Figma 는 mint 로 그려졌으나 전역 테두리 정책 우선(불일치 메모).

import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
  Keyboard,
} from 'react-native';
import { XCircle } from 'lucide-react-native';
import IconUserDouble from '@assets/icons/user-double.svg';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import { tokens } from '@/styles/tokens';
import { BottomSheet, SheetCtaButton } from '@/components/ui/BottomSheet';
import { Avatar } from '@/components/ui/Avatar';
import { useFriends } from '@/store/friends';
import { useProfile } from '@/store/profile';
import { dispatchMessage, dispatchMessageTo } from '@/lib/messages/dispatch';
import {
  sanitizeCode,
  type FriendSearchUser,
} from '@/lib/friendSearch';
import { useNicknameSearch, useCodeSearch } from '@/hooks/useFriendSearch';
import { logEvent } from '@/lib/analytics';

// 시트를 길게 고정 — 검색 트리거/드롭다운이 화면 위쪽에 와서 키보드(아래
// ~40%)에 안 가리도록(사용자 확정: 시트 전체를 올리지 말고 길게).
const SHEET_MIN_H = Math.round(Dimensions.get('window').height * 0.86);

type Tab = 'nickname' | 'id';

/** 선택/조회된 사용자 행 — Figma 168:9309/196:8038. 아바타24 + 이름 +
 *  상태. 아바타 외곽선은 profile_border_policy(비친구=pd-gray). */
function SelectedUserRow({ user }: { user: FriendSearchUser }) {
  return (
    <View style={styles.selectedRow}>
      <Avatar
        photoUri={user.avatar}
        size={24}
        relation="other"
        borderWidth={1}
      />
      <Text style={styles.selName} numberOfLines={1}>
        {user.nickname}
      </Text>
      <Text style={styles.selStatus} numberOfLines={1}>
        {user.status}
      </Text>
    </View>
  );
}

export function AddFriendSheet({
  visible,
  onClose,
  onSent,
}: {
  visible: boolean;
  onClose: () => void;
  /** 요청 전송 완료 — 부모가 완료 모달 노출 */
  onSent: (name: string) => void;
}) {
  const friends = useFriends((s) => s.friends);
  const blocked = useFriends((s) => s.blocked);
  const sendRequest = useFriends((s) => s.sendRequest);

  const opts = React.useMemo(
    () => ({ friendIds: friends.map((f) => f.id), blockedIds: blocked }),
    [friends, blocked],
  );

  const [tab, setTab] = React.useState<Tab>('nickname');
  const [nq, setNq] = React.useState('');
  // 닉네임에서 선택한 친구 — 입력 아래 행에 표시(쿼리 비워도 유지).
  const [selUser, setSelUser] = React.useState<FriendSearchUser | null>(null);
  const [nickOpen, setNickOpen] = React.useState(false);
  const [triggerY, setTriggerY] = React.useState(0);
  const [code, setCode] = React.useState('');
  // BottomSheet 컨테이너가 onResponderRelease 로 Keyboard.dismiss 발사하면
  // TextInput 이 responder 못 잡고 focus 실패 — 박스 탭에서 ref.focus() 명시 호출.
  const idInputRef = React.useRef<TextInput>(null);

  React.useEffect(() => {
    if (!visible) {
      setTab('nickname');
      setNq('');
      setSelUser(null);
      setNickOpen(false);
      setCode('');
    } else {
      void logEvent('friend_search_executed', { tab });
    }
  }, [visible, tab]);

  // P2: mock 즉시 결과 + 서버 profiles 검색 합쳐 dedupe. opts(친구/차단) 동일 필터.
  const results = useNicknameSearch(nq, opts);

  // ID는 6자리 정확 일치 자동 조회(타이핑 중 실시간). 부분검색 아님.
  // mock 즉시 + 서버 폴백(둘 중 누구든 찾으면).
  const idFound = useCodeSearch(code, opts);
  const idMiss = code.length === 6 && !idFound;

  // 드롭다운 닫힘 = 검색칸 focus out(키보드/커서 해제). 선택/백드롭/
  // 탭전환 모두 공통.
  const closeNick = React.useCallback(() => {
    setNickOpen(false);
    Keyboard.dismiss();
  }, []);

  // 화면에 표시/전송할 대상 — 탭별.
  const picked = tab === 'nickname' ? selUser : idFound;

  const onCta = () => {
    if (!picked) return;
    sendRequest(picked.id);
    // 상대 알림함에 friend_request_received 적재 — name = 발신자(나) 닉네임.
    // 본인 알림함에도 friend_request_sent 적재 (invite_sent 와 일관, 발송 이력 가시화).
    const my = useProfile.getState().profile;
    if (my?.name) {
      void dispatchMessageTo(
        picked.id,
        'friend_request_received',
        { name: my.name },
        { senderUserId: my.id },
      );
    }
    void dispatchMessage(
      'friend_request_sent',
      { name: picked.nickname },
      { targetUserId: picked.id },
    );
    onSent(picked.nickname);
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="새 친구 추가"
      contentStyle={styles.sheet}
      minHeight={SHEET_MIN_H}
    >
      {/* 세그먼트 탭 — 본문 폭 그대로(Figma 196:7780, 추가 인셋 없음) */}
      <View style={styles.tabGroup}>
        {(['nickname', 'id'] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => {
                setTab(t);
                closeNick();
              }}
              style={[styles.tab, active && styles.tabActive]}
              accessibilityRole="button"
            >
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t === 'nickname' ? '닉네임으로 찾기' : 'ID로 찾기'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* 라벨(탭별) + 안내 + 입력 + 선택 사용자 행 (Figma 168:9297 gap 8) */}
      <View style={styles.group}>
        <View style={styles.secRow}>
          <Text style={styles.secLabel}>
            {tab === 'nickname' ? '새 친구' : '친구 ID'}
          </Text>
          <Text style={styles.secHint} numberOfLines={1}>
            기존 친구와 비공개 사용자는 검색되지 않습니다.
          </Text>
        </View>

        {tab === 'nickname' ? (
          <>
            {/* 닫힘 트리거 — "닉네임" 고정(선택값은 아래 행에 표시) + caret.
                일정추가 수영장 픽커와 동일. 탭하면 float 드롭다운. */}
            <View onLayout={(e) => setTriggerY(e.nativeEvent.layout.y)}>
              <Pressable
                onPress={() => setNickOpen(true)}
                style={styles.inputBox}
                accessibilityRole="button"
                accessibilityLabel="닉네임으로 친구 검색"
              >
                <Text style={styles.placeholderText}>닉네임</Text>
                <IconChevronDown width={20} height={20} />
              </Pressable>
            </View>

            {selUser ? <SelectedUserRow user={selUser} /> : null}

            {/* 열림 float — 그룹 마지막 자식(트리 최상위). 트리거 위치
                (top=triggerY)에 검색칸 + 결과 목록. */}
            {nickOpen ? (
              <>
                <Pressable
                  style={styles.backdrop}
                  onPress={closeNick}
                  accessibilityRole="button"
                  accessibilityLabel="검색 닫기"
                />
                <View style={[styles.panel, { top: triggerY }]}>
                  <View style={styles.searchPill}>
                    <View style={styles.searchInputWrap}>
                      <TextInput
                        autoFocus
                        value={nq}
                        onChangeText={setNq}
                        style={styles.searchInput}
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                      />
                      {nq.length === 0 ? (
                        <Text
                          style={styles.searchPlaceholder}
                          pointerEvents="none"
                        >
                          닉네임
                        </Text>
                      ) : null}
                    </View>
                    {nq.length > 0 ? (
                      <Pressable
                        onPress={() => setNq('')}
                        hitSlop={8}
                        accessibilityRole="button"
                        accessibilityLabel="검색어 지우기"
                      >
                        <XCircle size={20} color="#94A3B8" strokeWidth={2} />
                      </Pressable>
                    ) : null}
                  </View>
                  <ScrollView
                    style={styles.panelList}
                    nestedScrollEnabled
                    keyboardShouldPersistTaps="always"
                  >
                    {results.map((u) => (
                      <Pressable
                        key={u.id}
                        onPress={() => {
                          // 자동완성 한 명 탭 = 선택 + 드롭다운 닫힘 +
                          // 검색칸 focus out(키보드 해제).
                          setSelUser(u);
                          setNq('');
                          closeNick();
                        }}
                        style={styles.item}
                        accessibilityRole="button"
                      >
                        <View style={styles.itemLeft}>
                          <Avatar
                            photoUri={u.avatar}
                            size={24}
                            relation="other"
                            borderWidth={1}
                          />
                          <Text style={styles.itemName} numberOfLines={1}>
                            {u.nickname}
                          </Text>
                        </View>
                        <Text style={styles.itemSub} numberOfLines={1}>
                          {u.status}
                        </Text>
                      </Pressable>
                    ))}
                    {results.length === 0 ? (
                      <Text style={styles.empty}>
                        {nq.trim()
                          ? '검색 결과가 없습니다.'
                          : '닉네임을 입력해 검색하세요.'}
                      </Text>
                    ) : null}
                  </ScrollView>
                </View>
              </>
            ) : null}
          </>
        ) : (
          <>
            <Pressable
              onPress={() => idInputRef.current?.focus()}
              style={styles.inputBox}
              accessibilityRole="search"
              accessibilityLabel="친구 ID 입력"
            >
              <View style={styles.searchInputWrap}>
                <TextInput
                  ref={idInputRef}
                  value={code}
                  onChangeText={(v) => setCode(sanitizeCode(v))}
                  style={styles.input}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                  returnKeyType="search"
                />
                {code.length === 0 ? (
                  <Text style={styles.inputPlaceholder} pointerEvents="none">
                    정확한 ID 6자리
                  </Text>
                ) : null}
              </View>
              <IconChevronDown width={20} height={20} />
            </Pressable>
            {idFound ? (
              <SelectedUserRow user={idFound} />
            ) : idMiss ? (
              <Text style={styles.errText}>
                해당 ID의 사용자를 찾을 수 없습니다.
              </Text>
            ) : null}
          </>
        )}
      </View>

      <SheetCtaButton
        label="초대장 보내기"
        icon={<IconUserDouble width={20} height={20} />}
        onPress={onCta}
        disabled={!picked}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Figma 168:7495 — 섹션 간 gap 32 (BottomSheet 기본 24 override)
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, gap: 32 },

  // Figma 196:7780 — Tab Group: bg #F1F5F9 r18 p4 (본문 폭 그대로)
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: tokens.color.lineSubtle,
    borderRadius: 18,
    padding: 4,
  },
  tab: {
    flex: 1,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: tokens.color.white,
    ...tokens.shadow.md,
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  tabLabelActive: { color: tokens.color.ink900 },

  group: { gap: 8, flex: 1 },
  // Figma 168:9347/168:9374 — 라벨 + 우측 안내
  secRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink700,
  },
  secHint: {
    flex: 1,
    textAlign: 'right',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },

  // Figma 168:9301 _InputTextBase — 흰 박스 border #94A3B8 r14 minH48 p12
  // gap12. 닉네임 트리거 / ID 입력 동일 베이스(두 탭 통일).
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  searchInputWrap: { flex: 1, justifyContent: 'center' },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
    padding: 0,
  },
  // 닉네임 트리거(=Pressable, TextInput 없음)의 고정 라벨 — flex 로
  // chevron 옆에 자리. Figma: Regular 16 #4B5563.
  placeholderText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  // ID TextInput 의 플레이스홀더 — 입력 위 절대배치 오버레이(빈 값일
  // 때만, 타이핑 시 사라짐). flex 로 두면 입력과 세로로 쌓여 위치 깨짐.
  inputPlaceholder: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    textAlignVertical: 'center',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    includeFontPadding: false,
  },

  // Figma 168:9309 — 선택/조회된 사용자 행: 아바타24 + 이름 + 상태
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 8,
  },
  // Medium 16/22 -0.112 #4B5563
  selName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
    flexShrink: 1,
  },
  // Medium 14/20 -0.084 #94A3B8
  selStatus: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#94A3B8',
  },

  // 열림 시 본문 덮는 투명 영역 — 탭하면 닫힘(패널은 그 위, 트리 최상위)
  backdrop: { ...StyleSheet.absoluteFillObject },
  // 트리거 위치에 뜨는 흰 카드(검색칸 + 결과). 일정추가 풀 픽커와 동일.
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
    padding: 8,
    gap: 8,
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
  // Figma 168:9306 — 결과 목록 영역 ~h200
  panelList: { maxHeight: 200 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 8,
    borderRadius: tokens.radius.pill,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  itemName: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink700,
    flexShrink: 1,
  },
  itemSub: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink400,
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink400,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  errText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: tokens.font.sans,
    color: tokens.color.red,
    paddingHorizontal: 4,
    paddingTop: 4,
  },
});
