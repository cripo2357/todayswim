// Figma 110:3316 / 110:3327 / 110:3337 — 프로필 이미지 등록 (가입 마지막 단계, 가입 전용).
//
// 진입 시 성별에 맞는 번들 아바타가 기본 셋팅된다. 사용자는 그대로 두거나
// 우하단 업로드 버튼으로 자기 사진을 올릴 수 있다. "프로필 사용" → Welcome.
// (내 정보 수정에서는 이 화면을 쓰지 않고 업로드 버튼이 바로 파일 선택기를 연다.)
//
// 3-state: idle(110:3316) / uploading(110:3327) / error(110:3337).

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Alert, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '@/store/profile';
import { useAuth } from '@/store/auth';
import { pickProfileImage } from '@/lib/pickProfileImage';
import { uploadProfileAvatar } from '@/lib/uploadProfileAvatar';
import { logEvent } from '@/lib/analytics';
import {
  BUNDLE_AVATARS,
  defaultAvatarForGender,
  isBundleAvatar,
} from '@/lib/avatars';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import { formatDate } from '@/lib/dateFormat';
import IconArrowUpload from '@assets/icons/arrow-upload.svg';
import IconAlertTriangle from '@assets/icons/alert-triangle.svg';
import IconEmotionOverjoyed from '@assets/icons/emotion-overjoyed.svg';

type State = 'idle' | 'uploading' | 'error';
// 실패 사유 — Figma 110:3337 동일 레이아웃, 타이틀/안내문구만 분기.
type ErrorReason = 'format' | 'too_large';
const ERROR_COPY: Record<ErrorReason, { title: string; sub: string }> = {
  // 타이틀은 사유 무관 동일, sub만 분기 (사용자 확정 2026-05-18).
  // 형식/확장자 또는 처리 실패
  format: {
    title: '이미지 업로드 실패',
    sub: '등록할 수 없는 형식의 이미지 파일입니다.',
  },
  // 용량 초과
  too_large: {
    title: '이미지 업로드 실패',
    sub: '이미지 파일의 용량이 너무 큽니다.',
  },
};

const AVATAR_SIZE = 120; // uploading 링용
const IDLE_AVATAR = 80; // idle 아바타 (Figma 110:3316 / 130:3599 통일)

/** 가입일 → "YY.MM.DD(요일)부터 풀스데이와 수영중" (앱 통일 날짜 포맷). */
function formatSince(createdAt?: string): string {
  const d = createdAt ? new Date(createdAt) : null;
  if (!d || Number.isNaN(d.getTime())) return '풀스데이와 수영중';
  return `${formatDate(d)}부터 풀스데이와 수영중`;
}

