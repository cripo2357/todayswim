// 약관 본문 로더 — 서버(terms 테이블) 게시본을 가져오되 번들 TERMS_META 를
// "항상 보장되는 바닥"으로 둔다(오프라인·조회실패·깨진 row 에도 화면 안전).
//
// 우선순위(낮음→높음 overlay): 번들 → AsyncStorage 캐시 → 서버.
//   - 번들: import 즉시 동기 사용(가입·오프라인 보장 경로).
//   - 캐시: 직전 세션이 받아둔 서버본(오프라인에서도 최신 표시).
//   - 서버: 진입 시 best-effort 재검증 → 캐시 갱신.
//
// 본문 표시는 읽기 전용 TermsDetailScreen 한 곳뿐이라(동의 게이트는 별개)
// 서버 연동 리스크가 낮다. 동의 기록 버전은 termsServer.CURRENT_TERMS_VERSION.

import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TERMS_META, type TermsKey, type TermsMeta } from './termsContent';
import { fetchActiveTerms } from './termsServer';

const CACHE_KEY = 'pd.terms.content.v1';

type TermsMap = Record<TermsKey, TermsMeta>;

// 세션 메모리 캐시 — 한 세션 내 재진입 시 즉시 반환(재조회 방지).
let _mem: TermsMap | null = null;
let _inflight: Promise<TermsMap> | null = null;

function overlay(base: TermsMap, patch: Partial<Record<TermsKey, TermsMeta>> | null): TermsMap {
  if (!patch) return base;
  const next = { ...base };
  (Object.keys(patch) as TermsKey[]).forEach((k) => {
    const v = patch[k];
    if (v && Array.isArray(v.sections) && v.title) next[k] = v;
  });
  return next;
}

/** 약관 5종 본문 맵을 로드. 번들 바닥 + 캐시 overlay + 서버 overlay.
 *  항상 5종이 채워진 맵을 resolve(번들 보장). 세션 내 1회만 실제 작업. */
export async function loadTerms(): Promise<TermsMap> {
  if (_mem) return _mem;
  if (_inflight) return _inflight;

  _inflight = (async () => {
    let merged: TermsMap = { ...TERMS_META };

    // 캐시 overlay (오프라인 최신본)
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      if (raw) merged = overlay(merged, JSON.parse(raw));
    } catch {
      /* 캐시 손상 무시 — 번들 유지 */
    }

    // 서버 재검증(best-effort) → 성공 시 overlay + 캐시 갱신
    const server = await fetchActiveTerms();
    if (server) {
      merged = overlay(merged, server);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(server)).catch(() => {});
    }

    _mem = merged;
    return merged;
  })();

  return _inflight;
}

/** 단일 약관 본문 — 번들본을 즉시 반환(동기) 후, 로드 완료 시 서버/캐시본으로 교체.
 *  서버가 없거나 실패해도 번들본이 그대로 보여 화면이 비지 않는다. */
export function useTermsMeta(key: TermsKey): TermsMeta {
  const [meta, setMeta] = useState<TermsMeta>(() => (_mem ?? TERMS_META)[key]);

  useEffect(() => {
    let alive = true;
    // _mem 이 이미 있으면 즉시 반영(다음 tick), 없으면 로드 후 반영.
    setMeta((_mem ?? TERMS_META)[key]);
    loadTerms()
      .then((all) => {
        if (alive && all[key]) setMeta(all[key]);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key]);

  return meta;
}
