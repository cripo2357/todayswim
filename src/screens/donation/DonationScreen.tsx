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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
  const profile = useProfile((s) => s.profile);
  const { data: appStatus } = useAppStatus();
  const { items } = useDonations();
  const updateMessage = useUpdateDonationMessage();
  const toggleHidden = useToggleDonationHidden();

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [hideId, setHideId] = React.useState<string | null>(null);

  // 명시적 scrollTo 폐기 — KAV behavior='height' + ScrollView flex:1 +
  // paddingBottom 만으로 RN 자동 키보드 스크롤이 정상 동작. 추가 scrollTo
  // 는 카드를 너무 위로 밀어 헤더(아바타+닉네임) 가 사라지는 회귀(2026-05-21).

  // 키보드 회피 — 인라인 textarea 편집 시 키보드가 본인 카드를 가리지 않도록
  // ScrollView contentContainerStyle.paddingBottom 을 키보드 높이만큼 늘려서
  // focus된 TextInput 까지 자동 스크롤 가능하게 함(RN의 기본 keyboardOnFocus
  // 스크롤이 paddingBottom 부족하면 안 동작). 외부 라이브러리 미사용.
  const [kbHeight, setKbHeight] = React.useState(0);
  React.useEffect(() => {
    const showEvt =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvt =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvt, (e: KeyboardEvent) =>
      setKbHeight(e.endCoordinates.height),
    );
    const hideSub = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // 계좌 클립보드 복사 — expo-clipboard 동적 import.
  const onCopyAccount = async () => {
    const account = appStatus?.donationAccount;
    if (!account) return;
    try {
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(account);
      Alert.alert('계좌 복사', '계좌번호가 복사됐어요.');
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

      {/* 키보드 회피 — 화면 전체가 키보드 위로 올라오도록.
       *  iOS: padding, Android: 'height' (KAV 자체 높이를 키보드 높이만큼
       *  shrink → ScrollView 가 그 안에서 자동 scroll 가능). Android에서
       *  behavior=undefined는 no-op이라 스크롤이 안 됐던 회귀(2026-05-21).
       *  내부 ScrollView paddingBottom + 명시적 scrollTo와 결합. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        // 핵심: ScrollView 자체에 flex:1 — KAV 안에서 KAV의 줄어든 영역에 맞춰
        // ScrollView 도 줄어들어야 내부 자동 스크롤이 동작. style 없으면 ScrollView
        // 가 contents 길이로 무한 확장돼 KAV가 줄어들어도 영향 안 받음.
        // (PoolNameScreen 등 다른 키보드 화면의 검증된 패턴.)
        style={styles.flex}
        contentContainerStyle={[
          styles.scroll,
          // 키보드 올라올 때만 그만큼 가짜 여백 — 자동 스크롤이 본인 카드를
          // 키보드 위로 올릴 수 있는 contents 길이 확보용. 닫혀있을 땐 0
          // (콘텐츠 끝 + scroll.paddingBottom 기본값으로 자연스럽게 끝남).
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
        <View style={styles.list}>
          {items.map((item) => (
            <DonationItemCard
              key={item.id}
              item={item}
              editing={editingId === item.id}
              onStartEdit={() => setEditingId(item.id)}
              onCancelEdit={() => setEditingId(null)}
              onSaveEdit={async (msg) => {
                await updateMessage(item.id, msg);
                setEditingId(null);
              }}
              onHide={() => setHideId(item.id)}
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
          if (hideId) void toggleHidden(hideId, true);
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
}: {
  item: DonationItem;
  editing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (msg: string) => Promise<void>;
  onHide: () => void;
}) {
  const [draft, setDraft] = React.useState(item.message);

  React.useEffect(() => {
    if (editing) setDraft(item.message);
  }, [editing, item.message]);

  const trimmed = draft.trim();
  const canSave = trimmed.length > 0 && trimmed.length <= MAX_LEN;

  return (
    <View style={[styles.card, FIGMA_SHADOW_MD]}>
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

        {/* 액션 영역 — 본인 카드만. editing=true면 "작성 완료" CTA로 단일 액션 */}
        {item.mine ? (
          editing ? (
            <View style={styles.cardActions}>
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
              <Pressable
                style={styles.cancelBadge}
                onPress={onCancelEdit}
                accessibilityRole="button"
                accessibilityLabel="문구 수정 취소"
              >
                <XCircle size={16} color="#4B5563" strokeWidth={2} />
                <Text style={styles.cancelBadgeLabel}>취소</Text>
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
