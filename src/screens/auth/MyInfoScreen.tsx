// Figma 117:2556 — 내 정보 (로그인 계정). 3탭: 프로필 / 달력 / 사람들.
// 1번 탭(프로필)만 구현. 달력·사람들은 디자인 확정 시 추가 (placeholder).
//
// 가입(ProfileSetup)과 달리 "보기+수정" 화면 — 저장 버튼 없이 변경 즉시 반영.

import React from 'react';
import {
  View, Text, TextInput, ScrollView, StyleSheet, Pressable,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Pencil, Calendar as LucideCalendar } from 'lucide-react-native';
import IconArrowUpload from '@assets/icons/arrow-upload.svg';
import IconChevronDown from '@assets/icons/chevron-down.svg';
import IconIntro from '@assets/icons/intro.svg';
import { isNicknameTaken, claimNickname } from '@/lib/nicknames';

import {
  useProfile,
  ALL_CERTIFICATIONS,
  ALL_IM100_RECORDS,
  type UserProfile,
  type Stroke,
  type Certification,
  type IM100Record,
} from '@/store/profile';
import { isBundleAvatar, BUNDLE_AVATARS } from '@/lib/avatars';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import { CalendarSheet } from '@/components/auth/CalendarSheet';
import { CalendarTab } from '@/components/calendar/CalendarTab';
import IconUser from '@assets/icons/user-profile.svg';
import IconGenderMale from '@assets/icons/gender-male.svg';
import IconLock from '@assets/icons/lock-secure.svg';
import IconSettings from '@assets/icons/settings.svg';
import IconSectionBasic from '@assets/icons/section-basic.svg';
import IconLaneCount from '@assets/icons/lane-count.svg';
import { Image } from 'react-native';

const ALL_STROKES: Stroke[] = ['자유형', '배영', '접영', '평영'];
const EXP_MAX = 30;
const BIO_MAX = 10;
const TABS = ['프로필', '달력', '사람들'] as const;
type Tab = (typeof TABS)[number];

