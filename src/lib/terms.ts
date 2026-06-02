/**
 * 가입 약관/동의 상태 — P3-A2 (2026-05-21) 부터 **서버 + 로컬 하이브리드**.
 *
 * - Google/Kakao 실 세션 → 서버 `terms_agreements` (append-only, 0044 + 0079).
 * - Apple TEST MODE / 오프라인 / 미인증 → AsyncStorage 폴백.
 * - 쓰기는 **양쪽 동시** — 서버 best-effort + 로컬 캐시(오프라인 read 보장).
 *
 * 가입 동의 항목(Figma 101:3671) = 5개. 마케팅만 선택, 나머지 4개 필수.
 *   - age            만 14세 이상 (필수, 약관 문서 없음 = 연령 확인)
 *   - service        서비스 이용약관 (필수)
 *   - privacyConsent 개인정보 수집·이용 동의 (필수)
 *   - location       위치기반서비스 이용약관 (필수)
 *   - marketing      마케팅 정보 수신 동의 (선택)
 *
 * 개인정보 처리방침(privacyPolicy)은 '고지' 문서 — 동의 대상 아님(설정에서 열람만).
 * 'age'(만14세)는 약관 문서는 없지만 가입 필수 동의 — 0108부터 서버 보관
 * (terms_agreements, uid 기준)이라 재로그인/기기변경에도 복원됨.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import {
  fetchServerTermsState,
  recordAgreementServer,
} from '@/lib/termsServer';

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

async function getLocalTermsState(): Promise<TermsState> {
  const entries = await Promise.all(
    ALL_CONSENTS.map(
      async (k) => [k, await AsyncStorage.getItem(KEY(k))] as const,
    ),
  );
  return Object.fromEntries(entries) as TermsState;
}

/** 현재 동의 상태 — 세션 있으면 서버 우선, 실패/없음이면 로컬.
 *  'age' 는 항상 로컬(약관 문서 아님). */
export async function getTermsState(): Promise<TermsState> {
  const local = await getLocalTermsState();
  try {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) return local; // 세션 없음 — Apple mock / 미인증

    const server = await fetchServerTermsState(uid);
    if (!server) return local; // 서버 실패 — 로컬 폴백

    // 서버가 계정 권위 — age 포함 5개 모두 서버 우선, 미동기분만 로컬 폴백
    // (가입 직후 서버 write 가 아직 안 끝난 in-session 케이스 보정).
    return {
      age: server.age ?? local.age,
      service: server.service ?? local.service,
      privacyConsent: server.privacyConsent ?? local.privacyConsent,
      location: server.location ?? local.location,
      marketing: server.marketing ?? local.marketing,
    };
  } catch {
    return local;
  }
}

/** 개별 동의 on/off — 상세 화면·체크박스 공용. 서버+로컬 동시 갱신. */
export async function setConsent(
  key: ConsentKey,
  agreed: boolean,
): Promise<void> {
  // 로컬 캐시 — 항상 갱신(오프라인 read 보장).
  if (agreed) await AsyncStorage.setItem(KEY(key), new Date().toISOString());
  else await AsyncStorage.removeItem(KEY(key));

  // 서버 — 세션 있을 때만, best-effort. (age 포함 5개 모두 계정 보관 — 0108)
  try {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) return;
    await recordAgreementServer(uid, key, agreed ? 'agree' : 'withdraw');
  } catch {
    // 서버 실패도 무시 — 로컬 캐시는 이미 갱신됨.
  }
}

/** 가입 진행 가능 = 필수 4개 모두 동의 (마케팅은 선택, 게이트 아님) */
export function isFullyAgreed(s: TermsState): boolean {
  return MANDATORY_CONSENTS.every((k) => !!s[k]);
}

/** 로컬 캐시 전체 삭제 — 회원 탈퇴 시 / Apple TEST MODE 리셋 시.
 *  서버 이력은 보존(append-only). 탈퇴 시 user 자체가 사라지면서 정리됨. */
export async function clearTerms(): Promise<void> {
  await Promise.all(ALL_CONSENTS.map((k) => AsyncStorage.removeItem(KEY(k))));
}
