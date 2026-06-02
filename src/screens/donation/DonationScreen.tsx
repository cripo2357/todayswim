// 후원으로 서비스 응원 — Figma 238:8643.
//
// 구조(스크롤):
//   1) TopNav (뒤로/제목/빈 영역)
//   2) 일러스트 (assets/illustrations/donation-thanks.svg)
//   3) 본문 텍스트 (14px / lineHeight 1.6 / #4B5563) — **{nickname}만 Bold + black**
//   4) 카카오뱅크 계좌 카드 (rounded 24 + Shadow/md + 좌측 40 회색 원 + PiggyBank)
//   5) 섹션 헤더 "Pool's day를 응원해주신 분들"
//   6) 응원자 카드 리스트 (rounded 24 + Shadow/md + 아바타 40 + pd-byellow 2px 보더)
//      - 본인 카드: "후원 비공개" / "문구 수정" 액션 badge
//      - 본인 카드 + editing=true: 메시지가 textarea + "작성 완료" CTA (인라인 편집)
//
// 작성 흐름은 사용자가 직접 X — 운영자가 입금 확인 시 trigger가 자동 등록(0072).
// 사용자는 본인 카드의 문구 수정 / 비공개 토글만 가능.
//
// 색 정책: 이 화면은 Figma 충실도 화면 — Gray/80 #1F2937, Gray/60 #4B5563 등
// 리터럴 hex 사용 (ink900/ink500 토큰과 다름, [[figma_color_token_mismatch]]).

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  type KeyboardEvent,
  type LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import {
  ChevronLeft,
  Copy,
  PiggyBank,
  Edit3,
  Trash2,
  XCircle,
  MoveDiagonal2,
} from 'lucide-react-native';
import DonationIllust from '@assets/illustrations/donation-thanks.svg';
import { tokens } from '@/styles/tokens';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateTime } from '@/lib/dateFormat';
import { useAppStatus } from '@/hooks/useAppStatus';
import { useProfile } from '@/store/profile';
import { logEvent } from '@/lib/analytics';
import {
  useDonations,
  useUpdateDonationMessage,
  useToggleDonationHidden,
  type DonationItem,
} from '@/hooks/useDonations';
import { DonationHideModal } from '@/components/donation/DonationHideModal';

const MAX_LEN = 300;

// Figma Shadow/md — `0,4 blur 8 #0F172A 0.03` + `0,8 blur 16 #0F172A 0.02`.
// tokens.shadow.md 와 다른 spec이라 인라인 정의(이 화면 한정).
const FIGMA_SHADOW_MD = {
  boxShadow:
    '0px 4px 8px 0px rgba(15, 23, 42, 0.03), 0px 8px 16px 0px rgba(15, 23, 42, 0.02)',
} as const;