export function ProfileImageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const saveProfile = useProfile((s) => s.save);
  const authUser = useAuth((s) => s.user);

  // 소셜 이미지가 없거나 로드 실패할 때 떨어질 번들 아바타 — 성별 기준 1회 픽
  // (onError 폴백과 초기값이 같은 아바타를 쓰도록 고정).
  const fallbackAvatar = React.useMemo(
    () => defaultAvatarForGender(profile?.gender ?? 'male'),
    [profile?.gender],
  );
  // 기본값 — 이미 등록된 사진(내 정보 수정) > 소셜 사진 > 성별 기반 번들 아바타.
  const initialPhoto = React.useMemo<string>(
    () => profile?.photoUri ?? authUser?.photoUrl ?? fallbackAvatar,
    [profile?.photoUri, authUser?.photoUrl, fallbackAvatar],
  );
  // 현재 선택된 사진 — 번들 AvatarId / 소셜 URL / 업로드 URI.
  const [photo, setPhoto] = React.useState<string>(initialPhoto);

  // 소셜/원격 이미지 로드 실패(예: 카카오 기본 이미지·차단된 URL) → 번들 아바타
  // 폴백. URL 이 truthy 라 ?? 폴백이 안 걸리던 케이스를 런타임에서 보정.
  const onPhotoError = React.useCallback(() => {
    setPhoto((cur) => (isBundleAvatar(cur) ? cur : fallbackAvatar));
    setPhotoThumb(undefined);
  }, [fallbackAvatar]);
  const [photoThumb, setPhotoThumb] = React.useState<string | undefined>(
    profile?.photoThumbUri,
  );
  const [state, setState] = React.useState<State>('idle');
  const [errorReason, setErrorReason] = React.useState<ErrorReason>('format');

  // 갤러리 선택 → 512px JPEG 리사이즈 → Storage 업로드 (공용 유틸).
  const pickImage = async () => {
    const r = await pickProfileImage();
    if (r.status === 'denied') {
      Alert.alert(
        '사진 권한 필요',
        '프로필 사진을 등록하려면 설정에서 사진 보관함 접근을 허용해주세요.',
      );
      return;
    }
    if (r.status === 'canceled') return;
    if (r.status === 'too_large' || r.status === 'error') {
      // 둘 다 업로드 실패 화면(Figma 110:3337). 사유로 카피만 분기.
      setErrorReason(r.status === 'too_large' ? 'too_large' : 'format');
      setState('error');
      return;
    }
    setPhoto(r.uri); // 낙관적 — 즉시 표시
    setPhotoThumb(undefined); // 새 사진 — 옛 썸네일 잔상 방지(원본 폴백)
    setState('uploading');
    const up = await uploadProfileAvatar(r.base64, r.thumbBase64);
    if (up.status === 'ok') {
      setPhoto(up.url); // 로컬→공개 URL
      setPhotoThumb(up.thumbUrl); // 스택용 64px (없으면 원본 폴백)
    }
    // skipped/error → 로컬 r.uri 유지 (가입 막지 않음)
    setState('idle');
  };

  const onComplete = async () => {
    if (!profile) return;
    await saveProfile({ ...profile, photoUri: photo, photoThumbUri: photoThumb });
    // mode 식별: photoUri 가 avatar-* 면 default, 'http' 시작이면 upload(or social),
    // 그 외(빈 값 등)은 unknown. social 과 upload 는 둘 다 URL 이라 추정만 가능.
    const mode: 'default' | 'upload' = photo.startsWith('avatar-')
      ? 'default'
      : 'upload';
    void logEvent('profile_image_set', { mode });
    void logEvent('signup_complete');
    navigation.replace('Welcome');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.body}>
        {state === 'idle' && (
          <IdleView
            photo={photo}
            name={profile?.name ?? ''}
            since={formatSince(profile?.createdAt)}
            onUpload={pickImage}
            onComplete={onComplete}
            onPhotoError={onPhotoError}
          />
        )}
        {state === 'uploading' && <UploadingView photo={photo} />}
        {state === 'error' && (
          <ErrorView reason={errorReason} onRetry={pickImage} />
        )}
      </View>
    </SafeAreaView>
  );
}

/** 선택된 사진을 원형으로 — byellow 2px ring(외곽) + 안쪽 사진.
 *  RN border 함정 회피 위해 byellow 배경 원 + 안쪽 작은 원 구조
 *  (130:3640 byellow 외곽선, MyInfo와 통일). */
function AvatarCircle({
  photo,
  size,
  onError,
}: {
  photo: string;
  size: number;
  /** 원격 이미지 로드 실패 시 — 호출자가 번들 아바타로 폴백. */
  onError?: () => void;
}) {
  const inner = size - 4; // 2px ring 양쪽
  return (
    <View
      style={[
        styles.avatarRing,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <View
        style={[
          styles.avatarInner,
          { width: inner, height: inner, borderRadius: inner / 2 },
        ]}
      >
        {isBundleAvatar(photo) ? (
          React.createElement(BUNDLE_AVATARS[photo], {
            width: inner,
            height: inner,
          })
        ) : (
          <Image
            source={{ uri: photo }}
            style={{ width: inner, height: inner }}
            onError={onError}
          />
        )}
      </View>
    </View>
  );
}

function IdleView({
  photo, name, since, onUpload, onComplete, onPhotoError,
}: {
  photo: string;
  name: string;
  since: string;
  onUpload: () => void;
  onComplete: () => void;
  onPhotoError?: () => void;
}) {
  return (
    <View style={styles.idleWrap}>
      <Text style={styles.title}>프로필 이미지</Text>

      {/* 아바타 블록 (Figma 110:3316 / 130:3599 — 아바타80 + 닉네임 + 가입일) */}
      <View style={styles.avatarBlock}>
        <View style={styles.avatarWrap}>
          <AvatarCircle photo={photo} size={IDLE_AVATAR} onError={onPhotoError} />
          <Pressable
            onPress={onUpload}
            style={({ pressed }) => [
              styles.uploadBtn,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="사진 업로드"
          >
            <IconArrowUpload width={18} height={18} color={tokens.color.white} />
          </Pressable>
        </View>
        <View style={styles.headText}>
          <Text style={styles.profileName}>{name}</Text>
          <Text style={styles.profileSince}>{since}</Text>
        </View>
      </View>

      <Pressable
        onPress={onComplete}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaLabel}>프로필 사용</Text>
        <IconEmotionOverjoyed width={20} height={20} />
      </Pressable>
    </View>
  );
}

function UploadingView({ photo }: { photo: string }) {
  // Figma 110:3327 — 회전 progress ring + 아바타 + "이미지 업로드 중...".
  const rotate = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [rotate]);
  const spin = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.centerWrap}>
      <View style={styles.ringWrap}>
        <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]} />
        <AvatarCircle photo={photo} size={AVATAR_SIZE} />
      </View>
      <Text style={styles.loadingText}>이미지 업로드 중...</Text>
    </View>
  );
}

