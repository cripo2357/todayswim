// Figma 110:3316 / 110:3327 / 110:3337 — 프로필 이미지 등록 (가입 마지막 단계).
//
// 진입 시 성별에 맞는 번들 아바타가 기본 셋팅된다. 사용자는 그대로 두거나
// 우하단 업로드 버튼으로 자기 사진을 올릴 수 있다. "프로필 등록 완료" → Welcome.
//
// 3-state: idle(110:3316) / uploading(110:3327) / error(110:3337).
// Phase 1: expo-image-picker 미도입 — 업로드는 mock. Phase 2에서 실제 픽+Storage 업로드.

import React from 'react';
import {
  View, Text, StyleSheet, Pressable, Animated, Alert, Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Flag } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useProfile } from '@/store/profile';
import { useAuth } from '@/store/auth';
import {
  BUNDLE_AVATARS,
  defaultAvatarForGender,
  isBundleAvatar,
} from '@/lib/avatars';
import type { RootStackParamList } from '@/navigation/types';
import { tokens } from '@/styles/tokens';
import IconArrowUpload from '@assets/icons/arrow-upload.svg';
import IconAlertTriangle from '@assets/icons/alert-triangle.svg';

type State = 'idle' | 'uploading' | 'error';

const AVATAR_SIZE = 120;

export function ProfileImageScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const profile = useProfile((s) => s.profile);
  const saveProfile = useProfile((s) => s.save);
  const authUser = useAuth((s) => s.user);

  // 기본값 — 소셜 로그인 프로필 사진이 있으면 그걸, 없으면 성별 기반 번들 아바타.
  const initialPhoto = React.useMemo<string>(
    () =>
      authUser?.photoUrl ?? defaultAvatarForGender(profile?.gender ?? 'male'),
    [authUser?.photoUrl, profile?.gender],
  );
  // 현재 선택된 사진 — 번들 AvatarId / 소셜 URL / 업로드 URI.
  const [photo, setPhoto] = React.useState<string>(initialPhoto);
  const [state, setState] = React.useState<State>('idle');
  const uploadTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (uploadTimerRef.current) clearTimeout(uploadTimerRef.current);
    };
  }, []);

  // 갤러리에서 사진 선택 → 1:1 크롭 → 512px 리사이즈 + JPEG 압축으로 용량 축소.
  // (Phase 2에서 uploading 단계에 Supabase Storage 업로드 추가 예정.)
  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        '사진 권한 필요',
        '프로필 사진을 등록하려면 설정에서 사진 보관함 접근을 허용해주세요.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    if (!asset?.uri) {
      setState('error');
      return;
    }

    setState('uploading');
    try {
      // 원본이 수 MB일 수 있어 프로필용 512px / JPEG 압축으로 축소 후 저장.
      const resized = await manipulateAsync(
        asset.uri,
        [{ resize: { width: 512 } }],
        { compress: 0.7, format: SaveFormat.JPEG },
      );
      uploadTimerRef.current = setTimeout(() => {
        uploadTimerRef.current = null;
        setPhoto(resized.uri);
        setState('idle');
      }, 400);
    } catch {
      setState('error');
    }
  };

  const onComplete = async () => {
    if (!profile) return;
    await saveProfile({ ...profile, photoUri: photo });
    navigation.replace('Welcome');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.body}>
        {state === 'idle' && (
          <IdleView photo={photo} onUpload={pickImage} onComplete={onComplete} />
        )}
        {state === 'uploading' && <UploadingView photo={photo} />}
        {state === 'error' && <ErrorView onRetry={pickImage} />}
      </View>
    </SafeAreaView>
  );
}

/** 선택된 사진을 원형으로 — 번들이면 SVG, 업로드 URI면 (Phase 2) Image. */
function AvatarCircle({ photo, size }: { photo: string; size: number }) {
  if (isBundleAvatar(photo)) {
    const Svg = BUNDLE_AVATARS[photo];
    return (
      <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
        <Svg width={size} height={size} />
      </View>
    );
  }
  // 사용자가 갤러리에서 고른 로컬 사진 (file:// URI).
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Image source={{ uri: photo }} style={{ width: size, height: size }} />
    </View>
  );
}

function IdleView({
  photo, onUpload, onComplete,
}: {
  photo: string;
  onUpload: () => void;
  onComplete: () => void;
}) {
  return (
    <View style={styles.idleWrap}>
      <Text style={styles.title}>프로필 이미지</Text>

      <View style={styles.avatarWrap}>
        <AvatarCircle photo={photo} size={AVATAR_SIZE} />
        <Pressable
          onPress={onUpload}
          style={({ pressed }) => [styles.uploadBtn, pressed && { opacity: 0.85 }]}
          accessibilityRole="button"
          accessibilityLabel="사진 업로드"
        >
          <IconArrowUpload width={18} height={18} />
        </Pressable>
      </View>

      <Pressable
        onPress={onComplete}
        style={({ pressed }) => [styles.cta, pressed && { opacity: 0.85 }]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaLabel}>프로필 등록 완료</Text>
        <Flag size={20} color={tokens.color.black} strokeWidth={2.4} />
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
        <IconArrowUpload width={20} height={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: tokens.color.bgPaper },
  body: { flex: 1, paddingHorizontal: 16 },

  // idle (110:3316) — 제목/아바타/CTA 중앙 묶음
  idleWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 },
  title: {
    fontSize: 30,
    lineHeight: 38,
    letterSpacing: -0.39,
    fontFamily: tokens.font.sansBold,
    color: tokens.color.ink900,
    textAlign: 'center',
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Figma — 아바타 우하단 흰 원 + Shadow/md + 업로드 아이콘
  uploadBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: tokens.color.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...tokens.shadow.pop,
  },

  // uploading (110:3327) / error (110:3337) 공통 중앙 정렬
  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 32 },
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
