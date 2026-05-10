/**
 * 네비게이션 파라미터 타입.
 * SPEC.md §6 화면구성과 1:1 매칭.
 */
export type RootStackParamList = {
  Splash: undefined;
  MapMain: undefined;

  // 시간표 조회·작성
  ScheduleView: { poolId: string };
  ScheduleNickname: { poolId: string };
  ScheduleWrite: { poolId: string; nickname: string };
  ScheduleTime: {
    poolId: string;
    nickname: string;
    day: string;
    /** start: 시작시간 입력. end: 종료시간 입력 (startTime 필수) */
    mode: 'start' | 'end';
    /** mode='end'일 때만 — "HH:MM" */
    startTime?: string;
  };
  ScheduleDone: undefined;

  // 수영장 등록·수정
  PoolName: { mode: 'create' | 'edit'; poolId?: string };
  PoolDone: { mode: 'create' | 'edit' };

  // 부가 기능
  More: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
