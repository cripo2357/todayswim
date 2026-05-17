// Figma 129:5245 — 설정. 내 정보(MyInfo) 상단 우측 톱니 → 진입.
//
// 구조: TopNav(뒤로/설정/빈칸) + 섹션 6개(계정/알림/사용자 관계/수영장 정보
// 수정/헬프 센터/서비스 약관) + 구분선 + 푸터(워드마크/버전/카피라이트).
// 행 아이콘은 Figma export SVG(색 baked: pdMint #63CBE8, 회원탈퇴 trash #F43F5E)
// → color prop 없이 그대로 렌더 (gender 아이콘과 동일 컨벤션).
//
// 행 동작: 기존 화면이 있는 것만 연결, 미존재 대상은 비활성(추후 연결).

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight } from 'lucide-react-native';

import type { RootStackParamList } from '@/navigation/types';
import { useAuth } from '@/store/auth';
import {
  usePrefs,
  type OthersScheduleView,
  type ScheduleInvite,
  type ProfileVisibility,
  type FriendRequest,
  type AgeVisibility,
} from '@/store/prefs';
import { useProfile } from '@/store/profile';
import { OptionSheet, type Option } from '@/components/ui/OptionSheet';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { tokens } from '@/styles/tokens';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday-light.svg';
import IconProfile from '@assets/icons/settings/profile.svg';
import IconLogout from '@assets/icons/settings/logout.svg';
import IconTrash from '@assets/icons/settings/trash.svg';
import IconBell from '@assets/icons/settings/bell.svg';
import IconCalendar from '@assets/icons/settings/calendar.svg';
import IconEnvelope from '@assets/icons/settings/envelope.svg';
import IconLifeBuoy from '@assets/icons/settings/life-buoy.svg';
import IconEditPencil from '@assets/icons/settings/edit-pencil.svg';
import IconHeart from '@assets/icons/settings/heart.svg';
import IconMegaphone from '@assets/icons/settings/megaphone.svg';
import IconQuestion from '@assets/icons/settings/question.svg';
import IconGavel from '@assets/icons/settings/gavel.svg';
import IconPerson from '@assets/icons/settings/person.svg';
import IconMapPin from '@assets/icons/settings/map-pin.svg';

const FEEDBACK_EMAIL = 'cripo2357@gmail.com';

// 다른 사람 수영 일정 보기 — OptionSheet 옵션 + 행 우측 표시값 (Figma 129:6006)
const VIEW_OPTIONS: Option<OthersScheduleView>[] = [
  { value: 'friends', label: '친구 일정만 보기' },
  { value: 'public', label: '모든 일정 보기' },
];
const VIEW_VALUE: Record<OthersScheduleView, string> = {
  friends: '친구 일정만',
  public: '모든 일정',
};
// 친구의 수영 일정 초대
const INVITE_OPTIONS: Option<ScheduleInvite>[] = [
  { value: 'on', label: '초대 받기' },
  { value: 'off', label: '초대 안 받기' },
];
const INVITE_VALUE: Record<ScheduleInvite, string> = {
  on: '받음',
  off: '안 받음',
};
// 내 프로필 공개
const PROFILE_VIS_OPTIONS: Option<ProfileVisibility>[] = [
  { value: 'friends', label: '친구에게만 공개' },
  { value: 'public', label: '전체 공개' },
];
const PROFILE_VIS_VALUE: Record<ProfileVisibility, string> = {
  friends: '친구만',
  public: '모두에게',
};
// 친구 신청 받기
const FRIEND_REQ_OPTIONS: Option<FriendRequest>[] = [
  { value: 'off', label: '신청 안 받기' },
  { value: 'id', label: 'ID로만 신청 받기' },
  { value: 'nickname', label: '닉네임으로만 신청 받기' },
  { value: 'all', label: '모두에게 신청 받기' },
];
const FRIEND_REQ_VALUE: Record<Exclude<FriendRequest, 'id'>, string> = {
  off: '안 받음',
  nickname: '닉네임 아는 사람에게만',
  all: '모든 사람에게',
};
/**
 * 행 우측 표시값 — 'id'는 내 친구 코드(ID) 포함 문구.
 * ID는 시스템 계정 식별 UUID와 별개로, 사용자가 다른 사용자와 친구 맺기
 * 위해 쓰는 코드. 시스템이 계정 생성 시 발급(기존 계정은 hydrate 백필)하고
 * 사용자가 변경할 수 있음 — 값은 바뀌어도 '항상 존재'하므로
 * 없음 처리 분기는 두지 않음(불변이라서가 아니라 항상 발급되므로).
 */
