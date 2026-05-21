// Figma 134:9643 / 120:3167 — 내 정보. 3탭 텍스트: 스케줄 / 사람들 / 메시지
// (기본=스케줄). 내부 키는 '달력'/'친구'/'알림' 식별자 유지.
// 스케줄=CalendarTab, 사람들=FriendsTab, 메시지=NotificationsTab.
// 프로필은 별도 화면(ProfileScreen, 설정>프로필)으로 분리 — ProfileTab은 여기서
// export 되어 재사용됨(보기+수정, 저장 버튼 없이 즉시 반영).

import React from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
  Platform, Alert, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import IconCake from '@assets/icons/cake.svg';
import IconArrowUpload from '@assets/icons/arrow-upload.svg';
import IconEdit from '@assets/icons/edit.svg';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import IconIntro from '@assets/icons/intro.svg';
import IconIdChange from '@assets/icons/id-change.svg';
import IconIdCopy from '@assets/icons/id-copy.svg';
import {
  isNicknameTaken,
  claimNickname,
  sanitizeNickname,
  nicknameBlockReason,
  nicknameBlockReasonRemote,
  NICKNAME_NOTICE,
} from '@/lib/nicknames';
import { Tooltip } from '@/components/ui/Tooltip';
import { IdChangeModal, IdChangeDoneModal } from '@/components/profile/IdChangeModals';

import {
  useProfile,
  ALL_CERTIFICATIONS,
  ALL_IM100_RECORDS,
  PROFILE_VIS_DEFAULT,
  type UserProfile,
  type Stroke,
  type Certification,
  type IM100Record,
} from '@/store/profile';
import { Toggle } from '@/components/ui/Toggle';
import { isBundleAvatar, BUNDLE_AVATARS } from '@/lib/avatars';
import { DAY_ORDER, groupByDay, formatClassChip } from '@/lib/swimClass';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import { CalendarSheet } from '@/components/auth/CalendarSheet';
import { GenderSheet } from '@/components/auth/GenderSheet';
import { pickProfileImage } from '@/lib/pickProfileImage';
import { uploadProfileAvatar } from '@/lib/uploadProfileAvatar';
import { CalendarTab } from '@/components/calendar/CalendarTab';
import { NotificationsTab } from '@/components/notifications/NotificationsTab';
import { FriendsTab } from '@/components/friends/FriendsTab';
import { useSwimSchedules, isSchedulePast } from '@/store/swimSchedule';
import {
  useUnreadCount,
  useMarkAllNotificationsAsRead,
} from '@/hooks/useNotifications';
import { useFriends } from '@/store/friends';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import IconUser from '@assets/icons/user-profile.svg';
import IconGenderMale from '@assets/icons/gender-male.svg';
import IconGenderFemale from '@assets/icons/gender-female.svg';
import IconLock from '@assets/icons/lock-secure.svg';
import IconSettings from '@assets/icons/settings.svg';
import IconSectionBasic from '@assets/icons/section-basic.svg';
import IconLaneCount from '@assets/icons/lane-count.svg';

const ALL_STROKES: Stroke[] = ['자유형', '배영', '접영', '평영'];
const EXP_MAX = 30;
const BIO_MAX = 10;
const TABS = ['달력', '친구', '알림'] as const;
type Tab = (typeof TABS)[number];

