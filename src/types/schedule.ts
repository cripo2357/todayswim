/**
 * 자유수영 시간표 데이터 모델.
 *
 * 사용자가 등록·수정 요청해서 관리자 승인 후 게시되는 흐름.
 * Figma 5:14288 (조회) / 5:15159 (작성) 화면에서 사용.
 */

export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

/** 닉네임 표시 안하기 옵션 선택 시 저장되는 값. credit 표시에서 빼는 기준. */
export const ANON_NICKNAME = '익명의 수영러';
export function isAnonNickname(nick?: string | null): boolean {
  return !nick || nick.trim() === '' || nick === ANON_NICKNAME;
}

export interface TimeSlot {
  /** "06:00" */
  start: string;
  /** "08:00" */
  end: string;
  /** 시간(소수) — "2시간" 같은 텍스트 표시용. start/end로도 계산 가능 */
  hours?: number;
}

export interface Schedule {
  poolId: string;
  /** 작성자 닉네임 — Figma "수영맨" 같은 크레딧 */
  authorNickname: string;
  /** 앱 통일 날짜 포맷 YY.MM.DD(요일) — useSchedules에서 formatDate로 변환 후 보관. */
  updatedAt: string;
  /** 요일별 시간 슬롯 */
  byDay: {
    [day in DayOfWeek]?: TimeSlot[];
  };
  /**
   * 요일별 안내 문구 — 격주·특정 주차 운영 등 예외 케이스.
   * 예: { "토": "매월 첫째 주에만 운영합니다." }
   * Schedule 카드에서 선택된 요일에 대한 note만 표시.
   */
  dayNotes?: {
    [day in DayOfWeek]?: string;
  };
  /**
   * 계절/변형 운영 — 요일 슬롯을 라벨 붙은 그룹으로 분할 (Figma 144:3716).
   * 예: { "일": [{ label: "기본 운영 (매월 2,4주차 일요일은 쉽니다.)", months:[1,2,3,4,5,10,11,12], slots: [...] },
   *              { label: "6~9월 운영 (하절기는 매주 일요일 운영합니다.)", months:[6,7,8,9], slots: [...] }] }
   * 있으면 ScheduleView가 그룹 렌더, 없으면 byDay flat 그대로(하위호환).
   * byDay[요일]은 여전히 채워둠(요일칩 활성·dayNote 게이팅 기준).
   * months: 그 그룹이 적용되는 달(1~12). 더블탭→등록 시트가 선택 날짜의 월로
   *   시즌 그룹을 골라 타임표를 보여줌(없으면 ScheduleView 표시엔 영향 없음).
   */
  slotGroups?: {
    [day in DayOfWeek]?: SlotGroup[];
  };
}

/** 계절/변형 운영 그룹 1개 — slotGroups의 요소. */
export interface SlotGroup {
  /** 그룹 캡션 (예: "기본 운영 (매월 2, 4주차 일요일은 쉽니다.)") */
  label?: string;
  /** 적용되는 달(1~12). 시즌 노출/전환월 판정·등록 시트 슬롯 해석 기준. */
  months?: number[];
  slots: TimeSlot[];
}

/** 작성 4스텝 임시 상태 — Zustand store에 보관 */
export interface ScheduleDraft {
  poolId: string;
  nickname?: string;
  byDay: Schedule['byDay'];
  /** 요일별 안내 문구 — 해당 요일에 슬롯 1개 이상 등록될 때만 입력 가능. */
  dayNotes?: Schedule['dayNotes'];
}
