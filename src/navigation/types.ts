/**
 * 네비게이션 파라미터 타입.
 * SPEC.md §6 화면구성과 1:1 매칭.
 */
export type RootStackParamList = {
  Splash: undefined;
  MapMain: undefined;

  // 시간표 조회·작성
  // 흐름: Map → Write(시간표 작성) → Time(modal/요일별) → Nickname(마지막) → Done
  ScheduleView: { poolId: string };
  ScheduleWrite: { poolId: string };
  ScheduleTime: { poolId: string; day: string };
  ScheduleNickname: { poolId: string };
  ScheduleDone: undefined;

  // 수영장 등록·수정
  PoolName: { mode: 'create' | 'edit'; poolId?: string };
  PoolDone: { mode: 'create' | 'edit' };

  // 부가 기능
  More: undefined;
  Announcements: undefined;

  // 수영장 검색 필터
  PoolFilter: undefined;

  // 상태 / 오류 / 점검 / 강제 업데이트 화면 (Figma 77:1064/77:1388/77:1462/77:1636).
  // Maintenance/AppUpdateRequired는 라우터/AppGate에서 트리거 — 일반 navigation 흐름엔 잘 안 들어감.
  ErrorNotFound: undefined;
  ErrorNoInternet: undefined;
  Maintenance: { reopenLabel?: string };
  AppUpdateRequired: { versionLabel?: string; iosUrl?: string; androidUrl?: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