export function DonationScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'Donation'>>();
  const profile = useProfile((s) => s.profile);
  const { data: appStatus } = useAppStatus();
  const { items } = useDonations();

  React.useEffect(() => {
    void logEvent('donation_screen_open');
  }, []);
  const updateMessage = useUpdateDonationMessage();
  const toggleHidden = useToggleDonationHidden();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [hideId, setHideId] = React.useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────
  // 좌표 인프라 — 두 용도 공유:
  //   A) 알림 '응원글 보기' 진입 시 본인 카드 위치로 자동 스크롤
  //   B) 인라인 편집 시 키보드가 카드 가리지 않게 카드 bottom 까지 스크롤
  //
  // 좌표 계산: list 의 y(=ScrollView content 안에서의 위치)
  //         + mine 카드의 y(=list 안에서의 위치)
  //         = mine 카드의 절대 y (in scroll content).
  // 카드 height (편집 시 textarea 로 커짐) 도 추적.
  // ScrollView 자체 height 도 추적 — 키보드시 visible viewport 계산용.
  // ─────────────────────────────────────────────────────────────────────
  const scrollRef = React.useRef<ScrollView>(null);
  const listYRef = React.useRef<number | null>(null);
  const mineCardYRef = React.useRef<number | null>(null);
  const mineCardHRef = React.useRef<number | null>(null);
  const scrollViewHRef = React.useRef<number | null>(null);
  const scrolledRef = React.useRef(false);
  const scrollToMine = !!route.params?.scrollToMine;

  // ── A) 알림 '응원글 보기' 자동 스크롤 — 본인 카드 top 으로
  const tryScrollToMine = React.useCallback(() => {
    if (!scrollToMine || scrolledRef.current) return;
    if (listYRef.current === null || mineCardYRef.current === null) return;
    const target = listYRef.current + mineCardYRef.current;
    scrollRef.current?.scrollTo({ y: target, animated: true });
    scrolledRef.current = true;
  }, [scrollToMine]);

  const onListLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      listYRef.current = e.nativeEvent.layout.y;
      tryScrollToMine();
    },
    [tryScrollToMine],
  );
  const onMineCardLayout = React.useCallback(
    (e: LayoutChangeEvent) => {
      mineCardYRef.current = e.nativeEvent.layout.y;
      mineCardHRef.current = e.nativeEvent.layout.height;
      tryScrollToMine();
    },
    [tryScrollToMine],
  );
  const onScrollViewLayout = React.useCallback((e: LayoutChangeEvent) => {
    scrollViewHRef.current = e.nativeEvent.layout.height;
  }, []);

  // 화면 진입 param 바뀔 때 A 가드 리셋 — 같은 인스턴스로 다시 navigate 되는 케이스.
  React.useEffect(() => {
    if (scrollToMine) {
      scrolledRef.current = false;
      tryScrollToMine();
    }
  }, [scrollToMine, tryScrollToMine]);

  // ── B) 인라인 편집 키보드 회피 — 편집 카드 bottom 을 키보드 top 에 정확히 맞춤
  //
  // 1) `paddingBottom: kbHeight` — scroll 런웨이 확보 (가짜 여백)
  // 2) `keyboardDidShow` + 100ms 대기 → KAV shrink + content layout 안정화 후
  //    listY + mineCardY + mineCardH 로 카드 절대 bottom 계산 → 그 값 - visibleH
  //    만큼 scrollTo. 카드 자체 padding 16 덕에 작성 완료 배지는 키보드 위
  //    16px 여백.
  const [kbHeight, setKbHeight] = React.useState(0);
  React.useEffect(() => {
    const showEvt = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e: KeyboardEvent) =>
      setKbHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  React.useEffect(() => {
    if (kbHeight === 0 || !editingId) return;
    // 100ms — keyboardDidShow 직후 KAV shrink + textarea autoFocus 인한 layout
    // 변화가 다 반영되도록 약간 대기.
    const t = setTimeout(() => {
      const sv = scrollRef.current;
      if (
        !sv ||
        listYRef.current === null ||
        mineCardYRef.current === null ||
        mineCardHRef.current === null ||
        scrollViewHRef.current === null
      )
        return;
      // iOS behavior='padding' → ScrollView height 그대로, kbHeight 만큼 가려짐.
      // Android behavior='height' → ScrollView 가 이미 shrink 된 상태.
      const visibleH =
        scrollViewHRef.current - (Platform.OS === 'ios' ? kbHeight : 0);
      const cardBottomY =
        listYRef.current + mineCardYRef.current + mineCardHRef.current;
      // +12 — 카드 bottom 이 키보드 top 에 딱 붙으면 답답해서 12px 추가 마진.
      const target = Math.max(0, cardBottomY - visibleH + 12);
      sv.scrollTo({ y: target, animated: true });
    }, 100);
    return () => clearTimeout(t);
  }, [kbHeight, editingId]);

  // 계좌 클립보드 복사 — 은행+계좌 한 줄 (예: "카카오뱅크 3333-12-3456789").
  // 송금 앱 paste 흐름 일치. expo-clipboard 동적 import.
  const onCopyAccount = async () => {
    const account = appStatus?.donationAccount;
    const bank = appStatus?.donationBank;
    if (!account) return;
    const payload = bank ? `${bank} ${account}` : account;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(payload);
      void logEvent('donation_account_copy');
      Alert.alert('계좌 복사', '은행과 계좌번호가 복사됐어요.');
    } catch {
      Alert.alert(
        '계좌 복사 실패',
        '복사를 지원하지 않는 환경이에요. 직접 입력해 주세요.',
      );
    }
  };

  const accountReady =
    !!appStatus?.donationBank &&
    !!appStatus?.donationAccount &&
    !!appStatus?.donationHolder;

  // 닉네임 표기 — 본인 닉네임이 없으면 '회원'.
  const myName = profile?.name?.trim() || '회원';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* TopNav */}
      <View style={styles.topNav}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.navSide}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
        >
          <ChevronLeft size={24} color="#1F2937" strokeWidth={2} />
        </Pressable>
        <Text style={styles.navTitle}>후원금으로 서비스 응원</Text>
        <View style={styles.navSide} />
      </View>

      {/* 키보드 회피 — KAV(iOS padding / Android height) + 편집시 명시적 scrollTo. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        ref={scrollRef}
        onLayout={onScrollViewLayout}
        // 핵심: ScrollView 자체에 flex:1 — KAV 안에서 KAV의 줄어든 영역에 맞춰
        // ScrollView 도 줄어들어야 내부 자동 스크롤이 동작. style 없으면 ScrollView
        // 가 contents 길이로 무한 확장돼 KAV가 줄어들어도 영향 안 받음.
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          // 키보드 올라올 때만 scroll 런웨이 — Figma baseline(16) override.
          // 닫혀있을 땐 그대로 16.
          kbHeight > 0 ? { paddingBottom: kbHeight } : null,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 일러스트 */}
        <View style={styles.illustWrap}>
          <DonationIllust width="100%" height={236} />
        </View>

        {/* 본문 텍스트 — {nickname}만 Bold + black */}
        <Text style={styles.body}>
          {'Pool’s day는\n'}
          {'수영을 좋아하는 한 사람이 운영하는 서비스입니다.\n'}
          {'\n'}
          <Text style={styles.bodyBoldName}>{myName}</Text>
          {'님의 즐거운 수영에 도움이 되었다면\n'}
          {'그것만으로도 충분히 기분 좋은 일이에요.\n'}
          {'\n'}
          {'Pool’s day를 응원해주고 싶으신 분은\n'}
          {'마음을 아래 계좌로 보내주세요.\n'}
          {'\n'}
          {'입금자명에 닉네임을 작성해주시면\n'}
          {'감사한 마음을 표현할 수 있습니다.\n'}
          {'\n'}
          {'후원금은 서비스 운영을 위해 사용됩니다.\n'}
          {'보내주신 마음에 감사합니다.'}
        </Text>

        {/* 카카오뱅크 계좌 카드 */}
        {accountReady ? (
          <View style={[styles.card, FIGMA_SHADOW_MD]}>
            <View style={styles.bankIconCircle}>
              <PiggyBank size={20} color="#4B5563" strokeWidth={2} />
            </View>
            <View style={styles.cardRight}>
              <View style={styles.bankInfoBlock}>
                <View style={styles.bankHeadRow}>
                  <Text style={styles.bankName} numberOfLines={1}>
                    {appStatus?.donationBank}
                  </Text>
                  <Text style={styles.bankHolder} numberOfLines={1}>
                    {appStatus?.donationHolder}
                  </Text>
                </View>
                <Text style={styles.bankAccount}>
                  {appStatus?.donationAccount}
                </Text>
              </View>
              <Pressable
                onPress={onCopyAccount}
                style={styles.actionBadge}
                accessibilityRole="button"
                accessibilityLabel="계좌번호 복사"
              >
                <Copy size={16} color="#4B5563" strokeWidth={2} />
                <Text style={styles.actionBadgeLabel}>계좌 복사</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={[styles.card, styles.cardEmpty]}>
            <Text style={styles.cardEmptyLabel}>
              후원 계좌 안내 준비 중입니다.
            </Text>
          </View>
        )}

        {/* 섹션 헤더 */}
        <Text style={styles.sectionHeading}>
          {'Pool’s day를 응원해주신 분들'}
        </Text>

        {/* 응원자 카드 리스트 */}
        <View style={styles.list} onLayout={onListLayout}>
          {items.map((item) => (
            <DonationItemCard
              key={item.id}
              item={item}
              editing={editingId === item.id}
              onStartEdit={() => setEditingId(item.id)}
              onCancelEdit={() => setEditingId(null)}
              onSaveEdit={async (msg) => {
                await updateMessage(item.id, msg);
                void logEvent('donation_message_edit');
                setEditingId(null);
              }}
              onHide={() => setHideId(item.id)}
              // 본인 카드만 위치 보고 — '응원글 보기' 진입 시 자동 스크롤 입력값.
              onMineLayout={item.mine ? onMineCardLayout : undefined}
            />
          ))}
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>아직 응원 메시지가 없어요.</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>

      </KeyboardAvoidingView>

      <DonationHideModal
        visible={!!hideId}
        onClose={() => setHideId(null)}
        onConfirm={() => {
          if (hideId) {
            void toggleHidden(hideId, true);
            void logEvent('donation_hide_toggle', { hidden: true });
          }
        }}
      />
    </SafeAreaView>
  );
}

