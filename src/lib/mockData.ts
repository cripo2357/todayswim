// 소셜(친구·일정·레슨) 공유 도메인 타입.
//
// (P3 prod, 2026-06-02): Phase-1 더미 데이터(MOCK_FRIENDS / MOCK_NON_FRIENDS /
// MOCK_SCHEDULES / MOCK_OTHER_SCHEDULES / MOCK_OTHER_LESSONS)는 정식 출시를
// 앞두고 전부 제거됨. 이 파일은 이제 여러 모듈이 공유하는 타입 정의만 보유한다.
// 런타임 데이터는 서버(profiles / user_schedules)가 단일 권위.
//
// (파일명은 다수 import 경로 호환을 위해 유지 — 향후 src/types 로 이전 가능.)

import type { ScheduleVisibility } from '@/store/swimSchedule';
import type { AvatarId } from '@/lib/avatars';
import type { DayOfWeek } from '@/types/schedule';

// 친구/계정 표시 모델 — 실 데이터 모델은 nickname 단일 식별자(profiles.nickname).
export interface MockAccount {
  id: string;
  nickname: string;
  status: string;
  code: string;
  /** 번들 프로필 아바타 (avatar-male-1 등) */
  avatar: AvatarId;
}

// 다른 사용자의 슬롯 참여(소유 개념 아님 — 풀+날짜+시작/끝 단위 참여).
// 참여자 조회는 가시성/관계/내 설정으로 필터만 함(resolveParticipants).
export interface OtherSchedule {
  id: string;
  userId: string;
  nickname: string;
  avatar: AvatarId;
  isFriend: boolean;
  poolId: string;
  poolName: string;
  date: string; // YYYY-MM-DD
  start: string;
  end: string;
  visibility: ScheduleVisibility;
}

// 친구 수영 레슨(주간 반복 — 요일+시간). 공개일 때만 지도 stack 노출.
export interface OtherLesson {
  id: string;
  userId: string;
  nickname: string;
  avatar: AvatarId;
  isFriend: boolean;
  poolId: string;
  poolName: string;
  day: DayOfWeek;
  start: string; // "HH:MM"
  end: string;
  visibility: ScheduleVisibility; // 공개='public'
}
