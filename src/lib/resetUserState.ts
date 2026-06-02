// 사용자 스코프 로컬 상태 전면 초기화 — 로그아웃 / 탈퇴 / 게스트 진입 시 호출.
//
// (2026-06-02) 배경: signOut 이 useProfile 만 비워서 즐겨찾기·내 일정·친구·
// 설정 등 계정 데이터가 다음 사용자/게스트에게 잔존하던 누수 일괄 차단.
// 정책(사용자 확정): "전부 초기화 — 깨끗한 슬레이트". 개인 데이터 + 모든
// 설정값(공개범위·알림토글·지도뷰·마케팅 동의)까지 가입 기본값으로.
//
// 기기 스코프 스토어(poolFilter/selection/addScheduleIntent)는 영속도 없고
// App.tsx 시작 시 초기화되므로 대상 아님.

import { useProfile } from '@/store/profile';
import { useFavorites } from '@/store/favorites';
import { useSwimSchedules } from '@/store/swimSchedule';
import { useFriends } from '@/store/friends';
import { useSentInvites } from '@/store/sentInvites';
import { usePrefs } from '@/store/prefs';

/** 계정 데이터·설정을 메모리+영속 모두 비움. best-effort(부분 실패 무시).
 *
 *  ⚠️ 약관 동의(clearTerms)는 **여기서 지우지 않는다.** 동의는 계정 소속
 *  기록(서버 terms_agreements, uid 기준)이고, 'age'(만14세)는 서버 enum이
 *  없어 로컬에만 산다. 로그아웃 때 지우면 같은 계정 재로그인 시 age 가 비어
 *  "약관 미동의"로 판정→약관 화면→ProfileSetup(새 가입처럼)으로 잘못 보냄.
 *  (다른 계정으로 로그인하면 서버 동의가 빈 값이라 어차피 약관 게이트가 뜨고,
 *   TermsAgreementScreen 진입 시 firstFocus 가 로컬 동의를 비워 opt-in 보장.) */
export async function resetUserScopedState(): Promise<void> {
  useFriends.getState().reset();
  useSentInvites.getState().reset();
  await Promise.all([
    useProfile.getState().clear(),
    useFavorites.getState().reset(),
    useSwimSchedules.getState().reset(),
    usePrefs.getState().reset(),
  ]);
}