function DonationItemCard({
  item,
  editing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onHide,
  onMineLayout,
}: {
  item: DonationItem;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (msg: string) => Promise<void>;
  onHide: () => void;
  onMineLayout?: (e: LayoutChangeEvent) => void;
}) {
  const [draft, setDraft] = React.useState(item.message);

  React.useEffect(() => {
    if (editing) setDraft(item.message);
  }, [editing, item.message]);

  const trimmed = draft.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= MAX_LEN;

  return (
    <View style={[styles.card, FIGMA_SHADOW_MD]} onLayout={onMineLayout}>
      <View style={styles.avatarWrap}>
        <Avatar
          photoUri={item.avatar}
          size={40}
          relation={item.mine ? 'me' : 'friend'}
          borderWidth={2}
        />
      </View>
      <View style={styles.cardRight}>
        <View style={styles.itemInfoBlock}>
          <View style={styles.itemHeadRow}>
            <Text style={styles.itemNickname} numberOfLines={1}>
              {item.nickname}
            </Text>
            <Text style={styles.itemTime} numberOfLines={1}>
              {formatDateTime(item.createdAt)}
            </Text>
          </View>
          {editing ? (
            <View style={styles.editBox}>
              <TextInput
                value={draft}
                onChangeText={(t) => setDraft(t.slice(0, MAX_LEN))}
                multiline
                style={styles.editInput}
                textAlignVertical="top"
                maxLength={MAX_LEN}
                autoFocus
              />
              <View style={styles.editCounterRow}>
                <Text style={styles.editCounter}>
                  {draft.length}/{MAX_LEN}
                </Text>
                {/* resize notch 데코레이션 — Figma 239:3408 */}
                <MoveDiagonal2 size={16} color="#94A3B8" strokeWidth={2} />
              </View>
            </View>
          ) : (
            <Text style={styles.itemMessage}>{item.message}</Text>
          )}
        </View>

        {/* 액션 영역 — 본인 카드만. editing=true면 [취소][작성 완료] (Figma 246:5946) */}
        {item.mine ? (
          editing ? (
            <View style={styles.cardActions}>
              <Pressable
                style={styles.cancelBadge}
                onPress={onCancelEdit}
                accessibilityRole="button"
                accessibilityLabel="문구 수정 취소"
              >
                <XCircle size={16} color="#4B5563" strokeWidth={2} />
                <Text style={styles.cancelBadgeLabel}>취소</Text>
              </Pressable>
              <Pressable
                style={styles.saveCta}
                onPress={async () => {
                  if (!canSave) return;
                  await onSaveEdit(trimmed);
                }}
                disabled={!canSave}
                accessibilityRole="button"
                accessibilityLabel="응원 문구 작성 완료"
              >
                <Edit3 size={16} color="#FFFFFF" strokeWidth={2} />
                <Text style={styles.saveCtaLabel}>작성 완료</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.cardActions}>
              <Pressable
                style={styles.actionBadge}
                onPress={onHide}
                accessibilityRole="button"
                accessibilityLabel="후원 비공개"
              >
                <Trash2 size={16} color="#4B5563" strokeWidth={2} />
                <Text style={styles.actionBadgeLabel}>후원 비공개</Text>
              </Pressable>
              <Pressable
                style={styles.actionBadge}
                onPress={onStartEdit}
                accessibilityRole="button"
                accessibilityLabel="문구 수정"
              >
                <Edit3 size={16} color="#4B5563" strokeWidth={2} />
                <Text style={styles.actionBadgeLabel}>문구 수정</Text>
              </Pressable>
            </View>
          )
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  flex: { flex: 1 },

  // TopNav — Figma 238:8645
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  navSide: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    flex: 1,
    fontFamily: tokens.font.sansSemibold,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    color: '#1F2937',
    textAlign: 'center',
  },

  // 본문 패딩(238:8646) — Frame p-16, gap-32 (디자인 스펙).
  // paddingBottom 16 = baseline 디자인 여백. 키보드 올라올 때만
  // contentContainerStyle 에서 kbHeight 만큼 가짜 여백을 추가로 깐다.
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 32,
  },

  illustWrap: { alignItems: 'center', width: '100%' },

  body: {
    fontFamily: tokens.font.sans,
    fontSize: 14,
    lineHeight: 22, // 14 * 1.6
    color: '#4B5563',
    textAlign: 'center',
  },
  bodyBoldName: {
    fontFamily: tokens.font.sansBold,
    color: '#000000',
  },

  // Notification 카드 공통 — Figma 238:8652 / 239:3142 etc.
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 24,
    width: '100%',
  },
  cardEmpty: {
    justifyContent: 'center',
    paddingVertical: 18,
  },
  cardEmptyLabel: {
    fontFamily: tokens.font.sans,
    fontSize: 13,
    color: '#4B5563',
    textAlign: 'center',
  },
  cardRight: { flex: 1, gap: 12 },

  // 계좌 카드 좌측 아이콘 컨테이너 — Figma 239:3188 (40×40, bg #F8FAFC, rounded full)
  bankIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankInfoBlock: { gap: 6 },
  bankHeadRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  bankName: {
    flex: 1,
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#1F2937',
  },
  bankHolder: {
    fontFamily: tokens.font.sans,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    color: '#4B5563',
  },
  bankAccount: {
    fontFamily: tokens.font.sans,
    fontSize: 14,
    lineHeight: 22, // 1.6
    color: '#4B5563',
  },

  // 액션 badge — Figma 239:3152 (border #cbd5e1 / rounded 10 / padding 12×6)
  actionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  actionBadgeLabel: {
    fontFamily: tokens.font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#4B5563',
  },

  // 섹션 헤더 — Figma 238:8649
  sectionHeading: {
    fontFamily: tokens.font.sansBold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#1F2937',
  },

  list: { gap: 12, marginTop: -16 }, // gap 32(섹션) 중 헤더↔리스트는 12로 (Figma 238:8648 inner gap)

  // 응원 카드 — Figma 238:8652
  avatarWrap: { width: 40, height: 40 },
  itemInfoBlock: { gap: 6 },
  itemHeadRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  itemNickname: {
    flex: 1,
    fontFamily: tokens.font.sansSemibold,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#1F2937',
  },
  itemTime: {
    fontFamily: tokens.font.sans,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    color: '#4B5563',
  },
  itemMessage: {
    fontFamily: tokens.font.sans,
    fontSize: 14,
    lineHeight: 22,
    color: '#4B5563',
  },

  cardActions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },

  // 인라인 textarea (편집 모드) — Figma 239:3404
  editBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    minHeight: 172,
    justifyContent: 'flex-end',
  },
  editInput: {
    flex: 1,
    fontFamily: tokens.font.sans,
    fontSize: 16,
    lineHeight: 26,
    color: '#4B5563',
    padding: 0,
  },
  editCounterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  editCounter: {
    fontFamily: tokens.font.sans,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: -0.06,
    color: '#94A3B8',
  },

  // 작성 완료 CTA — Figma 239:3417 (bg pd-mint, rounded 10, padding 12×6)
  saveCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: tokens.color.pdMint,
    borderWidth: 1,
    borderColor: tokens.color.pdMint,
  },
  saveCtaLabel: {
    fontFamily: tokens.font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#FFFFFF',
  },
  cancelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  cancelBadgeLabel: {
    fontFamily: tokens.font.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    color: '#4B5563',
  },

  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyText: {
    fontFamily: tokens.font.sans,
    fontSize: 13,
    color: '#4B5563',
  },
});
