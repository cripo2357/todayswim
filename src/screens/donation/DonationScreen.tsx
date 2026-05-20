// 후원으로 서비스 응원하기 — Figma 238:8643.
//
// 구성(스크롤):
// 1) 일러스트 (선물 받는 사람) + 운영자 인사 텍스트
// 2) 카카오뱅크 계좌 카드 + "계좌 복사" 버튼
// 3) "Pool's day를 응원해주신 분들" 응원자 리스트 (사용자별 최신 1건 dedup)
//    - 본인 카드엔 "후원 비공개"/"문구 수정" 액션
//    - 본인 미작성이면 빈 input + "작성 완료" 버튼
// 4) DonationHideModal (Figma 239:3426) — hidden 토글 확인
// 5) DonationEditModal — 신규 작성/수정 BottomSheet
//
// 데이터:
// - 카카오뱅크 계좌: useAppStatus().donationBank/Account/Holder (Supabase app_status, 0068)
// - 응원 메시지: useDonations() (donations 0069)
// - 입금자 감사 알림은 운영자가 donation_payments INSERT 시 트리거가 자동 발송(0070)

import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft, Copy, HeartHandshake } from 'lucide-react-native';
import { tokens } from '@/styles/tokens';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateTime } from '@/lib/dateFormat';
import { useAppStatus } from '@/hooks/useAppStatus';
import { useProfile } from '@/store/profile';
import {
  useDonations,
  useCreateDonation,
  useUpdateDonationMessage,
  useToggleDonationHidden,
  type DonationItem,
} from '@/hooks/useDonations';
import { DonationHideModal } from '@/components/donation/DonationHideModal';
import { DonationEditModal } from '@/components/donation/DonationEditModal';

const MAX_LEN = 300;

export function DonationScreen() {
  const navigation = useNavigation();
  const profile = useProfile((s) => s.profile);
  const { data: appStatus } = useAppStatus();
  const { items, mine } = useDonations();
  const createDonation = useCreateDonation();
  const updateMessage = useUpdateDonationMessage();
  const toggleHidden = useToggleDonationHidden();

  const [draft, setDraft] = React.useState('');
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editInitial, setEditInitial] = React.useState('');
  const [hideId, setHideId] = React.useState<string | null>(null);

  const trimmed = draft.trim();
  const canSubmit = !mine && trimmed.length > 0 && trimmed.length <= MAX_LEN;

  // 계좌 클립보드 복사 — expo-clipboard dynamic import(pending_native_batch).
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

  const onSubmitDraft = async () => {
    if (!canSubmit) return;
    const ok = await createDonation(trimmed);
    if (ok) setDraft('');
    else Alert.alert('작성 실패', '잠시 후 다시 시도해 주세요.');
  };

  const accountReady =
    !!appStatus?.donationBank &&
    !!appStatus?.donationAccount &&
    !!appStatus?.donationHolder;

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="뒤로"
        >
          <ChevronLeft size={24} color={tokens.color.ink900} />
        </Pressable>
        <Text style={styles.headerTitle}>후원금으로 서비스 응원</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* 일러스트 placeholder — Figma export 도착 시 Image source 교체. */}
        <View style={styles.illustWrap}>
          <View style={styles.illust}>
            <HeartHandshake
              size={88}
              color={tokens.color.pdBlue}
              strokeWidth={1.5}
            />
          </View>
        </View>

        <Text style={styles.intro}>
          Pool's day는{'\n'}수영을 좋아하는 한 사람이 운영하는 서비스입니다.
          {'\n\n'}
          <Text style={styles.introBold}>
            {profile?.name?.trim() || '회원'}님의 즐거운 수영에 도움이
            되었다면
          </Text>
          {'\n'}그것만으로도 충분히 기쁜 좋은 일이에요.
          {'\n\n'}
          Pool's day를 응원해주고 싶으신 분은{'\n'}
          마음을 아래 계좌로 보내주세요.
          {'\n\n'}
          입금자명에 닉네임을 작성해주시면{'\n'}
          감사한 마음을 표현할 수 있습니다.
          {'\n\n'}
          후원금은 서비스 운영을 위해 사용됩니다.{'\n'}
          보내주신 마음에 감사합니다.
        </Text>

        {/* 카카오뱅크 계좌 카드 */}
        {accountReady ? (
          <View style={styles.accountCard}>
            <View style={styles.accountTopRow}>
              <View style={styles.accountInfo}>
                <Text style={styles.accountBank}>
                  {appStatus?.donationBank}
                </Text>
                <Text style={styles.accountNumber}>
                  {appStatus?.donationAccount}
                </Text>
              </View>
              <Text style={styles.accountHolder} numberOfLines={1}>
                {appStatus?.donationHolder}
              </Text>
            </View>
            <Pressable
              onPress={onCopyAccount}
              style={styles.copyBtn}
              accessibilityRole="button"
              accessibilityLabel="계좌번호 복사"
            >
              <Copy size={14} color={tokens.color.ink900} strokeWidth={2} />
              <Text style={styles.copyLabel}>계좌 복사</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.accountCardEmpty}>
            <Text style={styles.accountEmptyLabel}>
              후원 계좌 안내 준비 중입니다.
            </Text>
          </View>
        )}

        <Text style={styles.sectionHeading}>Pool's day를 응원해주신 분들</Text>

        {/* 본인이 응원 안 한 상태면 작성 입력 — 첫 카드 자리 */}
        {!mine && profile ? (
          <View style={styles.draftCard}>
            <View style={styles.draftRowHead}>
              <Avatar
                photoUri={profile.photoUri}
                thumbUri={profile.photoThumbUri}
                size={36}
                relation="me"
              />
              <View style={styles.draftHeadText}>
                <Text style={styles.draftNickname} numberOfLines={1}>
                  {profile.name}
                </Text>
              </View>
            </View>
            <View style={styles.draftInputWrap}>
              <TextInput
                value={draft}
                onChangeText={(t) => setDraft(t.slice(0, MAX_LEN))}
                multiline
                placeholder="Pool's day를 응원합니다."
                placeholderTextColor={tokens.color.ink400}
                style={styles.draftInput}
                textAlignVertical="top"
                maxLength={MAX_LEN}
              />
              <Text style={styles.draftCounter}>
                {draft.length}/{MAX_LEN}
              </Text>
            </View>
            <Pressable
              onPress={onSubmitDraft}
              disabled={!canSubmit}
              style={[styles.draftSubmit, !canSubmit && styles.draftSubmitDim]}
              accessibilityRole="button"
              accessibilityLabel="응원 메시지 작성 완료"
            >
              <Text style={styles.draftSubmitLabel}>작성 완료</Text>
            </Pressable>
          </View>
        ) : null}

        {/* 응원자 리스트 — 사용자별 최신 1건 dedup, 최근순. 본인 카드도 포함. */}
        {items.map((item) => (
          <DonationItemCard
            key={item.id}
            item={item}
            onHide={() => setHideId(item.id)}
            onEdit={() => {
              setEditId(item.id);
              setEditInitial(item.message);
            }}
          />
        ))}

        {items.length === 0 && mine === null ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              아직 응원 메시지가 없어요. 첫 응원자가 되어주세요.
            </Text>
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>

      <DonationHideModal
        visible={!!hideId}
        onClose={() => setHideId(null)}
        onConfirm={() => {
          if (hideId) void toggleHidden(hideId, true);
        }}
      />

      <DonationEditModal
        visible={!!editId}
        initialValue={editInitial}
        onClose={() => setEditId(null)}
        onSubmit={async (msg) => {
          if (editId) await updateMessage(editId, msg);
        }}
      />
    </SafeAreaView>
  );
}

