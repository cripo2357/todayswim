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
  type ScheduleInvite,
  type ProfileVisibility,
  type FriendRequest,
  type MapFriendHorizon,
  type MapPublicHorizon,
  type MyScheduleVisibility,
} from '@/store/prefs';
import { useProfile } from '@/store/profile';
import { usePools } from '@/hooks/usePools';
import { OptionSheet, type Option } from '@/components/ui/OptionSheet';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { ConfirmLogoutModal } from '@/components/settings/ConfirmLogoutModal';
import { WithdrawFlowModal } from '@/components/settings/WithdrawFlowModal';
import { tokens } from '@/styles/tokens';
import { logEvent } from '@/lib/analytics';
import BrandWordmark from '@assets/illustrations/wordmark-poolsday-color.svg';
import { WordmarkDroplets } from '@/components/ui/WordmarkDroplets';
import IconProfile from '@assets/icons/settings/profile.svg';
// 프로필과 일정 공유 행 아이콘 변경(Figma 163:6666 → share, baked pd-mint)
import IconShare from '@assets/icons/settings/share.svg';
import IconLogout from '@assets/icons/settings/logout.svg';
// 회원 탈퇴 아이콘 변경(Figma 163:10349 trash → hand-pan). hand-pan.svg는
// currentColor(모달서 파랑/흰색 재사용) → 설정 행은 color=pdMint 명시.
import IconHandPan from '@assets/icons/hand-pan.svg';
import IconBell from '@assets/icons/settings/bell.svg';
import IconBellOff from '@assets/icons/settings/bell-off.svg';
import IconEnvelope from '@assets/icons/settings/envelope.svg';
import IconLifeBuoy from '@assets/icons/settings/life-buoy.svg';
import IconEditPencil from '@assets/icons/settings/edit-pencil.svg';
import IconHeart from '@assets/icons/settings/heart.svg';
import IconMegaphone from '@assets/icons/settings/megaphone.svg';
import IconQuestion from '@assets/icons/settings/question.svg';
import IconGavel from '@assets/icons/settings/gavel.svg';
import IconPerson from '@assets/icons/settings/person.svg';
import IconUsers from '@assets/icons/settings/users.svg';
import IconHandHeart from '@assets/icons/settings/hand-heart.svg';
import IconPiggyBank from '@assets/icons/settings/piggy-bank.svg';
import IconMapPin from '@assets/icons/settings/map-pin.svg';
// 지도 섹션 행 아이콘 (Figma 179:4763) — 내 일정·레슨 = me(단일), 친구
// 일정 = users(2명), 사람들 일정 = people(3명). me/people은 신규 export,
// users는 기존 settings/users.svg 재사용.
import IconMe from '@assets/icons/settings/me.svg';
import IconPeople from '@assets/icons/settings/people.svg';

const FEEDBACK_EMAIL = 'cripo2357@gmail.com';

