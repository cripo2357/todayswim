// Pool's day — 단일 기기 로그인 정책. 한 계정은 한 기기에서만 로그인 유지.
//
// 동작:
//  · 로그인 성공 시 claimDevice() — 새 기기-세션 UUID 생성→로컬 저장→서버
//    profiles.active_device에 기록(이 기기가 "현재 활성").
//  · 다른 기기가 로그인하면 server active_device가 그 기기 id로 바뀜.
//  · 옛 기기는 앱 실행/포그라운드/realtime 시 isSupersededByOtherDevice()로
//    server≠로컬 감지 → 자동 로그아웃(useSingleDeviceGuard).
//
// best-effort: 네트워크/세션 실패는 silent(로그아웃 안 함 — 오탐 방지).

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase } from '@/lib/supabase';

const KEY = 'poolsday.deviceSession';
const INSTALL_KEY = 'poolsday.installId';

/** 설치 단위 안정 ID — 재설치 전까지 불변. 로그인마다 새로 생성하는
 *  deviceSession(claimDevice)과 다름. 푸시 토큰 "한 기기=한 유저" 정리용
 *  (registerForPush가 push_tokens.device_id에 기록 → DB 트리거가 같은
 *  device_id의 옛 행 삭제). 없으면 1회 생성·저장. [[push_token_stale_cross_delivery]] */
export async function getInstallId(): Promise<string | null> {
  try {
    let id = await AsyncStorage.getItem(INSTALL_KEY);
    if (!id) {
      id = Crypto.randomUUID();
      await AsyncStorage.setItem(INSTALL_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

/** 이 기기를 활성 기기로 등록 — 로그인 성공 직후 / 프로필 생성 직후 호출.
 *
 *  순서 중요: **서버 기록 → 성공 후 로컬 저장**. 로컬을 먼저 쓰면, 서버 UPDATE
 *  가 커밋되기 전 찰나에 가드(useSingleDeviceGuard)가 검사할 때
 *  server(옛 기기 id) ≠ local(새 id) 로 보여 신규 기기가 자기 자신을 로그아웃
 *  하는 레이스가 생긴다. 서버를 먼저 확정하면 local 이 채워질 땐 이미
 *  server==local 이라 오판 불가. */
export async function claimDevice(): Promise<void> {
  try {
    const deviceId = Crypto.randomUUID();
    const uid = (await supabase.auth.getSession()).data.session?.user?.id;
    if (!uid) return;
    // 본인 profiles row(auth_uid 매칭)에 기록. row 없으면(신규, 프로필 전) 0행 —
    // 프로필 생성 후 다시 claim.
    const { error } = await supabase
      .from('profiles')
      .update({ active_device: deviceId })
      .eq('auth_uid', uid);
    if (error) return; // 서버 기록 실패 → 로컬도 안 바꿈(가드 오탐 방지)
    await AsyncStorage.setItem(KEY, deviceId);
  } catch {
    /* best-effort */
  }
}

/** 로그아웃 시 로컬 기기-세션 id 제거. */
export async function clearLocalDeviceId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/**
 * 다른 기기가 로그인해 내가 밀려났는지.
 * server active_device가 내 로컬 id와 다르면 true(= 로그아웃 대상).
 * 로컬 id 없음(아직 claim 전) / server 없음 / 오류 → false(오탐 방지).
 */
export async function isSupersededByOtherDevice(): Promise<boolean> {
  try {
    const uid = (await supabase.auth.getSession()).data.session?.user?.id;
    if (!uid) return false;
    const local = await AsyncStorage.getItem(KEY);
    if (!local) return false;
    const { data } = await supabase
      .from('profiles')
      .select('active_device')
      .eq('auth_uid', uid)
      .maybeSingle();
    const server = (data as { active_device?: string | null } | null)
      ?.active_device;
    return !!server && server !== local;
  } catch {
    return false;
  }
}