export function MyInfoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const [tab, setTab] = React.useState<Tab>('달력');

  // 탭 카운터 — 달력: 앞으로 예정된(지나지 않은) 내 일정 수,
  // 친구: 친구 수, 알림: 읽지 않은 알림(0이면 배지 미노출, max 99).
  const schedules = useSwimSchedules((s) => s.schedules);
  const upcomingCount = React.useMemo(
    () => schedules.filter((x) => !isSchedulePast(x)).length,
    [schedules],
  );
  // 친구 수 — store 단일 출처(차단/삭제 반영). MOCK 정적 길이 금지.
  const friendCount = useFriends((s) => s.friends.length);
  // P3-A5: 서버 count(*) 기반 + 탭 진입 시 DB read=true 일괄 UPDATE.
  const unread = useUnreadCount();
  const markAllRead = useMarkAllNotificationsAsRead();

  // profile 없으면(비정상 진입) 안전하게 뒤로.
  React.useEffect(() => {
    if (!profile) navigation.goBack();
  }, [profile, navigation]);
  if (!profile) return null;

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <ScreenHeader
        title="내 정보"
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            hitSlop={8}
            accessibilityLabel="설정"
            onPress={() => navigation.navigate('Settings')}
          >
            <IconSettings width={24} height={24} color={tokens.color.ink900} />
          </Pressable>
        }
      />

      {/* 탭 바 (Figma 134:9655) */}
      <View style={styles.tabWrap}>
        <View style={styles.tabGroup}>
          {TABS.map((t) => {
            const active = t === tab;
            // Figma 120:3167 — 탭 텍스트: 스케줄 / 사람들 / 메시지
            // (내부 키 '달력'/'친구'/'알림'은 식별자로 유지)
            const label =
              t === '달력'
                ? `스케줄 (${upcomingCount})`
                : t === '친구'
                  ? `사람들 (${friendCount})`
                  : '메시지';
            return (
              <Pressable
                key={t}
                onPress={() => {
                  setTab(t);
                  // 진입 시 DB read=true 일괄 UPDATE + 카운트/목록 query 무효화.
                  if (t === '알림') void markAllRead();
                }}
                style={[styles.tabItem, active && styles.tabItemActive]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {/* Figma 133:6053 — 읽지 않은 알림 배지(우상단, 0이면 미노출, max 99) */}
        {unread > 0 ? (
          <View style={styles.unreadBadge} pointerEvents="none">
            <Text style={styles.unreadBadgeText}>{Math.min(unread, 99)}</Text>
          </View>
        ) : null}
      </View>

      {tab === '달력' && <CalendarTab />}
      {tab === '친구' && <FriendsTab />}
      {tab === '알림' && <NotificationsTab />}
    </SafeAreaView>
  );
}

export function ProfileTab({
  profile,
  patch,
}: {
  profile: UserProfile;
  patch: (p: Partial<UserProfile>) => void;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  // 내 정보에서는 ProfileImage 화면을 거치지 않고 바로 파일 선택기 → 즉시 반영.
  const onPickPhoto = async () => {
    const r = await pickProfileImage();
    if (r.status === 'denied') {
      Alert.alert(
        '사진 권한 필요',
        '프로필 사진을 등록하려면 설정에서 사진 보관함 접근을 허용해주세요.',
      );
      return;
    }
    if (r.status === 'too_large') {
      Alert.alert(
        '사진이 너무 큽니다',
        '더 작은 사진을 선택하거나 사진 앱에서 크기를 줄여 다시 시도해주세요.',
      );
      return;
    }
    if (r.status !== 'ok') return; // canceled / error
    // 낙관적 표시 + 옛 썸네일 잔상 제거(스택은 원본 폴백)
    patch({ photoUri: r.uri, photoThumbUri: undefined });
    const up = await uploadProfileAvatar(r.base64, r.thumbBase64);
    if (up.status === 'ok') {
      patch({ photoUri: up.url, photoThumbUri: up.thumbUrl }); // 로컬→공개 URL
    }
    // skipped/error → 로컬 URI 유지 (무손실, 현행 동작)
  };
  const [bio, setBio] = React.useState(profile.bio ?? '');
  const bioInputRef = React.useRef<TextInput>(null);
  const [bioEditing, setBioEditing] = React.useState(false);
  // "변경" 버튼: 비활성 → 편집 시작 / 편집 중 → 저장.
  const onBioButton = () => {
    if (!bioEditing) {
      setBioEditing(true);
      setTimeout(() => bioInputRef.current?.focus(), 0);
      return;
    }
    patch({ bio: bio.trim() });
    setBioEditing(false);
    bioInputRef.current?.blur();
  };
  const [showCalendar, setShowCalendar] = React.useState(false);
  const [showGender, setShowGender] = React.useState(false);

  // ── 계정 ID (Figma 117:2556 / 163:6737 / 163:6885) ──
  const [idChangeOpen, setIdChangeOpen] = React.useState(false);
  const [idDoneOpen, setIdDoneOpen] = React.useState(false);
  const [idCopied, setIdCopied] = React.useState(false);
  const copyTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
  const onCopyId = async () => {
    try {
      // 지연 import — expo-clipboard는 import 시점에 requireNativeModule을
      // 실행해 네이티브 미빌드(현 dev 클라이언트) 시 throw → top-level import
      // 하면 런타임 전체 크래시("Runtime not ready"). 동적 import로 격리.
      const Clipboard = await import('expo-clipboard');
      await Clipboard.setStringAsync(profile.id);
    } catch {
      // 네이티브 모듈 미빌드 시에도 툴팁은 노출(다음 EAS 빌드 후 정상).
    }
    setIdCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setIdCopied(false), 2000);
  };
  const onConfirmIdChange = async () => {
    await useProfile.getState().regenerateId();
    setIdChangeOpen(false);
    setIdDoneOpen(true);
  };

  // 2그룹(수영기간/영법/자격증/IM100) — 변경 즉시 저장하지 않고 로컬 state로
  // 보관하다가 화면 이탈(탭 변경/뒤로가기 = ProfileTab unmount) 시 일괄 저장.
  const [exp, setExp] = React.useState(profile.experienceYears);
  const [strokes, setStrokes] = React.useState<Stroke[]>(profile.strokes);
  const [certs, setCerts] = React.useState<Certification[]>(
    profile.certifications ?? ['없음'],
  );
  const [im100, setIm100] = React.useState<IM100Record | undefined>(
    profile.im100Record,
  );
  const swimRef = React.useRef({ exp, strokes, certs, im100, dirty: false });
  React.useEffect(() => {
    swimRef.current = {
      exp,
      strokes,
      certs,
      im100,
      dirty: swimRef.current.dirty,
    };
  }, [exp, strokes, certs, im100]);
  const markSwimDirty = () => {
    swimRef.current.dirty = true;
  };
  // unmount(탭 변경·뒤로가기) 시 변경분 있으면 일괄 저장.
  React.useEffect(
    () => () => {
      const s = swimRef.current;
      if (!s.dirty) return;
      const cur = useProfile.getState().profile;
      if (!cur) return;
      useProfile.getState().save({
        ...cur,
        experienceYears: s.exp,
        strokes: s.strokes,
        certifications: s.certs,
        im100Record: s.im100,
      });
    },
    [],
  );

  // 가능 영법 4개 모두 선택 시에만 자격증·IM100 활성(사용자 확정).
  // 3개 이하로 바뀌면 자격증=없음 / IM100=기록 없음 강제 + 칩 비활성,
  // 그리고 자격증·IM100 공개여부도 비공개로 강제 + 토글 비활성.
  const strokesComplete = strokes.length === ALL_STROKES.length;
  React.useEffect(() => {
    if (strokesComplete) return;
    let changed = false;
    if (!(certs.length === 1 && certs[0] === '없음')) {
      setCerts(['없음']);
      changed = true;
    }
    if (im100 !== '기록 없음') {
      setIm100('기록 없음');
      changed = true;
    }
    if (changed) markSwimDirty();
    // 공개여부(showCerts/showIm100)는 store 즉시 반영(patch). 현재 효과값이
    // 공개일 때만 false 로 — 이미 비공개면 재패치 없음(루프 방지).
    const visPatch: Partial<UserProfile> = {};
    if (profile.showCerts ?? PROFILE_VIS_DEFAULT.showCerts) {
      visPatch.showCerts = false;
    }
    if (profile.showIm100 ?? PROFILE_VIS_DEFAULT.showIm100) {
      visPatch.showIm100 = false;
    }
    if (Object.keys(visPatch).length > 0) patch(visPatch);
  }, [strokesComplete, certs, im100, profile.showCerts, profile.showIm100]);

  // 닉네임 인라인 변경 (Figma 120:3030 / 129:6307 / 129:6296)
  const nickInputRef = React.useRef<TextInput>(null);
  const [nick, setNick] = React.useState(profile.name);
  // 위반 안내문구(중복/사칭/욕설) — 없으면 null
  const [nickErr, setNickErr] = React.useState<string | null>(null);
  // 기본 비활성(읽기). "변경" 누르면 편집 활성, 다시 누르면 검증·저장.
  const [nickEditing, setNickEditing] = React.useState(false);

  const onChangeNick = (v: string) => {
    setNick(sanitizeNickname(v));
    setNickErr(null);
  };
  // "변경" 버튼: 비활성 → 편집 시작 / 편집 중 → 검증·저장.
  const onNickButton = async () => {
    if (!nickEditing) {
      setNickEditing(true);
      setTimeout(() => nickInputRef.current?.focus(), 0);
      return;
    }
    const next = nick.trim();
    if (next === profile.name) {
      setNickEditing(false);
      nickInputRef.current?.blur();
      return;
    }
    if (next.length < 2 || next.length > 6) return; // 안내문이 가이드
    // 1차: 즉시·오프라인 정적 검사
    const reason = nicknameBlockReason(next);
    if (reason) {
      setNickErr(NICKNAME_NOTICE[reason]);
      return;
    }
    // 변경 적용 시점 서버 차단어 검사 — 운영자가 갱신한 nickname_blocklist
    // 를 그 자리에서 조회(최신). 조회 실패 시 null(fail-open).
    const remoteReason = await nicknameBlockReasonRemote(next);
    if (remoteReason) {
      setNickErr(NICKNAME_NOTICE[remoteReason]);
      return;
    }
    if (await isNicknameTaken(next)) {
      setNickErr(NICKNAME_NOTICE.taken);
      return;
    }
    patch({ name: next });
    await claimNickname(next);
    setNickErr(null);
    setNickEditing(false);
    nickInputRef.current?.blur();
  };

  const toggleStroke = (s: Stroke) => {
    setStrokes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );
    markSwimDirty();
  };

  const toggleCert = (c: Certification) => {
    setCerts((prev) => {
      if (c === '없음') return ['없음'];
      const withoutNone = prev.filter((x) => x !== '없음');
      const next = withoutNone.includes(c)
        ? withoutNone.filter((x) => x !== c)
        : [...withoutNone, c];
      // 모든 자격증이 해제되면 '없음'이 자동 선택 (Figma 120:3054).
      return next.length === 0 ? ['없음'] : next;
    });
    markSwimDirty();
  };

  return (
    <>
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* 아바타 + 업로드 (Figma 130:3599 — 80px, byellow 외곽선, 검정 32 버튼) */}
      <View style={styles.avatarWrap}>
        <View style={styles.avatar}>
          <View style={styles.avatarInner}>
            {isBundleAvatar(profile.photoUri) ? (
              React.createElement(BUNDLE_AVATARS[profile.photoUri], {
                width: 76,
                height: 76,
              })
            ) : profile.photoUri ? (
              <Image source={{ uri: profile.photoUri }} style={styles.avatarImg} />
            ) : (
              <IconUser width={36} height={36} />
            )}
          </View>
        </View>
        <Pressable
          onPress={onPickPhoto}
          style={styles.avatarUploadBtn}
          accessibilityLabel="사진 변경"
        >
          <IconArrowUpload width={18} height={18} color={tokens.color.white} />
        </Pressable>
      </View>

      {/* 닉네임 + 계정 ID (Figma 130:3577) — gap8, ID행 가운데 정렬 */}
      <View style={styles.profileHeadText}>
        <Text style={styles.profileName}>{profile.name}</Text>
        <View style={styles.idRow}>
          <Text style={styles.idText}>ID: {profile.id}</Text>
          <Pressable
            onPress={() => setIdChangeOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="ID 변경"
          >
            <IconIdChange width={20} height={20} />
          </Pressable>
          <Pressable
            onPress={onCopyId}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="ID 복사"
            style={styles.idCopyWrap}
          >
            {idCopied ? (
              <Tooltip label="ID를 복사했습니다." style={styles.idTooltip} />
            ) : null}
            <IconIdCopy width={20} height={20} />
          </Pressable>
        </View>
      </View>

      {/* 자기 소개 */}
      <SectionHeader icon={<IconSectionBasic width={22} height={22} />} label="자기 소개" />

      <Field label="닉네임">
        <View style={[styles.nickRow, nickErr && styles.nickRowError]}>
          <View style={styles.nickInputLeft}>
            <IconUser width={20} height={20} />
            <TextInput
              ref={nickInputRef}
              value={nick}
              onChangeText={onChangeNick}
              editable={nickEditing}
              placeholderTextColor={tokens.color.ink400}
              style={styles.nickText}
              maxLength={6}
              autoCapitalize="none"
            />
          </View>
          <Pressable
            onPress={onNickButton}
            style={[styles.nickChangeBtn, nickEditing && styles.nickChangeBtnActive]}
            accessibilityLabel={nickEditing ? '닉네임 저장' : '닉네임 변경'}
          >
            <Text
              style={[
                styles.nickChangeLabel,
                nickEditing && styles.nickChangeLabelActive,
              ]}
            >
              {nickEditing ? '저장' : '변경'}
            </Text>
            <IconEdit
              width={16}
              height={16}
              color={nickEditing ? tokens.color.white : '#4B5563'}
            />
          </Pressable>
        </View>
        {nickErr ? (
          <Text style={styles.nickHintError}>{nickErr}</Text>
        ) : nickEditing ? (
          <Text style={styles.nickHint}>
            닉네임(2~6자)을 입력한 후 변경 버튼을 선택하세요.
          </Text>
        ) : null}
      </Field>

      <Field label="한 줄 자기소개">
        <View style={styles.nickRow}>
          <View style={styles.nickInputLeft}>
            <IconIntro width={20} height={20} />
            <View style={styles.nickTextWrap}>
              <TextInput
                ref={bioInputRef}
                value={bio}
                onChangeText={(v) => setBio(v.slice(0, BIO_MAX))}
                editable={bioEditing}
                placeholderTextColor={tokens.color.ink400}
                style={styles.nickText}
                maxLength={BIO_MAX}
              />
              {/* RN Android는 TextInput placeholder에 커스텀 폰트 미적용 →
                  빈 값일 때 Text 오버레이로 Pretendard 일관 표시 */}
              {bio.length === 0 ? (
                <Text style={styles.nickPlaceholder} pointerEvents="none">
                  간단하게 자신을 소개해보세요.
                </Text>
              ) : null}
            </View>
          </View>
          <Pressable
            onPress={onBioButton}
            style={[styles.nickChangeBtn, bioEditing && styles.nickChangeBtnActive]}
            accessibilityLabel={bioEditing ? '자기소개 저장' : '자기소개 변경'}
          >
            <Text
              style={[
                styles.nickChangeLabel,
                bioEditing && styles.nickChangeLabelActive,
              ]}
            >
              {bioEditing ? '저장' : '변경'}
            </Text>
            <IconEdit
              width={16}
              height={16}
              color={bioEditing ? tokens.color.white : '#4B5563'}
            />
          </Pressable>
        </View>
        {bioEditing ? (
          <Text style={styles.nickHint}>
            자기소개(최대 10자)를 입력한 후 변경 버튼을 선택하세요.
          </Text>
        ) : null}
      </Field>

      <Field label="성별">
        <Pressable onPress={() => setShowGender(true)} style={styles.inputBox}>
          {profile.gender === 'female' ? (
            <IconGenderFemale width={20} height={20} />
          ) : (
            <IconGenderMale width={20} height={20} />
          )}
          <Text style={styles.inputText}>
            {profile.gender === 'male'
              ? '남성'
              : profile.gender === 'female'
                ? '여성'
                : '성별'}
          </Text>
          <IconChevronDown width={20} height={20} />
        </Pressable>
        <Text style={styles.fieldNote}>
          성별은 비공개이며, 모임 참여시 성별 확인에만 사용합니다.
        </Text>
      </Field>

      <Field label="생년월일">
        <Pressable onPress={() => setShowCalendar(true)} style={styles.inputBox}>
          <IconCake width={20} height={20} />
          <Text style={styles.inputText}>
            {profile.birthDate
              ? profile.birthDate.replace(/-/g, '.') + '.'
              : '1900.01.01.'}
          </Text>
        </Pressable>
        <Text style={styles.fieldNote}>
          나이는 비공개이며, 모임 참여시 연령대 확인에만 사용합니다.
        </Text>
      </Field>

      <View style={styles.divider} />

      {/* 수영 */}
      <SectionHeader icon={<IconLaneCount width={22} height={22} />} label="수영" />

      <VisRow
        label="수영 기간"
        value={profile.showServiceYears ?? PROFILE_VIS_DEFAULT.showServiceYears}
        onChange={(v) => patch({ showServiceYears: v })}
      />
      <ExperienceSlider
        value={exp}
        onChange={(v) => {
          setExp(v);
          markSwimDirty();
        }}
        max={EXP_MAX}
      />

      {/* Figma 117:2556 — 수영 레슨: 공개 토글 + 레슨 풀명/요일·시간 +
          "레슨 정보 변경"(등록 화면). 공개 시 프로필 노출 + 지도 stack. */}
      <VisRow
        label="수영 레슨"
        marginTop={28}
        value={profile.showSwimClasses ?? PROFILE_VIS_DEFAULT.showSwimClasses}
        onChange={(v) => patch({ showSwimClasses: v })}
      />
      {/* Figma 166:8233 — 레슨 수영장·타임·"레슨 정보 변경"을 같은 칩
          목록(라벨형)으로 노출. 수영장/타임=민트 채움(표시 전용),
          "레슨 정보 변경"=아웃라인 버튼(맨 뒤). 다른 섹션과 동일한
          Chip 스타일 재사용. */}
      <ChipRow>
        {profile.lessonPoolId && profile.lessonPoolName ? (
          <View style={[styles.chip, styles.chipSelected]}>
            <Text style={[styles.chipLabel, styles.chipLabelSelected]}>
              {profile.lessonPoolName}
            </Text>
          </View>
        ) : null}
        {profile.lessonPoolId
          ? DAY_ORDER.flatMap(
              (d) => groupByDay(profile.swimClasses ?? [])[d],
            ).map((c) => (
              <View key={c.id} style={[styles.chip, styles.chipSelected]}>
                <Text style={[styles.chipLabel, styles.chipLabelSelected]}>
                  {formatClassChip(c)}
                </Text>
              </View>
            ))
          : null}
        <Pressable
          onPress={() => navigation.navigate('SwimClassRegister')}
          style={({ pressed }) => [styles.chip, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="레슨 정보 변경"
        >
          <Text style={styles.chipLabel}>레슨 정보 변경</Text>
        </Pressable>
      </ChipRow>

      <VisRow
        label="가능 영법"
        marginTop={28}
        value={profile.showStrokes ?? PROFILE_VIS_DEFAULT.showStrokes}
        onChange={(v) => patch({ showStrokes: v })}
      />
      <ChipRow>
        {ALL_STROKES.map((s) => (
          <Chip
            key={s}
            label={s}
            selected={strokes.includes(s)}
            onPress={() => toggleStroke(s)}
          />
        ))}
      </ChipRow>

      <VisRow
        label="자격증"
        marginTop={28}
        value={profile.showCerts ?? PROFILE_VIS_DEFAULT.showCerts}
        onChange={(v) => patch({ showCerts: v })}
        disabled={!strokesComplete}
      />
      <ChipRow>
        {ALL_CERTIFICATIONS.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={certs.includes(c)}
            onPress={() => toggleCert(c)}
            disabled={!strokesComplete}
          />
        ))}
      </ChipRow>

      <VisRow
        label="IM100 기록"
        marginTop={28}
        value={profile.showIm100 ?? PROFILE_VIS_DEFAULT.showIm100}
        onChange={(v) => patch({ showIm100: v })}
        disabled={!strokesComplete}
      />
      <ChipRow>
        {ALL_IM100_RECORDS.map((r) => (
          <Chip
            key={r}
            label={r}
            selected={im100 === r}
            onPress={() => {
              setIm100(r as IM100Record);
              markSwimDirty();
            }}
            disabled={!strokesComplete}
          />
        ))}
      </ChipRow>

      <View style={styles.divider} />

      <View style={styles.privacyNotice}>
        <IconLock width={24} height={24} />
        <Text style={styles.privacyText}>
          사용자 정보는 안전하며 절대 누구와도 공유하지 않습니다.
        </Text>
      </View>

      <CalendarSheet
        visible={showCalendar}
        initial={profile.birthDate || '1990-01-01'}
        onConfirm={(iso) => patch({ birthDate: iso })}
        onClose={() => setShowCalendar(false)}
      />

      <GenderSheet
        visible={showGender}
        value={profile.gender}
        onConfirm={(g) => patch({ gender: g })}
        onClose={() => setShowGender(false)}
      />
    </ScrollView>

    <IdChangeModal
      visible={idChangeOpen}
      onKeep={() => setIdChangeOpen(false)}
      onChange={onConfirmIdChange}
    />
    <IdChangeDoneModal
      visible={idDoneOpen}
      onConfirm={() => setIdDoneOpen(false)}
    />
    </>
  );
}

function SectionHeader({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionHeaderLabel}>{label}</Text>
    </View>
  );
}

/** 항목 라벨 + 공개/비공개 토글 (Figma 117:2556). */
function VisRow({
  label,
  marginTop,
  value,
  onChange,
  disabled,
}: {
  label: string;
  marginTop?: number;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={[styles.visRow, marginTop != null ? { marginTop } : null]}>
      <Text style={[styles.visRowLabel, disabled && styles.visRowLabelDisabled]}>
        {label}
      </Text>
      <Toggle
        value={value}
        onValueChange={onChange}
        label={value ? '공개' : '비공개'}
        labelPosition="left"
        disabled={disabled}
      />
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.fieldGap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ChipRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

function Chip({
  label, selected, onPress, disabled,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.chip,
        selected && styles.chipSelected,
        disabled && styles.chipDisabled,
      ]}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
        {label}
      </Text>
    </Pressable>
  );
}

/** 수영 기간 슬라이더 — 0~30년. ProfileSetup과 동일한 드래그 방식. */
function ExperienceSlider({
  value, onChange, max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const pct = Math.max(0, Math.min(1, value / max));
  const trackRef = React.useRef<View | null>(null);
  const trackWidthRef = React.useRef(0);
  const trackPageXRef = React.useRef(0);
  const lastValueRef = React.useRef(value);
  React.useEffect(() => {
    lastValueRef.current = value;
  }, [value]);

  const measure = React.useCallback(() => {
    trackRef.current?.measureInWindow((x, _y, w) => {
      trackPageXRef.current = x;
      trackWidthRef.current = w;
    });
  }, []);

  const setFromPageX = React.useCallback(
    (pageX: number) => {
      const w = trackWidthRef.current;
      if (w <= 0) return;
      const ratio = Math.max(0, Math.min(1, (pageX - trackPageXRef.current) / w));
      const v = Math.round(ratio * max);
      if (v !== lastValueRef.current) {
        lastValueRef.current = v;
        onChange(v);
      }
    },
    [max, onChange],
  );

  const pan = React.useMemo(
    () =>
      ({
        onStartShouldSetResponder: () => true,
        onMoveShouldSetResponder: () => true,
        onResponderGrant: (e: { nativeEvent: { pageX: number } }) => {
          measure();
          setFromPageX(e.nativeEvent.pageX);
        },
        onResponderMove: (e: { nativeEvent: { pageX: number } }) =>
          setFromPageX(e.nativeEvent.pageX),
      }) as const,
    [measure, setFromPageX],
  );

  return (
    <View style={sliderStyles.wrap}>
      <View
        ref={trackRef}
        style={sliderStyles.touch}
        onLayout={measure}
        {...pan}
      >
        <View style={sliderStyles.track} pointerEvents="none">
          <View style={[sliderStyles.fill, { width: `${pct * 100}%` }]} />
          <View style={[sliderStyles.thumb, { left: `${pct * 100}%` }]} />
        </View>
      </View>
      <View style={sliderStyles.labelRow}>
        {/* 좌=현재값 SemiBold / 우=최대값 Regular (Figma 117:2895) */}
        <Text style={sliderStyles.label}>{formatExp(value, max)}</Text>
        <Text style={sliderStyles.labelMax}>{max}년 이상</Text>
      </View>
    </View>
  );
}

function formatExp(value: number, max: number): string {
  if (value <= 0) return '1년 미만';
  if (value >= max) return `${max}년 이상`;
  return `${value}년`;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },

  // 탭
  tabWrap: { paddingHorizontal: 16, paddingVertical: 8 },
  // Figma 133:6053 — 알림 미읽음 배지: 29 원, #FF2D55,
  // tabWrap(=Figma Frame px16 py8) 기준 top:0 / left319 → right:27
  unreadBadge: {
    position: 'absolute',
    top: 0,
    right: 27,
    width: 29,
    height: 29,
    borderRadius: 15,
    backgroundColor: '#FF2D55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 133:6054 — Regular 16/22 -0.112 흰색 중앙
  unreadBadgeText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.white,
    textAlign: 'center',
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  tabItemActive: {
    backgroundColor: tokens.color.white,
    ...(Platform.OS === 'ios' ? tokens.shadow.sm : { elevation: 2 }),
  },
  tabLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  tabLabelActive: { color: tokens.color.ink900 },

  // 스크롤 컨텐츠
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  // 아바타 (Figma 130:3599 — 80px)
  avatarWrap: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 12,
  },
  // Figma 130:3577 — 아바타 아래 닉네임 + 계정 ID (gap 8)
  profileHeadText: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  // Figma 130:3579 — Bold 24/32 -0.288 #1F2937
  profileName: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },
  // Figma 130:3602 — ID행: 가운데 정렬, gap 8
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // Figma 130:3578 — Regular 14/20 -0.084 #4B5563
  idText: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  idCopyWrap: { position: 'relative' },
  // 복사 아이콘(20) 위 가운데 — 래퍼 width 200 + ml -100
  idTooltip: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: 4,
    left: 10,
    marginLeft: -100,
    width: 200,
    zIndex: 10,
  },
  // Figma 130:3572 — byellow 외곽선. RN border+overflow 함정 회피 위해
  // byellow 배경 80 원 + 안쪽 76 원(2px ring) 구조.
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: tokens.color.pdByellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: 76, height: 76 },
  // 우하단 검정(ink900) 32 원 + 흰 + 아이콘
  avatarUploadBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: tokens.color.ink900,
    alignItems: 'center',
    justifyContent: 'center',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 20,
  },
  // Figma 117:2891 — "Text md/Bold" #1F2937(Gray/80). 토글/칩과 동일
  // 리터럴 hex (ink900=#0F172A는 Figma와 다름 → 화면 내 색 일관).
  sectionHeaderLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: '#1F2937',
  },

  fieldGap: { gap: 8, marginBottom: 24 },
  // Figma 129:6375/133:3660 — "Text sm/SemiBold" #1F2937(Gray/80).
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  subLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
    marginBottom: 12,
  },
  // Figma 117:2556 — 항목 라벨 + 공개/비공개 토글 한 줄
  visRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  // Figma Section Header(117:2890 등) — "Text sm/SemiBold"(한글 Bold),
  // #1F2937(Gray/80). fieldLabel과 동일 스타일.
  visRowLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: '#1F2937',
  },
  // 영법 4개 미만 → 자격증·IM100 공개여부 비활성(Toggle 자체 0.5와 일관).
  visRowLabelDisabled: { opacity: 0.5 },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
  },
  // Figma I129:6376;5606:19069 등 — Regular 16/22 #4B5563(Gray/60).
  // 칩/슬라이더와 동일 리터럴(ink500=#64748B는 Figma와 다름).
  inputText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  // Figma 129:6373(성별) / 133:3657(생년월일) — 수집목적 안내문구.
  // 디자인 갱신: 13/18/-0.078 → 14/20/-0.084. 간격은 프레임 균일 gap-8
  // (라벨·입력·안내문구 모두 8) — fieldGap.gap:8 만으로 충족, 별도
  // marginTop 제거(있으면 입력↔안내 16으로 이중 적용됨).
  fieldNote: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },

  // 닉네임 — 좌측 표시 + 우측 변경 버튼
  nickRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    // 다른 입력영역(inputBox minHeight 48)과 동일하게 48 고정 —
    // TextInput 폰트 메트릭이 minHeight를 초과해 커지던 문제 해결.
    height: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    backgroundColor: tokens.color.white,
    overflow: 'hidden',
  },
  nickRowError: { borderColor: tokens.color.red },
  nickInputLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  nickTextWrap: { flex: 1, justifyContent: 'center' },
  nickPlaceholder: {
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
    color: tokens.color.ink400,
    includeFontPadding: false,
  },
  nickText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink900,
    padding: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  nickChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 1,
    borderLeftColor: '#CBD5E1',
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  nickChangeBtnActive: {
    backgroundColor: tokens.color.pdMint,
    borderLeftColor: tokens.color.pdMint,
  },
  nickChangeLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
  nickChangeLabelActive: { color: tokens.color.white },
  nickHint: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },
  nickHintError: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: tokens.font.sans,
    color: tokens.color.red,
  },

  divider: {
    height: 1,
    backgroundColor: tokens.color.lineDefault,
    marginVertical: 20,
  },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  // Figma Badge Text — px10 py4, radius 9, border #CBD5E1.
  // 수영 레슨(166:8233)·가능 영법·자격증·IM100 공통 칩 — 단일 출처.
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: tokens.color.white,
  },
  chipSelected: {
    backgroundColor: tokens.color.pdMint,
    borderColor: tokens.color.pdMint,
  },
  // 가능 영법 4개 미만 → 자격증·IM100 비활성(사용자 확정).
  chipDisabled: { opacity: 0.4 },
  chipLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansMedium,
    color: '#4B5563',
  },
  chipLabelSelected: { color: tokens.color.white },

  privacyNotice: { alignItems: 'center', gap: 16, marginTop: 4 },
  privacyText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },
});

const sliderStyles = StyleSheet.create({
  wrap: { gap: 8 },
  touch: { height: 36, justifyContent: 'center' },
  track: {
    width: '100%',
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 9999,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: tokens.color.pdMint,
    borderRadius: 9999,
  },
  thumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: tokens.color.pdByellow,
    borderWidth: 2,
    borderColor: tokens.color.pdMint,
    marginLeft: -10,
    top: -6,
  },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  // Figma I117:2895;5626:31911 — 현재값(좌): SemiBold
  label: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
  // Figma I117:2895;5626:31912 — 최대값(우): Regular(현재값과 구분)
  labelMax: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
  },
});