/** 가입일 → "YYYY년 M월 D일부터 풀스데이와 수영중" */
function formatSince(createdAt?: string): string {
  const d = createdAt ? new Date(createdAt) : null;
  if (!d || Number.isNaN(d.getTime())) return '풀스데이와 수영중';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일부터 풀스데이와 수영중`;
}

export function MyInfoScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const saveProfile = useProfile((s) => s.save);
  const [tab, setTab] = React.useState<Tab>('프로필');

  // profile 없으면(비정상 진입) 안전하게 뒤로.
  React.useEffect(() => {
    if (!profile) navigation.goBack();
  }, [profile, navigation]);
  if (!profile) return null;

  const patch = (p: Partial<UserProfile>) => saveProfile({ ...profile, ...p });

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      {/* 헤더 — 뒤로 / 닉네임 / 설정 */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={styles.headerBtn}
          accessibilityLabel="뒤로"
        >
          <ChevronLeft size={24} color={tokens.color.ink900} strokeWidth={1.5} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          내 정보
        </Text>
        <Pressable hitSlop={8} style={styles.headerBtn} accessibilityLabel="설정">
          <IconSettings width={24} height={24} color={tokens.color.ink900} />
        </Pressable>
      </View>

      {/* 탭 바 */}
      <View style={styles.tabWrap}>
        <View style={styles.tabGroup}>
          {TABS.map((t) => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                onPress={() => setTab(t)}
                style={[styles.tabItem, active && styles.tabItemActive]}
              >
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {tab === '프로필' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <ProfileTab profile={profile} patch={patch} />
        </KeyboardAvoidingView>
      )}
      {tab === '달력' && <CalendarTab />}
      {tab === '사람들' && (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>사람들 탭은 준비 중이에요.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function ProfileTab({
  profile,
  patch,
}: {
  profile: UserProfile;
  patch: (p: Partial<UserProfile>) => void;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

  // 닉네임 인라인 변경 (Figma 120:3030 / 129:6307 / 129:6296)
  const nickInputRef = React.useRef<TextInput>(null);
  const [nick, setNick] = React.useState(profile.name);
  const [nickErr, setNickErr] = React.useState(false);
  // 기본 비활성(읽기). "변경" 누르면 편집 활성, 다시 누르면 검증·저장.
  const [nickEditing, setNickEditing] = React.useState(false);

  const onChangeNick = (v: string) => {
    setNick(v);
    setNickErr(false);
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
    if (await isNicknameTaken(next)) {
      setNickErr(true);
      return;
    }
    patch({ name: next });
    await claimNickname(next);
    setNickErr(false);
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
          onPress={() => navigation.navigate('ProfileImage', { mode: 'edit' })}
          style={styles.avatarUploadBtn}
          accessibilityLabel="사진 변경"
        >
          <IconArrowUpload width={18} height={18} color={tokens.color.white} />
        </Pressable>
      </View>

      {/* 닉네임 + 가입일 (Figma 117:2880) */}
      <View style={styles.profileHeadText}>
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileSince}>{formatSince(profile.createdAt)}</Text>
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
            style={[styles.nickChangeBtn, styles.nickChangeBtnActive]}
            accessibilityLabel="닉네임 변경"
          >
            <Text style={[styles.nickChangeLabel, styles.nickChangeLabelActive]}>
              변경
            </Text>
            <Pencil size={16} color={tokens.color.white} strokeWidth={2} />
          </Pressable>
        </View>
        {nickErr ? (
          <Text style={styles.nickHintError}>
            이미 사용중인 닉네임입니다.
          </Text>
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
            style={[styles.nickChangeBtn, styles.nickChangeBtnActive]}
            accessibilityLabel="자기소개 변경"
          >
            <Text style={[styles.nickChangeLabel, styles.nickChangeLabelActive]}>
              변경
            </Text>
            <Pencil size={16} color={tokens.color.white} strokeWidth={2} />
          </Pressable>
        </View>
        {bioEditing ? (
          <Text style={styles.nickHint}>
            자기소개(최대 10자)를 입력한 후 변경 버튼을 선택하세요.
          </Text>
        ) : null}
      </Field>

      <Field label="성별">
        <View style={styles.inputBox}>
          <IconGenderMale width={20} height={20} />
          <Text style={styles.inputText}>
            {profile.gender === 'male'
              ? '남성'
              : profile.gender === 'female'
                ? '여성'
                : '성별'}
          </Text>
          <IconChevronDown width={20} height={20} />
        </View>
      </Field>

      <Field label="생년월일">
        <Pressable onPress={() => setShowCalendar(true)} style={styles.inputBox}>
          <LucideCalendar size={20} color={tokens.color.ink900} strokeWidth={2} />
          <Text style={styles.inputText}>
            {profile.birthDate
              ? profile.birthDate.replace(/-/g, '.') + '.'
              : '1900.01.01.'}
          </Text>
        </Pressable>
      </Field>

      <View style={styles.divider} />

      {/* 수영 */}
      <SectionHeader icon={<IconLaneCount width={22} height={22} />} label="수영" />

      <Text style={styles.subLabel}>수영 기간</Text>
      <ExperienceSlider
        value={exp}
        onChange={(v) => {
          setExp(v);
          markSwimDirty();
        }}
        max={EXP_MAX}
      />

      <Text style={[styles.subLabel, { marginTop: 24 }]}>가능 영법</Text>
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

      <Text style={[styles.subLabel, { marginTop: 24 }]}>자격증</Text>
      <ChipRow>
        {ALL_CERTIFICATIONS.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={certs.includes(c)}
            onPress={() => toggleCert(c)}
          />
        ))}
      </ChipRow>

      <Text style={[styles.subLabel, { marginTop: 24 }]}>IM100 기록</Text>
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
    </ScrollView>
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
  label, selected, onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
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
        <Text style={sliderStyles.label}>{formatExp(value, max)}</Text>
        <Text style={sliderStyles.label}>{max}년 이상</Text>
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
  flex: { flex: 1 },

  // 헤더
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
  },
  headerBtn: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },

  // 탭
  tabWrap: { paddingHorizontal: 16, paddingVertical: 8 },
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

  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  placeholderText: {
    fontSize: 14,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
  },

  // 스크롤 컨텐츠
  scroll: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32 },

  // 아바타 (Figma 130:3599 — 80px)
  avatarWrap: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 12,
  },
  // Figma 117:2880 — 아바타 아래 닉네임 + 가입일
  profileHeadText: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 32,
  },
  profileName: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  profileSince: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
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
  sectionHeaderLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },

  fieldGap: { gap: 8, marginBottom: 24 },
  fieldLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
  },
  subLabel: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.ink900,
    marginBottom: 12,
  },

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
  inputText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
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
  // Figma Badge Text — px10 py4, radius 9, border #CBD5E1
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
  label: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: '#4B5563',
  },
});
