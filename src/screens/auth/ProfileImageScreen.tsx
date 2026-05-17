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
import {
  BUNDLE_AVATARS,
  defaultAvatarForGender,
  isBundleAvatar,
} from '@/lib/avatars';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import IconArrowUpload from '@assets/icons/arrow-upload.svg';
import IconAlertTriangle from '@assets/icons/alert-triangle.svg';
import IconEmotionOverjoyed from '@assets/icons/emotion-overjoyed.svg';

type State = 'idle' | 'uploading' | 'error';

const AVATAR_SIZE = 120; // uploading 링용
const IDLE_AVATAR = 80; // idle 아바타 (Figma 110:3316 / 130:3599 통일)

/** 가입일 → "YYYY년 M월 D일부터 풀스데이와 수영중" */
function formatSince(createdAt?: string): string {
  const d = createdAt ? new Date(createdAt) : null;
  if (!d || Number.isNaN(d.getTime())) return '풀스데이와 수영중';
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일부터 풀스데이와 수영중`;
}

export function ProfileImageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const saveProfile = useProfile((s) => s.save);
  const authUser = useAuth((s) => s.user);

  // 기본값 — 이미 등록된 사진(내 정보 수정) > 소셜 사진 > 성별 기반 번들 아바타.
  const initialPhoto = React.useMemo<string>(
    () =>
      profile?.photoUri ??
      authUser?.photoUrl ??
      defaultAvatarForGender(profile?.gender ?? 'male'),
    [profile?.photoUri, authUser?.photoUrl, profile?.gender],
  );
  // 현재 선택된 사진 — 번들 AvatarId / 소셜 URL / 업로드 URI.
  const [photo, setPhoto] = React.useState<string>(initialPhoto);
  const [photoThumb, setPhotoThumb] = React.useState<string | undefined>(
    profile?.photoThumbUri,
  );
  const [state, setState] = React.useState<State>('idle');

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
    if (r.status === 'too_large') {
      Alert.alert(
        '사진이 너무 큽니다',
        '더 작은 사진을 선택하거나 사진 앱에서 크기를 줄여 다시 시도해주세요.',
      );
      return;
    }
    if (r.status === 'error') {
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
          />
        )}
        {state === 'uploading' && <UploadingView photo={photo} />}
        {state === 'error' && <ErrorView onRetry={pickImage} />}
      </View>
    </SafeAreaView>
  );
}

/** 선택된 사진을 원형으로 — byellow 2px ring(외곽) + 안쪽 사진.
 *  RN border 함정 회피 위해 byellow 배경 원 + 안쪽 작은 원 구조
 *  (130:3640 byellow 외곽선, MyInfo와 통일). */
function AvatarCircle({ photo, size }: { photo: string; size: number }) {
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
          />
        )}
      </View>
    </View>
  );
}

function IdleView({
  photo, name, since, onUpload, onComplete,
}: {
  photo: string;
  name: string;
  since: string;
  onUpload: () => void;
  onComplete: () => void;
}) {
  return (
    <View style={styles.idleWrap}>
      <Text style={styles.title}>프로필 이미지</Text>

      {/* 아바타 블록 (Figma 110:3316 / 130:3599 — 아바타80 + 닉네임 + 가입일) */}
      <View style={styles.avatarBlock}>
        <View style={styles.avatarWrap}>
          <AvatarCircle photo={photo} size={IDLE_AVATAR} />
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

function ErrorView({ onRetry }: { onRetry: () => void }) {
  // Figma 110:3337 — 경고 + "잘못된 형식!" + "내 사진 다시 업로드".
  return (
    <View style={styles.centerWrap}>
      <View style={styles.errorIconWrap}>
        <IconAlertTriangle width={48} height={48} />
      </View>
      <View style={styles.errorTextBlock}>
        <Text style={styles.errorTitle}>잘못된 형식!</Text>
        <Text style={styles.errorSub}>프로필 이미지로 등록할 수 없는 확장자 파일입니다.</Text>
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
  errorTextBlock: { alignItems: 'center', gap: 12 },
  errorTitle: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.24,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
  },
  errorSub: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: tokens.font.sans,
    color: tokens.color.ink500,
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
  ctaLabel: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.112,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.black,
  },
});
