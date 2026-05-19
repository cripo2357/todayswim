// 새 친구 추가 시트 — Figma 168:7488(닉네임) / 168:9186(선택) / 168:9354(ID).
//
// 공통 BottomSheet 쉘(핸들·r32·헤더 "새 친구 추가"+X) + 세그먼트 탭
// [닉네임으로 찾기 | ID로 찾기] + "새친구" 라벨/안내 + 검색 + 하단
// "초대장 보내기"(user-double). 전송 = useFriends.sendRequest →
// 부모가 FriendRequestSentModal(169:5727) 노출 (OtherUserProfile 동일 플로우).
//
// 닉네임 검색은 수영 일정추가의 수영장 픽커와 "동일 패턴"(사용자 확정):
// 닫힘=트리거(선택값/플레이스홀더) / 열림=float 드롭다운, 자동완성에서
// 한 명 탭하면 그 친구가 선택되고 드롭다운이 즉시 닫힘. ID는 6자리
// 정확 조회라 단일 입력 + 실패 시 문구.
//
// Phase-1: friendSearch(목업). 서버 조회/상대 비공개 게이팅은 Phase-2 갭.
// 아바타 외곽선: 비친구라 profile_border_policy 따라 relation="other"(pd-gray).

import React from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Search, XCircle } from 'lucide-react-native';
import IconUserDouble from '@assets/icons/user-double.svg';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import { tokens } from '@/styles/tokens';
import { BottomSheet, SheetCtaButton } from '@/components/ui/BottomSheet';
import { Avatar } from '@/components/ui/Avatar';
import { useFriends } from '@/store/friends';
import {
  searchByNickname,
  findByCode,
  sanitizeCode,
  type FriendSearchUser,
} from '@/lib/friendSearch';

// 시트를 길게 고정 — 검색 트리거/드롭다운이 화면 위쪽에 와서 키보드(아래
// ~40%)에 안 가리도록(사용자 확정: 시트 전체를 올리지 말고 길게). 결과
// 목록은 panelList 가 스크롤. 탭 전환 시 높이 튐도 방지.
const SHEET_MIN_H = Math.round(Dimensions.get('window').height * 0.86);

