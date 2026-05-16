// Figma 129:5245 — 설정. 내 정보(MyInfo) 상단 우측 톱니 → 진입.
//
// 구조: TopNav(뒤로/설정/빈칸) + 섹션 6개(계정/알림/수영 일정/수영장 정보 수정/
// 헬프 센터/서비스 약관) + 구분선 + 푸터(워드마크/버전/카피라이트).
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
} from '@/store/prefs';
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
import IconCalendarCheck from '@assets/icons/settings/calendar-check.svg';
import IconMegaphone from '@assets/icons/settings/megaphone.svg';
import IconQuestion from '@assets/icons/settings/question.svg';
import IconGavel from '@assets/icons/settings/gavel.svg';
import IconPerson from '@assets/icons/settings/person.svg';
import IconMapPin from '@assets/icons/settings/map-pin.svg';

const FEEDBACK_EMAIL = 'cripo2357@gmail.com';

// 내 일정의 다른 참여자 보기 — OptionSheet 옵션 + 행 우측 표시값
const VIEW_OPTIONS: Option<OthersScheduleView>[] = [
  { value: 'friends', label: '참여하는 친구들만 보기' },
  { value: 'public', label: '모든 참여자 보기' },
];
const VIEW_VALUE: Record<OthersScheduleView, string> = {
  friends: '참여 친구만',
  public: '모든 참여자',
};
// 수영 일정 초대
const INVITE_OPTIONS: Option<ScheduleInvite>[] = [
  { value: 'on', label: '초대 받기' },
  { value: 'off', label: '초대 안 받기' },
];
const INVITE_VALUE: Record<ScheduleInvite, string> = {
  on: '받음',
  off: '안 받음',
};

export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const signOut = useAuth((s) => s.signOut);
  const [pushOn, setPushOn] = React.useState(true);

  const othersView = usePrefs((s) => s.othersScheduleView);
  const setOthersView = usePrefs((s) => s.setOthersScheduleView);
  const scheduleInvite = usePrefs((s) => s.scheduleInvite);
  const setScheduleInvite = usePrefs((s) => s.setScheduleInvite);
  const [viewSheet, setViewSheet] = React.useState(false);
  const [inviteSheet, setInviteSheet] = React.useState(false);

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
        {/* 계정 */}
        <Section title="계정">
          <Row
            icon={<IconProfile width={24} height={24} />}
            label="프로필"
            onPress={() => navigation.navigate('Profile')}
          />
          <Row
            icon={<IconLogout width={24} height={24} />}
            label="로그아웃"
            onPress={onLogout}
          />
          <Row
            icon={<IconTrash width={24} height={24} />}
            label="회원 탈퇴"
            destructive
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

        {/* 수영 일정 */}
        <Section title="수영 일정">
          <Row
            icon={<IconCalendar width={24} height={24} />}
            label="내 일정의 다른 참여자 보기"
            value={VIEW_VALUE[othersView]}
            onPress={() => setViewSheet(true)}
          />
          <Row
            icon={<IconEnvelope width={24} height={24} />}
            label="수영 일정 초대"
            value={INVITE_VALUE[scheduleInvite]}
            onPress={() => setInviteSheet(true)}
          />
        </Section>

        {/* 수영장 정보 수정 */}
        <Section title="수영장 정보 수정">
          <Row
            icon={<IconLifeBuoy width={24} height={24} />}
            label="새로운 수영장 등록 요청"
            onPress={() => navigation.navigate('PoolName', { mode: 'create' })}
          />
          <Row
            icon={<IconCalendarCheck width={24} height={24} />}
            label="자유수영 시간표 수정 요청"
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

        {/* 푸터 (129:5971) — 워드마크 + 버전 + 카피라이트 */}
        <View style={styles.footer}>
          <BrandWordmark width={131} height={78} />
          <View style={styles.footerText}>
            <Text style={styles.version}>Pool’s day v1.0.0</Text>
            <Text style={styles.copyright}>© 2026 CRIPO. All right reserved</Text>
          </View>
        </View>
      </ScrollView>

      <OptionSheet<OthersScheduleView>
        visible={viewSheet}
        onClose={() => setViewSheet(false)}
        title="내 일정의 다른 참여자 보기"
        options={VIEW_OPTIONS}
        value={othersView}
        onConfirm={(v) => setOthersView(v)}
      />
      <OptionSheet<ScheduleInvite>
        visible={inviteSheet}
        onClose={() => setInviteSheet(false)}
        title="수영 일정 초대"
        options={INVITE_OPTIONS}
        value={scheduleInvite}
        onConfirm={(v) => setScheduleInvite(v)}
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
