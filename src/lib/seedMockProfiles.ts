// Pool's day — Phase 2: mock 친구를 서버 profiles에 자동 시드.
//
// SQL 마이그레이션(0050) 대신 클라이언트 best-effort upsert. mockData가
// 바뀌면 자동 반영, 추가 SQL 0개. App 진입 시 한 번만 실행(AsyncStorage 키).
//
// 시드되는 행 = MOCK_FRIENDS(40) + MOCK_NON_FRIENDS(21) = 61명. profile_id =
// mock id(이제 6자리 친구코드). 다른 사용자가 검색하면 자연스럽게 나옴 —
// P1 톤 RLS(`select using true`)라 의도된 동작. 운영 분리는 P3 prod
// Supabase 분리에서 mock 시드 미실행으로 처리.
//
// references: 0047_profiles, friend_code, mockData, profiles_schema.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { MOCK_FRIENDS, MOCK_NON_FRIENDS, type MockAccount } from './mockData';

const SEED_KEY = 'poolsday.mockProfilesSeeded.v1';

interface ProfileSeedRow {
  id: string;
  nickname: string;
  gender: string;
  birth_date: string;
  experience_years: number;
  strokes: string[];
  bio: string | null;
  certifications: string[];
  im100_record: string | null;
  photo_uri: string | null;
  photo_thumb_uri: string | null;
  swim_classes: unknown[];
  lesson_pool_id: string | null;
  lesson_pool_name: string | null;
  show_service_years: boolean;
  show_strokes: boolean;
  show_certs: boolean;
  show_im100: boolean;
  show_swim_classes: boolean;
  created_at: string;
}

/** avatar id에서 성별 derive — male/female/other(폴백). */
function genderFromAvatar(avatar: string): string {
  if (avatar.startsWith('avatar-female')) return 'female';
  if (avatar.startsWith('avatar-male')) return 'male';
  return 'other';
}

function toRow(a: MockAccount): ProfileSeedRow {
  return {
    id: a.id,
    nickname: a.nickname,
    gender: genderFromAvatar(a.avatar),
    birth_date: '1995-01-01', // mock default — 실 데이터에 영향 X
    experience_years: 1,
    strokes: [],
    bio: a.status || null,
    certifications: [],
    im100_record: null,
    photo_uri: a.avatar, // 번들 AvatarId 그대로 저장(Avatar 컴포넌트가 매핑)
    photo_thumb_uri: null,
    swim_classes: [],
    lesson_pool_id: null,
    lesson_pool_name: null,
    show_service_years: true,
    show_strokes: true,
    show_certs: false,
    show_im100: true,
    show_swim_classes: true,
    created_at: new Date().toISOString(),
  };
}

/**
 * mock 친구 61명을 서버 profiles에 upsert. App 진입 시 한 번만.
 * - AsyncStorage 키(`SEED_KEY`)로 중복 실행 차단.
 * - 실패해도 silent — best-effort. Supabase 미연결/RLS/네트워크 다 무해.
 * - 한 번 시드된 후엔 mockData 추가 시 키를 versioning하면(`.v2`) 다시 시드 가능.
 */
export async function seedMockProfilesOnce(): Promise<void> {
  try {
    const seeded = await AsyncStorage.getItem(SEED_KEY);
    if (seeded === '1') return;

    const rows: ProfileSeedRow[] = [
      ...MOCK_FRIENDS.map(toRow),
      ...MOCK_NON_FRIENDS.map(toRow),
    ];
    const { error } = await supabase
      .from('profiles')
      .upsert(rows, { onConflict: 'id' });
    if (error) {
      // 한 번 실패하면 다음 부팅에서 재시도(AsyncStorage 키 안 박음).
      return;
    }
    await AsyncStorage.setItem(SEED_KEY, '1');
  } catch {
    /* best-effort */
  }
}
