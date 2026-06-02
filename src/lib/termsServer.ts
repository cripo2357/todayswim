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

/** 현재 게시 중인 약관 버전 — 본문(termsContent.ts) 개정 시 함께 갱신 + 새
 *  마이그레이션으로 terms 테이블에 새 row 추가, is_active 교체. */
export const CURRENT_TERMS_VERSION = '1.0.0';

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