function friendReqValue(v: FriendRequest, id: string): string {
  if (v !== 'id') return FRIEND_REQ_VALUE[v];
  return `내 ID(${id}) 아는 사람에게만 받기`;
}
// 나이 공개 (Figma 129:6006) — 선택 옵션
const AGE_VIS_OPTIONS: Option<AgeVisibility>[] = [
  { value: 'private', label: '비공개' },
  { value: 'ageGroup', label: '연령대로 공개' },
  { value: 'exact', label: '나이 공개' },
];

/** birthDate(YYYY-MM-DD) → 만 나이. 형식 오류 시 null */
function calcKoreanAge(birthDate?: string): number | null {
  if (!birthDate) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
  if (!m) return null;
  const by = +m[1];
  const bm = +m[2];
  const bd = +m[3];
  const now = new Date();
  let age = now.getFullYear() - by;
  const mo = now.getMonth() + 1;
  const d = now.getDate();
  if (mo < bm || (mo === bm && d < bd)) age -= 1;
  return age >= 0 ? age : null;
}

/** 행 우측 표시값 — 비공개 / 만 N0대 / 만 N세 */
function ageVisValue(v: AgeVisibility, birthDate?: string): string {
  if (v === 'private') return '비공개';
  const age = calcKoreanAge(birthDate);
  if (age === null) return v === 'ageGroup' ? '연령대로 공개' : '나이 공개';
  return v === 'ageGroup' ? `만 ${Math.floor(age / 10) * 10}대` : `만 ${age}세`;
}

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const signOut = useAuth((s) => s.signOut);
  const [pushOn, setPushOn] = React.useState(true);

  const othersView = usePrefs((s) => s.othersScheduleView);
  const setOthersView = usePrefs((s) => s.setOthersScheduleView);
  const scheduleInvite = usePrefs((s) => s.scheduleInvite);
  const setScheduleInvite = usePrefs((s) => s.setScheduleInvite);
  const profileVis = usePrefs((s) => s.profileVisibility);
  const setProfileVis = usePrefs((s) => s.setProfileVisibility);
  const friendReq = usePrefs((s) => s.friendRequest);
  const setFriendReq = usePrefs((s) => s.setFriendRequest);
  const ageVis = usePrefs((s) => s.ageVisibility);
  const setAgeVis = usePrefs((s) => s.setAgeVisibility);
  const profile = useProfile((s) => s.profile);
  const [viewSheet, setViewSheet] = React.useState(false);
  const [inviteSheet, setInviteSheet] = React.useState(false);
  const [profileSheet, setProfileSheet] = React.useState(false);
  const [friendReqSheet, setFriendReqSheet] = React.useState(false);
  const [ageSheet, setAgeSheet] = React.useState(false);

  // 프로필 '친구만' 공개면 다른 사람 일정 보기는 '친구 일정만'으로 강제 (전체 옵션 미노출)
  const viewOptions =
    profileVis === 'friends'
      ? VIEW_OPTIONS.filter((o) => o.value === 'friends')
      : VIEW_OPTIONS;

  const onLogout = () => {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '로그아웃', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const sendMail = () => {
    const url = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
      "[Pool's Day] 운영진에게 문의",
    )}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('메일 앱을 열 수 없어요', `직접 ${FEEDBACK_EMAIL} 로 보내주세요.`);
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title="설정" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 (Figma 129:5990) */}
        <Section title="프로필">
          <Row
            icon={<IconProfile width={24} height={24} />}
            label="프로필"
            onPress={() => navigation.navigate('Profile')}
          />
        </Section>

        {/* 알림 */}
        <Section title="알림">
          <Row
            icon={<IconBell width={24} height={24} />}
            label="푸시 알림 받기"
            right={<Toggle on={pushOn} onToggle={() => setPushOn((v) => !v)} />}
          />
        </Section>

        {/* 사용자 관계 — Figma 129:6006. 4행 모두 prefs + OptionSheet
            (실동작 연동은 친구 시스템 Phase2, 선택값은 로컬 영속). */}
        <Section title="사용자 관계">
          <Row
            icon={<IconProfile width={24} height={24} />}
            label="내 프로필 공개"
            value={PROFILE_VIS_VALUE[profileVis]}
            onPress={() => setProfileSheet(true)}
          />
          <Row
            icon={<IconCalendar width={24} height={24} />}
            label="다른 사람 수영 일정 보기"
            value={VIEW_VALUE[othersView]}
            onPress={() => setViewSheet(true)}
          />
          <Row
            icon={<IconProfile width={24} height={24} />}
            label="나이 공개"
            value={ageVisValue(ageVis, profile?.birthDate)}
            onPress={() => setAgeSheet(true)}
          />
          <Row
            icon={<IconPerson width={24} height={24} />}
            label="친구 신청"
            value={friendReqValue(friendReq, profile?.id ?? '')}
            onPress={() => setFriendReqSheet(true)}
          />
          <Row
            icon={<IconEnvelope width={24} height={24} />}
            label="친구의 수영 일정 초대"
            value={INVITE_VALUE[scheduleInvite]}
            onPress={() => setInviteSheet(true)}
          />
        </Section>

        {/* 수영장 (Figma 133:5162) */}
        <Section title="수영장">
          <Row
            icon={<IconHeart width={24} height={24} />}
            label="수영장 즐겨찾기"
            onPress={() => navigation.navigate('PoolList')}
          />
          <Row
            icon={<IconLifeBuoy width={24} height={24} />}
            label="새로운 수영장 등록 요청"
            onPress={() => navigation.navigate('PoolName', { mode: 'create' })}
          />
          <Row
            icon={<IconEditPencil width={24} height={24} />}
            label="수영장 정보 수정 요청"
            onPress={() => navigation.navigate('PoolName', { mode: 'edit' })}
          />
        </Section>

        {/* 헬프 센터 */}
        <Section title="헬프 센터">
          <Row
            icon={<IconMegaphone width={24} height={24} />}
            label="공지사항"
            onPress={() => navigation.navigate('Announcements')}
          />
          <Row
            icon={<IconQuestion width={24} height={24} />}
            label="자주 묻는 질문"
          />
          <Row
            icon={<IconEnvelope width={24} height={24} />}
            label="운영진에게 메일 보내기"
            onPress={sendMail}
          />
        </Section>

        {/* 서비스 약관 */}
        <Section title="서비스 약관">
          <Row
            icon={<IconGavel width={24} height={24} />}
            label="서비스 이용 약관"
            onPress={() => navigation.navigate('TermsService')}
          />
          <Row
            icon={<IconPerson width={24} height={24} />}
            label="개인정보 처리 방침"
            onPress={() => navigation.navigate('TermsPrivacy')}
          />
          <Row
            icon={<IconMapPin width={24} height={24} />}
            label="위치정보 처리 방침"
          />
        </Section>

        <View style={styles.divider} />

        {/* 계정 (Figma 163:10343) — 구분선 아래, 회원 탈퇴 + 로그아웃 */}
        <Section title="계정">
          <Row
            icon={<IconTrash width={24} height={24} />}
            label="회원 탈퇴"
          />
          <Row
            icon={<IconLogout width={24} height={24} />}
            label="로그아웃"
            onPress={onLogout}
          />
        </Section>

        {/* 푸터 (129:5971) — 워드마크 + 버전 + 카피라이트 */}
        <View style={styles.footer}>
          <BrandWordmark width={256} height={152} />
          <View style={styles.footerText}>
            <Text style={styles.version}>Pool’s day v1.0.0</Text>
            <Text style={styles.copyright}>© 2026 CRIPO. All right reserved</Text>
          </View>
        </View>
      </ScrollView>

      <OptionSheet<OthersScheduleView>
        visible={viewSheet}
        onClose={() => setViewSheet(false)}
        title="다른 사람 수영 일정 보기"
        options={viewOptions}
        value={othersView}
        onConfirm={(v) => setOthersView(v)}
      />
      <OptionSheet<ScheduleInvite>
        visible={inviteSheet}
        onClose={() => setInviteSheet(false)}
        title="친구의 수영 일정 초대"
        options={INVITE_OPTIONS}
        value={scheduleInvite}
        onConfirm={(v) => setScheduleInvite(v)}
      />
      <OptionSheet<ProfileVisibility>
        visible={profileSheet}
        onClose={() => setProfileSheet(false)}
        title="내 프로필 공개"
        options={PROFILE_VIS_OPTIONS}
        value={profileVis}
        onConfirm={(v) => setProfileVis(v)}
      />
      <OptionSheet<FriendRequest>
        visible={friendReqSheet}
        onClose={() => setFriendReqSheet(false)}
        title="친구 신청"
        options={FRIEND_REQ_OPTIONS}
        value={friendReq}
        onConfirm={(v) => setFriendReq(v)}
      />
      <OptionSheet<AgeVisibility>
        visible={ageSheet}
        onClose={() => setAgeSheet(false)}
        title="나이 공개"
        options={AGE_VIS_OPTIONS}
        value={ageVis}
        onConfirm={(v) => setAgeVis(v)}
      />
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.rows}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
  onPress,
  right,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !right}
      style={({ pressed }) => [
        styles.card,
        pressed && onPress ? styles.cardPressed : null,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
    >
      <View style={styles.cardLeft}>
        {icon}
        <Text
          style={[styles.rowLabel, destructive && styles.rowLabelDestructive]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      {right ?? (
        <View style={styles.cardRight}>
          {value ? <Text style={styles.rowValue}>{value}</Text> : null}
          <ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
        </View>
      )}
    </Pressable>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <Pressable
      onPress={onToggle}
      accessibilityRole="switch"
      accessibilityState={{ checked: on }}
      style={[
        styles.toggle,
        { backgroundColor: on ? tokens.color.pdMint : '#CBD5E1' },
      ]}
    >
      <View style={[styles.toggleKnob, on ? styles.knobOn : styles.knobOff]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgCream },

  // 본문 (129:5264) — padding 16, 섹션 간 gap 32
  body: { padding: 16, gap: 32 },

  // 섹션 (header + rows), gap 12
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  rows: { gap: 12 },

  // Settings Simple 카드 (129:5993) — white, r16, px12 py16, gap12, Shadow/md
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: tokens.color.bgPaper,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: { opacity: 0.6 },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Text sm/SemiBold 14/20 -0.084 #1F2937
  rowLabel: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  rowLabelDestructive: { color: '#F43F5E' },
  // Text sm/Regular 14/20 -0.084 #4B5563
  rowValue: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },

  // Toggle Only (133:5777) — 52x28, r123, knob 24 white
  toggle: {
    width: 52,
    height: 28,
    borderRadius: 123,
    padding: 2,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: tokens.color.white,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  knobOn: { alignSelf: 'flex-end' },
  knobOff: { alignSelf: 'flex-start' },

  // 구분선 (129:5324) — full-width hairline
  divider: {
    height: 1,
    backgroundColor: tokens.color.lineDefault,
    marginHorizontal: -16,
  },

  // 푸터 (129:5971) — column center, gap 20
  footer: { alignItems: 'center', gap: 20 },
  footerText: { alignItems: 'center', gap: 8 },
  // Figma 129:5976 — Regular (bold 제거)
  version: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#1F2937',
    textAlign: 'center',
  },
  copyright: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: tokens.color.black,
    textAlign: 'center',
  },
});