function DonationItemCard({
  item,
  onHide,
  onEdit,
}: {
  item: DonationItem;
  onHide: () => void;
  onEdit: () => void;
}) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHead}>
        <Avatar
          photoUri={item.avatar}
          size={36}
          relation={item.mine ? 'me' : 'friend'}
        />
        <View style={styles.itemHeadText}>
          <Text style={styles.itemNickname} numberOfLines={1}>
            {item.nickname}
          </Text>
          <Text style={styles.itemTime}>{formatDateTime(item.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.itemMessage}>{item.message}</Text>
      {item.hidden ? (
        <View style={styles.hiddenBadge}>
          <Text style={styles.hiddenBadgeLabel}>비공개</Text>
        </View>
      ) : null}
      {item.mine ? (
        <View style={styles.actions}>
          <Pressable
            onPress={onHide}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel="후원 비공개"
          >
            <Text style={styles.actionLabel}>후원 비공개</Text>
          </Pressable>
          <Pressable
            onPress={onEdit}
            style={styles.actionBtn}
            accessibilityRole="button"
            accessibilityLabel="문구 수정"
          >
            <Text style={styles.actionLabel}>문구 수정</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  header: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  scroll: { paddingHorizontal: 20, paddingBottom: 24 },

  illustWrap: { alignItems: 'center', marginTop: 8, marginBottom: 16 },
  illust: {
    width: '100%',
    aspectRatio: 16 / 10,
    backgroundColor: '#FFF7E6',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  intro: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
    marginBottom: 20,
  },
  introBold: { fontFamily: tokens.font.sansBold },

  accountCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 24,
  },
  accountCardEmpty: {
    backgroundColor: tokens.color.bgSubtle,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  accountEmptyLabel: {
    fontSize: 13,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
  accountTopRow: { flexDirection: 'row', alignItems: 'center' },
  accountInfo: { flex: 1 },
  accountBank: {
    fontSize: 13,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink500,
  },
  accountNumber: {
    fontSize: 16,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    marginTop: 2,
  },
  accountHolder: {
    fontSize: 13,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink500,
    maxWidth: 140,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    borderRadius: 8,
    backgroundColor: tokens.color.bgSubtle,
  },
  copyLabel: {
    fontSize: 13,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },

  sectionHeading: {
    fontSize: 16,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    marginBottom: 12,
  },

  draftCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
  },
  draftRowHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  draftHeadText: { flex: 1 },
  draftNickname: {
    fontSize: 14,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  draftInputWrap: {
    backgroundColor: tokens.color.bgSubtle,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  draftInput: {
    minHeight: 80,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  draftCounter: {
    marginTop: 6,
    alignSelf: 'flex-end',
    fontSize: 12,
    color: tokens.color.ink400,
  },
  draftSubmit: {
    height: 40,
    borderRadius: 999,
    backgroundColor: tokens.color.pdByellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftSubmitDim: { opacity: 0.5 },
  draftSubmitLabel: {
    fontSize: 14,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },

  itemCard: {
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
    marginBottom: 12,
  },
  itemHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemHeadText: { flex: 1, gap: 2 },
  itemNickname: {
    fontSize: 14,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  itemTime: {
    fontSize: 12,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
  itemMessage: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
  },
  hiddenBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: tokens.color.bgSubtle,
  },
  hiddenBadgeLabel: {
    fontSize: 11,
    fontFamily: tokens.font.sansMedium,
    color: tokens.color.ink500,
  },
  actions: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.color.lineDefault,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 13,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
});
