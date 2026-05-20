// 알림 설정 — 설정 > 알림 > 알림 설정. Figma 223:2799.
//
// 구조: 푸시 알림(마스터) / 알림 유형 5 / 광고성 정보(마케팅 + 약관 보기) /
//      잠금 안내(P0 — 약관 변경·운영자 안내).
//
// 토글 정책(안 A):
//  · 마스터 OFF → OS 푸시 전체 차단(인박스는 적재). 카테고리 토글 값은 보존
//    (사용자가 미리 조합 만들어두는 패턴 — 카카오톡과 동일).
//  · 카테고리 OFF → 해당 그룹 OS 푸시만 차단, 인박스는 적재.
//  · 마케팅 OFF → 정통망법 §50 별도 동의 철회 — 인박스도 차단 + 동의일 제거.
//  · P0(약관 변경 / 닉네임 강제 변경) → 어떤 토글과도 무관, 항상 발송.
//
// 동의일 = AsyncStorage 'poolsday.terms.marketing' (ISO timestamp,
// lib/terms.ts setConsent). 토글 = 그 timestamp의 존재 여부.
// dispatch 단계에서 group→pref 매핑 게이팅은 P2 (스펙 §1191).

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronRight } from 'lucide-react-native';

import type { RootStackParamList } from '@/navigation/types';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { Toast } from '@/components/ui/Toast';
import { tokens } from '@/styles/tokens';
import { usePrefs } from '@/store/prefs';
import { formatDateTime, formatKoreanLong } from '@/lib/dateFormat';

import IconBell from '@assets/icons/settings/bell.svg';
import IconBellOff from '@assets/icons/settings/bell-off.svg';
import IconUsers from '@assets/icons/settings/users.svg';
import IconSwimming from '@assets/icons/settings/swimming.svg';
import IconCheckSeal from '@assets/icons/settings/check-seal.svg';
import IconMegaphone from '@assets/icons/settings/megaphone.svg';
import IconChartAxis from '@assets/icons/settings/chart-axis.svg';
import IconGift from '@assets/icons/settings/gift.svg';
import IconLock from '@assets/icons/lock-secure.svg';

const K_TERMS_MARKETING = 'poolsday.terms.marketing';
const K_TERMS_MARKETING_REJECTED = 'poolsday.terms.marketing.rejected';