type Tab = 'nickname' | 'id';

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
  // 선택된 친구 객체 — 드롭다운 닫혀도 트리거에 이름 표시(쿼리 비워도 유지).
  const [selUser, setSelUser] = React.useState<FriendSearchUser | null>(null);
  const [nickOpen, setNickOpen] = React.useState(false);
  const [triggerY, setTriggerY] = React.useState(0);
  const [code, setCode] = React.useState('');
  const [idErr, setIdErr] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!visible) {
      setTab('nickname');
      setNq('');
      setSelUser(null);
      setNickOpen(false);
      setCode('');
      setIdErr(null);
    }
  }, [visible]);

  const results = React.useMemo(
    () => searchByNickname(nq, opts),
    [nq, opts],
  );

  const send = (u: FriendSearchUser) => {
    sendRequest(u.id);
    onSent(u.name);
  };

  const onCta = () => {
    if (tab === 'nickname') {
      if (selUser) send(selUser);
      return;
    }
    const u = findByCode(code, opts);
    if (!u) {
      setIdErr('해당 ID의 사용자를 찾을 수 없습니다.');
      return;
    }
    send(u);
  };

  const ctaDisabled =
    tab === 'nickname' ? !selUser : code.length !== 6;

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="새 친구 추가"
      contentStyle={styles.sheet}
      minHeight={SHEET_MIN_H}
    >
      {/* 세그먼트 탭 — 본문 폭 그대로(좌우 추가 인셋 없음) */}
      <View style={styles.tabGroup}>
        {(['nickname', 'id'] as const).map((t) => {
          const active = tab === t;
          return (
            <Pressable
              key={t}
              onPress={() => {
                setTab(t);
                setNickOpen(false);
                setIdErr(null);
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

      {/* "새 친구" 라벨 + 안내 + 검색 본문 (Figma 168:9297 gap 8) */}
      <View style={styles.group}>
        <View style={styles.secRow}>
          <Text style={styles.secLabel}>새 친구</Text>
          <Text style={styles.secHint} numberOfLines={1}>
            기존 친구와 비공개 사용자는 검색되지 않습니다.
          </Text>
        </View>

        {tab === 'nickname' ? (
          <>
            {/* 닫힘 트리거 — 선택 친구 or 플레이스홀더 + caret. 일정추가
                수영장 픽커와 동일(122:8027). 탭하면 float 드롭다운. */}
            <View onLayout={(e) => setTriggerY(e.nativeEvent.layout.y)}>
              <Pressable
                onPress={() => setNickOpen(true)}
                style={styles.trigger}
                accessibilityRole="button"
                accessibilityLabel="닉네임으로 친구 검색"
              >
                <Text
                  style={[
                    styles.triggerText,
                    !selUser && styles.triggerPlaceholder,
                  ]}
                  numberOfLines={1}
                >
                  {selUser ? selUser.name : '닉네임'}
                </Text>
                <IconChevronDown width={20} height={20} />
              </Pressable>
            </View>

            {/* 열림 float — 그룹 마지막 자식(트리 최상위, 그림자 없이 터치
                우선). 트리거 위치(top=triggerY)에 검색칸 + 결과 목록. */}
            {nickOpen ? (
              <>
                <Pressable
                  style={styles.backdrop}
                  onPress={() => setNickOpen(false)}
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
                          // 자동완성에서 한 명 탭 = 선택 + 드롭다운 닫힘.
                          setSelUser(u);
                          setNickOpen(false);
                          setNq('');
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
                            {u.name}
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
            <View style={styles.inputBox}>
              <View style={styles.inputWrap}>
                <TextInput
                  value={code}
                  onChangeText={(v) => {
                    setCode(sanitizeCode(v));
                    setIdErr(null);
                  }}
                  style={styles.input}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  maxLength={6}
                  returnKeyType="search"
                />
                {code.length === 0 ? (
                  <Text style={styles.placeholder} pointerEvents="none">
                    정확한 ID 6자리
                  </Text>
                ) : null}
              </View>
              <Search size={20} color={tokens.color.ink400} strokeWidth={2} />
            </View>
            {idErr ? <Text style={styles.errText}>{idErr}</Text> : null}
          </>
        )}
      </View>

      <SheetCtaButton
        label="초대장 보내기"
        icon={<IconUserDouble width={20} height={20} />}
        onPress={onCta}
        disabled={ctaDisabled}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Figma 168:7495 — 섹션 간 gap 32 (BottomSheet 기본 24 override)
  sheet: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24, gap: 32 },

  // Figma 168:9155 — Tab Group: bg #F1F5F9 r18 p4 (본문 폭 그대로)
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
  // 활성 탭 — 흰 bg + Shadow/md
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

  // flex:1 + position 컨텍스트(float 패널 기준) — minHeight 고정 시
  // 본문이 늘어 CTA 하단 고정.
  group: { gap: 8, flex: 1 },
  // Figma 168:7500 — "새친구" + 우측 안내
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

  // Figma 168:9301 _InputTextBase — 흰 박스 border #94A3B8 r14 minH48 p12.
  // 닫힘 트리거(닉네임) / ID 입력 동일 베이스(과거 탭별 불일치 통일).
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
    color: '#1F2937',
  },
  // 플레이스홀더 색 통일(두 탭 동일) — Figma Gray/60
  triggerPlaceholder: { color: '#4B5563' },
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
  inputWrap: { flex: 1, justifyContent: 'center' },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
    padding: 0,
  },
  // RN Android placeholder 커스텀폰트 미적용 → Pretendard Text 오버레이
  // (앱 공통, 두 탭 동일). Figma: Regular 16 #4B5563.
  placeholder: {
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
  // 검색칸 #F8FAFC 알약 minH40 p8 gap8
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
  },
});
