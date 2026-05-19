/**
 * 가입 약관/동의 상태 — AsyncStorage 보관 (사용자 계정 단위 아닌 단말 단위).
 * Phase 2에서 계정 단위 + 버전관리 서버 스키마로 이관 (supabase/migrations/0044_terms.sql).
 *
 * 가입 동의 항목(Figma 101:3671) = 5개. 마케팅만 선택, 나머지 4개 필수.
 *   - age            만 14세 이상 (필수, 약관 문서 없음 = 연령 확인)
 *   - service        서비스 이용약관 (필수)
 *   - privacyConsent 개인정보 수집·이용 동의 (필수)
 *   - location       위치기반서비스 이용약관 (필수)
 *   - marketing      마케팅 정보 수신 동의 (선택)
 * 개인정보 처리방침(privacyPolicy)은 '고지' 문서 — 동의 대상 아님(설정에서 열람만).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ConsentKey =
  | 'age'
  | 'service'
  | 'privacyConsent'
  | 'location'
  | 'marketing';

/** 가입 게이트 필수 = 마케팅 제외 4개 */
export const MANDATORY_CONSENTS: ConsentKey[] = [
  'age',
  'service',
  'privacyConsent',
  'location',
];
const ALL_CONSENTS: ConsentKey[] = [...MANDATORY_CONSENTS, 'marketing'];

const KEY = (k: ConsentKey) => `poolsday.terms.${k}`;

/** 키별 동의 시각(ISO) 또는 null */
export type TermsState = Record<ConsentKey, string | null>;

export async function getTermsState(): Promise<TermsState> {
  const entries = await Promise.all(
    ALL_CONSENTS.map(
      async (k) => [k, await AsyncStorage.getItem(KEY(k))] as const,
    ),
  );
  return Object.fromEntries(entries) as TermsState;
}

/** 개별 동의 on/off — 상세 화면·체크박스 공용 */
export async function setConsent(
  key: ConsentKey,
  agreed: boolean,
): Promise<void> {
  if (agreed) await AsyncStorage.setItem(KEY(key), new Date().toISOString());
  else await AsyncStorage.removeItem(KEY(key));
}

/** 가입 진행 가능 = 필수 4개 모두 동의 (마케팅은 선택, 게이트 아님) */
export function isFullyAgreed(s: TermsState): boolean {
  return MANDATORY_CONSENTS.every((k) => !!s[k]);
}

export async function clearTerms(): Promise<void> {
  await Promise.all(ALL_CONSENTS.map((k) => AsyncStorage.removeItem(KEY(k))));
}