function ErrorView({
  reason,
  onRetry,
}: {
  reason: ErrorReason;
  onRetry: () => void;
}) {
  // Figma 110:3337 — 경고 + 타이틀/안내(사유별) + "내 사진 다시 업로드".
  const copy = ERROR_COPY[reason];
  return (
    <View style={styles.centerWrap}>
      <View style={styles.errorIconWrap}>
        <IconAlertTriangle width={48} height={48} />
      </View>
      <View style={styles.errorTextBlock}>
        <Text style={styles.errorTitle}>{copy.title}</Text>
        <Text style={styles.errorSub}>{copy.sub}</Text>
      </View>
      <Pressable
        onPress={onRetry}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaLabel}>내 사진 다시 업로드</Text>
        <IconArrowUpload width={20} height={20} color={tokens.color.black} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  body: { flex: 1, paddingHorizontal: 16 },

  // idle (110:3316) — 제목/아바타/CTA 묶음. gap 64, 화면 정중앙이 아니라
  // 중앙보다 위쪽(디자인 top calc(50%-175))이라 translateY로 올림.
  idleWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 64,
    transform: [{ translateY: -120 }],
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  // Figma 110:3316 — 아바타 블록(아바타+업로드) + 닉네임/가입일, gap 10
  avatarBlock: { alignItems: 'center', gap: 10 },
  avatarWrap: { position: 'relative', width: IDLE_AVATAR, height: IDLE_AVATAR },
  // Figma 130:3640 — byellow 외곽선. RN border+overflow 함정 회피 위해
  // byellow 배경 원 + 안쪽 2px 작은 원 구조 (MyInfo와 통일).
  // size/borderRadius는 AvatarCircle에서 인라인으로 주입.
  avatarRing: {
    backgroundColor: tokens.color.pdByellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    backgroundColor: '#EBEBEB',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  // Figma 130:3640 — 우하단 검정(ink900) 32 원 + 흰 업로드 아이콘
  uploadBtn: {
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
  // Figma 130:3644/3646 — 닉네임 24 Bold + 가입일 14, gap 8
  headText: { alignItems: 'center', gap: 8 },
  profileName: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  profileSince: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.084,
    fontFamily: tokens.font.sans,
    color: '#4B5563',
    textAlign: 'center',
  },

  // uploading (110:3327) / error (110:3337) — idle과 동일: gap 64, 중앙보다 위쪽
  centerWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 64,
    transform: [{ translateY: -120 }],
  },
  ringWrap: {
    width: AVATAR_SIZE + 16,
    height: AVATAR_SIZE + 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: AVATAR_SIZE + 16,
    height: AVATAR_SIZE + 16,
    borderRadius: (AVATAR_SIZE + 16) / 2,
    borderWidth: 4,
    borderColor: '#E0F2FE',
    borderTopColor: tokens.color.pdMint,
  },
  loadingText: {
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.144,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },

  errorIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma 110:3340 — 텍스트 블록 gap 16
  errorTextBlock: { alignItems: 'center', gap: 16 },
  // Figma 110:3341 Heading xs/Bold 24/32 tracking -0.288 (#1F2937→ink900)
  errorTitle: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.288,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  // Figma 110:3342 Paragraph/md 16 / lineHeight 1.6(≈26) (#4B5563→ink700)
  errorSub: {
    fontSize: 16,
    lineHeight: 26,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink700,
    textAlign: 'center',
  },

  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: tokens.color.pdByellow,
    width: '100%',
    maxWidth: 343,
  },
  // Figma I110:3343 Text md/SemiBold 16/22 tracking -0.112
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansSemibold,
    color: tokens.color.black,
  },
});