export function NotificationSettingsScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const pushOn = usePrefs((s) => s.pushOn);
  const setPushOn = usePrefs((s) => s.setPushOn);
  const friend = usePrefs((s) => s.notifFriendInvite);
  const setFriend = usePrefs((s) => s.setNotifFriendInvite);
  const sched = usePrefs((s) => s.notifScheduleReminder);
  const setSched = usePrefs((s) => s.setNotifScheduleReminder);
  const submit = usePrefs((s) => s.notifSubmissionResult);
  const setSubmit = usePrefs((s) => s.setNotifSubmissionResult);
  const svc = usePrefs((s) => s.notifServiceAnnounce);
  const setSvc = usePrefs((s) => s.setNotifServiceAnnounce);
  const report = usePrefs((s) => s.notifMonthlyReport);
  const setReport = usePrefs((s) => s.setNotifMonthlyReport);
  const marketing = usePrefs((s) => s.notifMarketing);
  const setMarketing = usePrefs((s) => s.setNotifMarketing);

  // 마케팅 동의/거부 시점(ISO) — prefs는 boolean만 캐시. 화면 진입·토글
  // 변경 시 둘 다 읽어 현재 상태에 맞는 sublabel(동의일시 or 거부일시) 노출.
  const [consentAt, setConsentAt] = React.useState<string | null>(null);
  const [rejectedAt, setRejectedAt] = React.useState<string | null>(null);
  React.useEffect(() => {
    let alive = true;
    Promise.all([
      AsyncStorage.getItem(K_TERMS_MARKETING),
      AsyncStorage.getItem(K_TERMS_MARKETING_REJECTED),
    ]).then(([c, r]) => {
      if (alive) {
        setConsentAt(c);
        setRejectedAt(r);
      }
    });
    return () => {
      alive = false;
    };
  }, [marketing]);

  // sublabel 결정 — ON이면 동의일시, OFF이면 (거부 이력 있을 때만) 거부일시.
  const marketingSublabel = marketing
    ? consentAt
      ? `동의일시: ${formatDateTime(consentAt)}`
      : undefined
    : rejectedAt
    ? `거부일시: ${formatDateTime(rejectedAt)}`
    : undefined;

  // 마케팅 토글 변경 시 토스트(정통망법 §50 — 사용자 의사 확인용 가시화).
  // ~4초 자동 사라짐, X 탭 즉시 닫힘. 토글 핸들러에서 직접 trigger(useEffect로
  // 마케팅 변화 감지하면 hydrate 단계에서도 false-positive로 튀는 위험 있음).
  type MarketingToastVariant = 'agreed' | 'rejected';
  const [toast, setToast] = React.useState<
    { variant: MarketingToastVariant; at: string } | null
  >(null);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const dismissToast = React.useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = null;
    setToast(null);
  }, []);
  React.useEffect(
    () => () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    },
    [],
  );

  const onToggleMarketing = () => {
    const next = !marketing;
    setMarketing(next);
    const now = new Date().toISOString();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ variant: next ? 'agreed' : 'rejected', at: now });
    toastTimerRef.current = setTimeout(() => setToast(null), 4000);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader title="알림 설정" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {/* 푸시 알림 (마스터) — 행 아이콘은 토글 따라 bell↔bell-off 스왑 */}
        <Section title="푸시 알림">
          <ToggleRow
            icon={
              pushOn ? (
                <IconBell width={24} height={24} />
              ) : (
                <IconBellOff width={24} height={24} />
              )
            }
            label="푸시 알림"
            on={pushOn}
            onToggle={() => setPushOn(!pushOn)}
          />
        </Section>

        {/* 알림 유형 — 5 카테고리. 마스터 = 이 5개의 OR(derived).
            전부 OFF면 마스터도 자동 OFF, 토글 시 마스터로 cascade. */}
        <Section title="알림 유형">
          <ToggleRow
            icon={<IconUsers width={24} height={24} />}
            label="친구 초대"
            on={friend}
            onToggle={() => setFriend(!friend)}
          />
          <ToggleRow
            icon={<IconSwimming width={24} height={24} />}
            label="예정된 수영 일정"
            on={sched}
            onToggle={() => setSched(!sched)}
          />
          <ToggleRow
            icon={<IconCheckSeal width={24} height={24} />}
            label="정보 수정 요청 및 처리결과"
            on={submit}
            onToggle={() => setSubmit(!submit)}
          />
          <ToggleRow
            icon={<IconMegaphone width={24} height={24} />}
            label="서비스 안내"
            on={svc}
            onToggle={() => setSvc(!svc)}
          />
          <ToggleRow
            icon={<IconChartAxis width={24} height={24} />}
            label="수영 리포트"
            on={report}
            onToggle={() => setReport(!report)}
          />
        </Section>

        {/* 광고성 정보 — 정통망법 §50 별도 동의. 마스터 cascade·집계와
            완전 독립(법적 동의 보호: 마스터 OFF가 동의 철회로 이어지면 안 됨). */}
        <Section title="광고성 정보">
          <ToggleRow
            icon={<IconGift width={24} height={24} />}
            label="이벤트·마케팅 알림"
            sublabel={marketingSublabel}
            on={marketing}
            onToggle={onToggleMarketing}
          />
          <NavRow
            icon={<IconGift width={24} height={24} />}
            label="마케팅 정보 수신 동의 약관 보기"
            onPress={() =>
              navigation.navigate('TermsDetail', { termsKey: 'marketing' })
            }
          />
        </Section>

        {/* P0 잠금 안내 — 카드 아닌 텍스트 + 자물쇠 아이콘(중앙) */}
        <View style={styles.lockSection}>
          <View style={styles.divider} />
          <View style={styles.lockContent}>
            <IconLock width={24} height={24} />
            <Text style={styles.lockText}>
              약관 변경, 운영자 안내사항, 사용자 권리 및 법적 의무{'\n'}
              알림은 수신거부 할 수 없습니다.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 마케팅 토글 변경 토스트 — 헤더 아래, 좌우 16px, 4초 후 자동 사라짐. */}
      {toast ? (
        <View style={styles.toastWrap} pointerEvents="box-none">
          <Toast
            title={
              toast.variant === 'agreed'
                ? '마케팅 정보 수신 동의'
                : '마케팅 정보 수신 동의 철회'
            }
            message={
              toast.variant === 'agreed'
                ? `${formatKoreanLong(toast.at)}에 마케팅 정보 수신에 동의하였습니다.`
                : `${formatKoreanLong(toast.at)}에 마케팅 정보 수신 동의를 철회하였습니다.`
            }
            action={{ label: '확인', onPress: dismissToast }}
            onClose={dismissToast}
          />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

// ── Components ────────────────────────────────────────────────────────────

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

function ToggleRow({
  icon,
  label,
  sublabel,
  on,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        {icon}
        <View style={styles.labelBox}>
          <Text style={styles.rowLabel} numberOfLines={1}>
            {label}
          </Text>
          {sublabel ? (
            <Text style={styles.rowSublabel} numberOfLines={1}>
              {sublabel}
            </Text>
          ) : null}
        </View>
      </View>
      <Toggle on={on} onToggle={onToggle} />
    </View>
  );
}

function NavRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.cardLeft}>
        {icon}
        <Text style={styles.rowLabel} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <ChevronRight size={20} color="#CBD5E1" strokeWidth={2} />
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

// ── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgCream },
  body: { padding: 16, gap: 32 },

  section: { gap: 12 },
  sectionTitle: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  rows: { gap: 12 },

  // Settings Simple 카드 — SettingsScreen 컨벤션 동일
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
  labelBox: { flexShrink: 1, gap: 0 },

  rowLabel: {
    flexShrink: 1,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  // Figma sub: Text sm/Regular 14/20 -0.084 #4B5563
  rowSublabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },

  // Toggle Only — 52x28, r123, knob 24 white
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

  // 토스트 위치 — ScreenHeader(minHeight 48) 바로 아래 + 8px 여백, 좌우 16
  toastWrap: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 10,
  },

  // 잠금 섹션 — 광고성 정보 아래 구분선 + 자물쇠 + 2줄 텍스트(중앙)
  lockSection: { gap: 32, alignItems: 'stretch' },
  divider: {
    height: 1,
    backgroundColor: tokens.color.lineDefault,
  },
  lockContent: { gap: 16, alignItems: 'center' },
  // Figma: Paragraph/sm Regular 14, lineHeight 1.6, #4B5563, center
  lockText: {
    fontSize: 14,
    lineHeight: 22, // 14 * 1.6 ≈ 22.4
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
});