// (수영 일정 공유는 '프로필과 일정 공유'로 병합 — profileVisibility 단일 제어)
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
// 친구 수영 일정 (Figma 179:4763) — prefs.mapFriendHorizon 4값.
// '표시 안함' / '일정 N 전부터 보기' — 옵션 라벨과 우측 표시값 동일.
const MAP_FRIEND_VALUE: Record<MapFriendHorizon, string> = {
  d1: '일정 1일 전부터 보기',
  h12: '일정 12시간 전부터 보기',
  h6: '일정 6시간 전부터 보기',
  off: '표시 안함',
};
const MAP_FRIEND_OPTIONS: Option<MapFriendHorizon>[] = [
  { value: 'off', label: MAP_FRIEND_VALUE.off },
  { value: 'h6', label: MAP_FRIEND_VALUE.h6 },
  { value: 'h12', label: MAP_FRIEND_VALUE.h12 },
  { value: 'd1', label: MAP_FRIEND_VALUE.d1 },
];
// 사람들 수영 일정 (Figma 179:4763, NEW) — prefs.mapPublicHorizon.
// horizon enum이 친구와 동일 — 동일 라벨 매핑 재사용. 행 자체는 profileVis
// ==='public'일 때만 노출(친구공개면 미표시).
const MAP_PUBLIC_VALUE: Record<MapPublicHorizon, string> = MAP_FRIEND_VALUE;
const MAP_PUBLIC_OPTIONS: Option<MapPublicHorizon>[] = MAP_FRIEND_OPTIONS;
// 내 수영 일정·레슨 (Figma 179:4763) — prefs.myScheduleVisibility 2값.
// 옵션 라벨(시트)과 우측 표시값(행)이 다름:
//   friends: "친구만 보기"        → "친구만 보기"
//   public : "모두 볼 수 있음"    → "모두에게 공개"
// 'public' 옵션은 profileVisibility==='public'일 때만 노출(친구공개면 숨김).
// 정책 (2026-05-22): 'off'/'self' 옵션 폐기 — 내 일정·레슨은 최소한 친구
// 에게는 항상 노출. 기존 'off'/'self' 저장값은 hydrate 가 'friends'로 자동 마이그.
const MY_SCHED_VIS_VALUE: Record<MyScheduleVisibility, string> = {
  friends: '친구만 보기',
  public: '모두에게 공개',
};
const MY_SCHED_VIS_OPTION_LABEL: Record<MyScheduleVisibility, string> = {
  friends: '친구만 보기',
  public: '모두 볼 수 있음',
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
  nickname: '닉네임으로만',
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
  return `ID(${id})로만`;
}
export function SettingsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const signOut = useAuth((s) => s.signOut);
  const deleteAccount = useAuth((s) => s.deleteAccount);
  const authUser = useAuth((s) => s.user);
  // 알림 행 아이콘 — "푸시 1개라도 ON" → bell, 아니면 bell-off. pushOn은
  // 5 sub의 OR(derived) — 마케팅을 더하면 정확히 "6개 중 하나라도 ON".
  // 마케팅은 법적 분리(정통망법 §50)라 마스터 cascade·집계에 포함 X.
  const anyNotifOn = usePrefs((s) => s.pushOn || s.notifMarketing);

  const scheduleInvite = usePrefs((s) => s.scheduleInvite);
  const setScheduleInvite = usePrefs((s) => s.setScheduleInvite);
  const profileVis = usePrefs((s) => s.profileVisibility);
  const setProfileVis = usePrefs((s) => s.setProfileVisibility);
  const friendReq = usePrefs((s) => s.friendRequest);
  const setFriendReq = usePrefs((s) => s.setFriendRequest);
  const profile = useProfile((s) => s.profile);
  const [inviteSheet, setInviteSheet] = React.useState(false);
  const [profileSheet, setProfileSheet] = React.useState(false);
  const [friendReqSheet, setFriendReqSheet] = React.useState(false);
  const [mapFriendSheet, setMapFriendSheet] = React.useState(false);
  const [mapPublicSheet, setMapPublicSheet] = React.useState(false);
  const [myScheduleVisSheet, setMyScheduleVisSheet] = React.useState(false);

  // 지도 시작 위치 — 행 우측 표시값(내 위치 / 수영장명). 즐겨찾기 해제 시
  // useFavorites가 prefs.mapStartPoolId를 null로 리셋.
  const mapStartPoolId = usePrefs((s) => s.mapStartPoolId);
  const mapFriendHorizon = usePrefs((s) => s.mapFriendHorizon);
  const setMapFriendHorizon = usePrefs((s) => s.setMapFriendHorizon);
  const mapPublicHorizon = usePrefs((s) => s.mapPublicHorizon);
  const setMapPublicHorizon = usePrefs((s) => s.setMapPublicHorizon);
  const myScheduleVisibility = usePrefs((s) => s.myScheduleVisibility);
  const setMyScheduleVisibility = usePrefs((s) => s.setMyScheduleVisibility);
  // 내 수영 일정·레슨 옵션 — 'public'은 프로필 공개가 'public'일 때만 노출.
  // 'friends'에서 'public' 선택은 모순(친구공개인데 일정은 전체) → 숨김.
  const myScheduleVisOptions = React.useMemo<Option<MyScheduleVisibility>[]>(() => {
    // profileVis='public' 일 때만 'public' 옵션 노출 — 친구공개에선 모순.
    const base: MyScheduleVisibility[] =
      profileVis === 'public' ? ['friends', 'public'] : ['friends'];
    return base.map((v) => ({ value: v, label: MY_SCHED_VIS_OPTION_LABEL[v] }));
  }, [profileVis]);
  const { data: poolsData } = usePools();
  const startPool = mapStartPoolId
    ? (poolsData ?? []).find((p) => p.id === mapStartPoolId)
    : null;
  const startLocLabel = startPool?.name ?? '내 위치';

  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const onLogout = () => setLogoutOpen(true);
  const [withdrawOpen, setWithdrawOpen] = React.useState(false);
  const withdrawNickname =
    authUser?.nickname || profile?.name || '회원';

  const sendMail = () => {
    const url = `mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent(
      "[Pool’s day] 문의",
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

        {/* 알림 (Figma 129:5998) — 진입형 단일 Row. 푸시 알림 1개라도 ON
            이면 bell, 아무것도 안 받으면 bell-off. */}
        <Section title="알림">
          <Row
            icon={
              anyNotifOn ? (
                <IconBell width={24} height={24} />
              ) : (
                <IconBellOff width={24} height={24} />
              )
            }
            label="알림 설정"
            onPress={() => navigation.navigate('NotificationSettings')}
          />
        </Section>

        {/* 사용자 관계 — Figma 129:6006. 3행 prefs + OptionSheet.
            '프로필과 일정 공유'(profileVisibility)가 프로필 공개 + 수영
            일정 공유를 단일 제어. 실동작 연동은 친구 시스템 Phase2,
            선택값은 로컬 영속. */}
        <Section title="사용자 관계">
          <Row
            icon={<IconShare width={24} height={24} />}
            label="프로필과 일정 공유"
            value={PROFILE_VIS_VALUE[profileVis]}
            onPress={() => setProfileSheet(true)}
          />
          <Row
            icon={<IconHandHeart width={24} height={24} />}
            label="친구 신청 받기"
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
            label="즐겨찾는 수영장"
            onPress={() => navigation.navigate('FavoritePools')}
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

        {/* 지도 (Figma 179:4763) — 시작 위치 / 내 수영 일정·레슨 /
            친구 수영 일정 / (profileVis='public'일 때) 사람들 수영 일정. */}
        <Section title="지도">
          <Row
            icon={<IconMapPin width={24} height={24} />}
            label="지도 시작 위치"
            value={startLocLabel}
            onPress={() => navigation.navigate('MapStartLocation')}
          />
          <Row
            icon={<IconMe width={24} height={24} />}
            label="내 수영 일정·레슨"
            value={MY_SCHED_VIS_VALUE[myScheduleVisibility]}
            onPress={() => setMyScheduleVisSheet(true)}
          />
          <Row
            icon={<IconUsers width={24} height={24} />}
            label="친구 수영 일정"
            value={MAP_FRIEND_VALUE[mapFriendHorizon]}
            onPress={() => setMapFriendSheet(true)}
          />
          {profileVis === 'public' ? (
            <Row
              icon={<IconPeople width={24} height={24} />}
              label="사람들 수영 일정"
              value={MAP_PUBLIC_VALUE[mapPublicHorizon]}
              onPress={() => setMapPublicSheet(true)}
            />
          ) : null}
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
            onPress={() => navigation.navigate('Faq')}
          />
          <Row
            icon={<IconEnvelope width={24} height={24} />}
            label="Pool’s day에 메일 보내기"
            onPress={sendMail}
          />
          <Row
            icon={<IconPiggyBank width={24} height={24} />}
            label="후원으로 서비스 응원하기"
            onPress={() => navigation.navigate('Donation')}
          />
        </Section>

        {/* 서비스 약관 (Figma 129:5245) — 가입후 조회용 4종. 단일
            TermsDetail 템플릿에 termsKey 만 바꿔 진입. */}
        <Section title="서비스 약관">
          <Row
            icon={<IconGavel width={24} height={24} />}
            label="서비스 이용약관"
            onPress={() =>
              navigation.navigate('TermsDetail', { termsKey: 'service' })
            }
          />
          <Row
            icon={<IconPerson width={24} height={24} />}
            label="개인정보 처리방침"
            onPress={() =>
              navigation.navigate('TermsDetail', { termsKey: 'privacyPolicy' })
            }
          />
          <Row
            icon={<IconMapPin width={24} height={24} />}
            label="위치기반서비스 이용약관"
            onPress={() =>
              navigation.navigate('TermsDetail', { termsKey: 'location' })
            }
          />
          <Row
            icon={<IconMegaphone width={24} height={24} />}
            label="마케팅 정보 수신 동의"
            onPress={() =>
              navigation.navigate('TermsDetail', { termsKey: 'marketing' })
            }
          />
        </Section>

        <View style={styles.divider} />

        {/* 계정 (Figma 163:10343) — 구분선 아래, 회원 탈퇴 + 로그아웃 */}
        <Section title="계정">
          <Row
            icon={
              <IconHandPan
                width={24}
                height={24}
                color={tokens.color.pdMint}
              />
            }
            label="회원 탈퇴"
            onPress={() => setWithdrawOpen(true)}
          />
          <Row
            icon={<IconLogout width={24} height={24} />}
            label="로그아웃"
            onPress={onLogout}
          />
        </Section>

        {/* 푸터 (129:5971) — 워드마크 + 버전 + 카피라이트.
            워드마크 apostrophe(#EAFF00) 위치에서 노란 쉼표 물방울이 솟아오름
            (스플래시와 동일 모션, 색은 apostrophe 컬러). */}
        <View style={styles.footer}>
          <View style={styles.wordmarkBox}>
            <BrandWordmark width={256} height={152} />
            <WordmarkDroplets
              width={256}
              height={152}
              color={tokens.color.pdMint}
              offsetX={-10}
              offsetY={-41}
              count={3}
              duration={1500}
              scale={1.15}
            />
          </View>
          <View style={styles.footerText}>
            <Text style={styles.version}>Pool’s day v1.0.0</Text>
            <Text style={styles.copyright}>© 2026 CRIPO. All right reserved</Text>
          </View>
        </View>
      </ScrollView>

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
        title="프로필과 일정 공유"
        options={PROFILE_VIS_OPTIONS}
        value={profileVis}
        onConfirm={(v) => setProfileVis(v)}
      />
      <OptionSheet<FriendRequest>
        visible={friendReqSheet}
        onClose={() => setFriendReqSheet(false)}
        title="친구 신청 받기"
        options={FRIEND_REQ_OPTIONS}
        value={friendReq}
        onConfirm={(v) => setFriendReq(v)}
      />
      <OptionSheet<MapFriendHorizon>
        visible={mapFriendSheet}
        onClose={() => setMapFriendSheet(false)}
        title="친구 수영 일정"
        options={MAP_FRIEND_OPTIONS}
        value={mapFriendHorizon}
        onConfirm={(v) => setMapFriendHorizon(v)}
      />
      <OptionSheet<MapPublicHorizon>
        visible={mapPublicSheet}
        onClose={() => setMapPublicSheet(false)}
        title="사람들 수영 일정"
        options={MAP_PUBLIC_OPTIONS}
        value={mapPublicHorizon}
        onConfirm={(v) => setMapPublicHorizon(v)}
      />
      <OptionSheet<MyScheduleVisibility>
        visible={myScheduleVisSheet}
        onClose={() => setMyScheduleVisSheet(false)}
        title="내 수영 일정·레슨"
        options={myScheduleVisOptions}
        value={myScheduleVisibility}
        onConfirm={(v) => setMyScheduleVisibility(v)}
      />

      <ConfirmLogoutModal
        visible={logoutOpen}
        onConfirm={async () => {
          void logEvent('logout');
          setLogoutOpen(false);
          await signOut();
          // 로그아웃 처리 후 맵으로 (스택 리셋 — 뒤로가기로 설정 복귀 방지)
          navigation.reset({ index: 0, routes: [{ name: 'MapMain' }] });
        }}
        onClose={() => setLogoutOpen(false)}
      />

      <WithdrawFlowModal
        visible={withdrawOpen}
        nickname={withdrawNickname}
        onClose={() => setWithdrawOpen(false)}
        onDeleted={async () => {
          setWithdrawOpen(false);
          await deleteAccount();
          // 탈퇴 후 맵으로 (스택 리셋 — 뒤로가기로 설정 복귀 방지). 로그아웃과 동일.
          navigation.reset({ index: 0, routes: [{ name: 'MapMain' }] });
        }}
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

  // 구분선 (129:5324) — full-width hairline
  divider: {
    height: 1,
    backgroundColor: tokens.color.lineDefault,
    marginHorizontal: -16,
  },

  // 푸터 (129:5971) — column center, gap 20
  footer: { alignItems: 'center', gap: 20 },
  // 워드마크 + droplet 오버레이 공용 박스. 워드마크 표시 크기와 동일.
  wordmarkBox: { width: 256, height: 152 },
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
