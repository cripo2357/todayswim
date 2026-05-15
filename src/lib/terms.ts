/**
 * 약관 동의 상태 — AsyncStorage 보관 (사용자 계정 단위 아닌 단말 단위).
 * Phase 2에서 user_profiles 테이블의 agreed_at 컬럼으로 이관 가능.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_SERVICE = 'poolsday.terms.service';
const KEY_PRIVACY = 'poolsday.terms.privacy';

export interface TermsState {
  serviceAgreedAt: string | null; // ISO date
  privacyAgreedAt: string | null;
}

export async function getTermsState(): Promise<TermsState> {
  const [service, privacy] = await Promise.all([
    AsyncStorage.getItem(KEY_SERVICE),
    AsyncStorage.getItem(KEY_PRIVACY),
  ]);
  return {
    serviceAgreedAt: service,
    privacyAgreedAt: privacy,
  };
}

export async function agreeService(): Promise<void> {
  await AsyncStorage.setItem(KEY_SERVICE, new Date().toISOString());
}

export async function agreePrivacy(): Promise<void> {
  await AsyncStorage.setItem(KEY_PRIVACY, new Date().toISOString());
}

export async function declineService(): Promise<void> {
  await AsyncStorage.removeItem(KEY_SERVICE);
}

export async function declinePrivacy(): Promise<void> {
  await AsyncStorage.removeItem(KEY_PRIVACY);
}

export async function clearTerms(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(KEY_SERVICE),
    AsyncStorage.removeItem(KEY_PRIVACY),
  ]);
}

export function isFullyAgreed(s: TermsState): boolean {
  return !!s.serviceAgreedAt && !!s.privacyAgreedAt;
}
