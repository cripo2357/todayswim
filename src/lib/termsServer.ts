// Pool's day — 약관 동의 서버 helpers (P3-A2, 2026-05-21).
//
// 단일 출처 = Supabase `terms_agreements` (append-only, 0044 스키마).
// `lib/terms.ts` 의 server+local 하이브리드 안에서 호출됨.
//
// 매핑:
//   ConsentKey ↔ terms_type (DB enum)
//     service        ↔ 'service'
//     privacyConsent ↔ 'privacy_consent'
//     location       ↔ 'location'
//     marketing      ↔ 'marketing'
//     age            ↔ 'age'   (문서 없는 연령확인이지만 계정 동의 기록으로 서버 보관 — 0108)
//
// 법적 증빙: terms_agreements.terms_version 은 동의 시점 버전 문자열 스냅샷.
// 본 모듈은 CURRENT_TERMS_VERSION 을 기본 인자로 가지며, 약관 개정 시 함께 bump.

import { supabase } from '@/lib/supabase';
import type { ConsentKey } from './terms';
import type { TermsKey, TermsMeta } from './termsContent';

/** 현재 게시 중인 약관 버전 — 본문(termsContent.ts) 개정 시 함께 갱신 + 새
 *  마이그레이션으로 terms 테이블에 새 row 추가, is_active 교체. */
export const CURRENT_TERMS_VERSION = '1.0.3';

// ConsentKey(클라) ↔ terms_type(DB) 양방향 매핑.
const TO_DB_TYPE: Record<ConsentKey, string> = {
  service: 'service',
  privacyConsent: 'privacy_consent',
  location: 'location',
  marketing: 'marketing',
  age: 'age',
};
const FROM_DB_TYPE: Record<string, ConsentKey> = {
  service: 'service',
  privacy_consent: 'privacyConsent',
  location: 'location',
  marketing: 'marketing',
  age: 'age',
};

interface CurrentAgreementRow {
  terms_type: string;
  action: 'agree' | 'withdraw';
  created_at: string;
}

/** 현재 유저의 약관 동의 상태 — `terms_agreement_current` 뷰에서 유저별 최신
 *  이벤트 1건씩 가져옴. agree 이면 timestamp, withdraw 이면 null 로 매핑.
 *  세션·뷰 조회 실패 → null 반환(호출자가 AsyncStorage 폴백). */
export async function fetchServerTermsState(
  userId: string,
): Promise<Partial<Record<ConsentKey, string | null>> | null> {
  try {
    const { data, error } = await supabase
      .from('terms_agreement_current')
      .select('terms_type, action, created_at')
      .eq('user_id', userId);
    if (error || !data) return null;

    const result: Partial<Record<ConsentKey, string | null>> = {};
    for (const row of data as CurrentAgreementRow[]) {
      const key = FROM_DB_TYPE[row.terms_type];
      if (!key) continue;
      result[key] = row.action === 'agree' ? row.created_at : null;
    }
    // 누락 키는 null 로 명시 — 호출자 코드의 분기 단순화.
    for (const k of ['age', 'service', 'privacyConsent', 'location', 'marketing'] as ConsentKey[]) {
      if (!(k in result)) result[k] = null;
    }
    return result;
  } catch {
    return null;
  }
}

// ── 약관 본문(게시 버전) 조회 ──────────────────────────────────────────────
// 본문 콘텐츠는 terms 테이블 is_active=true row 의 content jsonb 에 보관(서버
// 보관 → 약관 개정 시 앱 재빌드 불필요). 번들 TERMS_META 가 항상 폴백 바닥이라
// (lib/useTerms loadTerms) 조회 실패·오프라인·깨진 row 에도 화면은 안전.
//
// privacyPolicy 는 동의 대상이 아니라 ConsentKey 매핑(TO/FROM_DB_TYPE)엔 없지만
// 열람 대상 문서라 본문 매핑엔 5종 모두 포함.
const CONTENT_TYPE_TO_KEY: Record<string, TermsKey> = {
  service: 'service',
  privacy_consent: 'privacyConsent',
  privacy_policy: 'privacyPolicy',
  location: 'location',
  marketing: 'marketing',
};

interface TermsRow {
  type: string;
  version: string;
  content: Partial<TermsMeta> | null;
}

/** 게시 중(is_active)인 약관 5종 본문을 한 번에 조회. content jsonb 가 곧
 *  TermsMeta 형태. 실패/깨진 row → null(또는 일부 누락) → 호출자가 번들 폴백.
 *  best-effort: 절대 throw 하지 않음. */
export async function fetchActiveTerms(): Promise<Partial<Record<TermsKey, TermsMeta>> | null> {
  try {
    const { data, error } = await supabase
      .from('terms')
      .select('type, version, content')
      .eq('is_active', true);
    if (error || !data) return null;

    const out: Partial<Record<TermsKey, TermsMeta>> = {};
    for (const row of data as TermsRow[]) {
      const key = CONTENT_TYPE_TO_KEY[row.type];
      const c = row.content;
      // 방어: 본문 구조가 깨진 row 는 무시(번들 폴백 유지).
      if (!key || !c || !Array.isArray(c.sections) || !c.title) continue;
      out[key] = {
        title: c.title,
        version: c.version ?? `v${row.version}`,
        effectiveDate: c.effectiveDate ?? '',
        sections: c.sections,
      };
    }
    return Object.keys(out).length ? out : null;
  } catch {
    return null;
  }
}

/** 동의/철회 이벤트 적재 — append-only. 약관 개정 시 같은 user/type 에 새
 *  버전으로 다시 agree 이벤트가 쌓이는 구조(과거 이력 보존). */
export async function recordAgreementServer(
  userId: string,
  key: ConsentKey,
  action: 'agree' | 'withdraw',
  version: string = CURRENT_TERMS_VERSION,
): Promise<void> {
  try {
    await supabase.from('terms_agreements').insert({
      user_id: userId,
      terms_type: TO_DB_TYPE[key],
      terms_version: version,
      action,
    });
  } catch {
    // best-effort — 실패해도 로컬 캐시는 진행(다음 진입 시 재동의 유도).
  }
}
