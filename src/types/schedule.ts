/**
 * 자유수영 시간표 데이터 모델.
 *
 * 사용자가 등록·수정 요청해서 관리자 승인 후 게시되는 흐름.
 * Figma 5:14288 (조회) / 5:15159 (작성) 화면에서 사용.
 */

export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

/** 시간 슬롯 단위 — 새벽/오전/오후/저녁 4섹션 (Figma 5:15159 Section Header 기준) */
export type DayPart = '새벽' | '오전' | '오후' | '저녁';

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
  /** ISO 날짜 (YYYY-MM-DD) — "업데이트: 2026.10.31" */
  updatedAt: string;
  /** 요일별 시간 슬롯 */
  byDay: {
    [day in DayOfWeek]?: TimeSlot[];
  };
}

/** 작성 4스텝 임시 상태 — Zustand store에 보관 */
export interface ScheduleDraft {
  poolId: string;
  nickname?: string;
  /** 현재 입력 중인 (요일, 시간대) 컨텍스트 */
  currentDaySlot?: { day: DayOfWeek; part: DayPart };
  byDay: Schedule['byDay'];
}
