// 더미 데이터 (Phase 1 목업) — 친구 10 / 친구아닌 계정 10 / 수영일정 50.
//
// 백엔드(친구 시스템·Supabase) 연동 전까지 화면을 채우는 용도.
// FriendsTab / InviteFriendsScreen / 달력 store(useSwimSchedules) 에서 사용.

import type { MySwimSchedule, ScheduleVisibility } from '@/store/swimSchedule';
import type { AvatarId } from '@/lib/avatars';

export interface MockAccount {
  id: string;
  name: string;
  nickname: string;
  status: string;
  code: string;
  /** 번들 프로필 아바타 (avatar-male-1 등) */
  avatar: AvatarId;
}

// ── 친구 10명 ────────────────────────────────────────────────
export const MOCK_FRIENDS: MockAccount[] = [
  { id: 'fr1', name: '강두형', nickname: '물개왕', status: '오늘도 1km 완영', code: 'POOL-1A2B', avatar: 'avatar-male-1' },
  { id: 'fr2', name: '이수진', nickname: '자유형장인', status: '접영 연습 중', code: 'POOL-3C4D', avatar: 'avatar-female-1' },
  { id: 'fr3', name: 'Joshua Smith', nickname: 'josh', status: '수영 더 열심히', code: 'POOL-5E6F', avatar: 'avatar-male-2' },
  { id: 'fr4', name: '박민재', nickname: '새벽수영러', status: '아침 6시 고정', code: 'POOL-7G8H', avatar: 'avatar-male-3' },
  { id: 'fr5', name: 'Alice Kim', nickname: 'ally', status: '평영이 제일 좋아', code: 'POOL-9I0J', avatar: 'avatar-female-2' },
  { id: 'fr6', name: '정해린', nickname: '돌고래', status: '대회 준비 중 🏊', code: 'POOL-1K2L', avatar: 'avatar-female-3' },
  { id: 'fr7', name: '최우진', nickname: '버터플라이', status: '접영 200m 도전', code: 'POOL-3M4N', avatar: 'avatar-male-4' },
  { id: 'fr8', name: 'Daniel Park', nickname: 'danp', status: '주 5회 수영', code: 'POOL-5O6P', avatar: 'avatar-male-5' },
  { id: 'fr9', name: '한지우', nickname: '잠수왕', status: '숨 참기 2분', code: 'POOL-7Q8R', avatar: 'avatar-female-4' },
  { id: 'fr10', name: '오세영', nickname: '수영바보', status: '수영장이 내 집', code: 'POOL-9S0T', avatar: 'avatar-male-6' },
];

// ── 친구 아닌 계정 10개 ──────────────────────────────────────
export const MOCK_NON_FRIENDS: MockAccount[] = [
  { id: 'nf1', name: 'Bob Johnson', nickname: 'bobby', status: '수영 잘하고 싶다', code: 'POOL-AB12', avatar: 'avatar-male-2' },
  { id: 'nf2', name: '김도윤', nickname: '초보수영', status: '발차기 연습 중', code: 'POOL-CD34', avatar: 'avatar-male-5' },
  { id: 'nf3', name: 'Clara Garcia', nickname: 'clara', status: '물 무서워요', code: 'POOL-EF56', avatar: 'avatar-female-5' },
  { id: 'nf4', name: '서지호', nickname: '주말수영', status: '주말에만 출몰', code: 'POOL-GH78', avatar: 'avatar-male-3' },
  { id: 'nf5', name: 'Emma Lee', nickname: 'emma', status: '자유형 25m', code: 'POOL-IJ90', avatar: 'avatar-female-6' },
  { id: 'nf6', name: '윤채원', nickname: '물방울', status: '수영 입문 1주차', code: 'POOL-KL12', avatar: 'avatar-female-2' },
  { id: 'nf7', name: 'Frank Wong', nickname: 'frank', status: '레인 독차지 금지', code: 'POOL-MN34', avatar: 'avatar-male-6' },
  { id: 'nf8', name: '임태현', nickname: '느림보', status: '천천히 오래', code: 'POOL-OP56', avatar: 'avatar-male-4' },
  { id: 'nf9', name: 'Henry Martinez', nickname: 'henry', status: '@henrymartinez', code: 'POOL-QR78', avatar: 'avatar-female-6' },
  { id: 'nf10', name: '배수아', nickname: '인어공주', status: '바다 수영 좋아', code: 'POOL-ST90', avatar: 'avatar-female-3' },
];

// ── 수영 일정 50개 (오늘 기준 ±, 다양한 풀/시간/공개범위) ────
const POOLS = [
  { id: 'p1', name: '올림픽 수영장' },
  { id: 'p2', name: '강남구민체육센터' },
  { id: 'p3', name: 'ABC 수영장' },
  { id: 'p4', name: '잠실 실내수영장' },
  { id: 'p5', name: '관악구민체육센터' },
  { id: 'p6', name: '송파 한솔수영장' },
  { id: 'p7', name: '여의도 스포츠클럽' },
  { id: 'p8', name: '목동 아쿠아센터' },
];

const SLOTS = [
  { start: '06:00', end: '08:00' },
  { start: '07:00', end: '09:00' },
  { start: '09:00', end: '11:00' },
  { start: '12:00', end: '14:00' },
  { start: '13:00', end: '15:00' },
  { start: '15:00', end: '18:00' },
  { start: '18:00', end: '20:00' },
  { start: '20:00', end: '22:00' },
];

const VIS: ScheduleVisibility[] = ['private', 'friends', 'public'];

function ymd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export const MOCK_SCHEDULES: MySwimSchedule[] = Array.from({ length: 50 }, (_, i) => {
  const base = new Date();
  // -12 ~ +24일 사이로 분산 (오늘 포함, 같은 날 복수 일정도 생김)
  base.setDate(base.getDate() + ((i * 7) % 37) - 12);
  const pool = POOLS[i % POOLS.length];
  const slot = SLOTS[i % SLOTS.length];
  return {
    id: `mock-sch-${i + 1}`,
    poolId: pool.id,
    poolName: pool.name,
    poolPhotoUrl: undefined,
    date: ymd(base),
    start: slot.start,
    end: slot.end,
    visibility: VIS[i % VIS.length],
    createdAt: new Date().toISOString(),
  };
});

// ── 다른 사용자의 슬롯 참여(테스트용) ───────────────────────────
// 소유 개념 아님 — 각 사용자가 슬롯(풀+날짜+시작/끝)에 독립 참여.
// 참여자 조회는 가시성/관계/내 설정으로 필터만 함(resolveParticipants).
export interface OtherSchedule {
  id: string;
  userId: string;
  name: string;
  avatar: AvatarId;
  isFriend: boolean;
  poolId: string;
  poolName: string;
  date: string; // YYYY-MM-DD
  start: string;
  end: string;
  visibility: ScheduleVisibility;
}

// 관악구민종합체육센터 (POOL_SEOUL_0005).
const GWANAK = { id: 'POOL_SEOUL_0005', name: '관악구민종합체육센터' };

// 테스트 집중 배치: 2026-05-23(토)·05-24(일)의 관악구민 자유수영 슬롯
// (마이그레이션 0021 by_day — 토 4개 / 일 3개). 이 날짜·슬롯에 내가
// 관악구민 일정을 등록하면 더미 참여자가 풍부하게 보임.
const TEST_SLOTS: { date: string; start: string; end: string }[] = [
  { date: '2026-05-23', start: '06:00', end: '07:50' }, // 토
  { date: '2026-05-23', start: '09:00', end: '10:50' },
  { date: '2026-05-23', start: '16:00', end: '17:50' },
  { date: '2026-05-23', start: '19:00', end: '20:50' },
  { date: '2026-05-24', start: '09:00', end: '10:50' }, // 일
  { date: '2026-05-24', start: '12:00', end: '13:50' },
  { date: '2026-05-24', start: '15:00', end: '16:50' },
];

const OTHER_USERS = [
  ...MOCK_FRIENDS.map((u) => ({ ...u, isFriend: true })),
  ...MOCK_NON_FRIENDS.map((u) => ({ ...u, isFriend: false })),
];

// 친구·비친구 각각 가시성 분포 (필터 테스트용 — friends/private 섞음)
const FRIEND_VIS: ScheduleVisibility[] = [
  'public', 'friends', 'public', 'friends', 'private',
];
const NONFRIEND_VIS: ScheduleVisibility[] = [
  'public', 'public', 'public', 'friends', 'private',
];

// 20명 × 10 = 200. 5/23·5/24 7개 슬롯에 고루 분배(다양하게) →
// 어느 슬롯을 등록해도 친구·비친구·가시성 섞인 참여자가 충분히 보임.
const BASE_OTHER_SCHEDULES: OtherSchedule[] = OTHER_USERS.flatMap(
  (u, ui) =>
    Array.from({ length: 10 }, (_, j) => {
      const slot = TEST_SLOTS[(ui + j) % TEST_SLOTS.length];
      const visibility = (u.isFriend ? FRIEND_VIS : NONFRIEND_VIS)[
        (ui + j) % 5
      ];
      return {
        id: `oth-${u.id}-${j + 1}`,
        userId: u.id,
        name: u.name,
        avatar: u.avatar,
        isFriend: u.isFriend,
        poolId: GWANAK.id,
        poolName: GWANAK.name,
        date: slot.date,
        start: slot.start,
        end: slot.end,
        visibility,
      };
    }),
);

// 2026-05-17 ~ 05-30 범위 추가 더미 30개 (친구 7명·비친구 일부 섞음).
// 친구 일정은 대부분 public/friends라 친구 탭 주간달력에서 날짜별로 보임
// (private 소수 포함 — 비공개 제외 필터 확인용). 풀=관악구민(실풀, '나도
// 참여' 시 해당 풀 일정 시트가 정상 동작).
const RANGE_SLOTS: { start: string; end: string }[] = [
  { start: '06:00', end: '07:50' },
  { start: '09:00', end: '10:50' },
  { start: '12:00', end: '13:50' },
  { start: '15:00', end: '16:50' },
  { start: '19:00', end: '20:50' },
];
const RANGE_5_17_5_30: OtherSchedule[] = Array.from({ length: 30 }, (_, i) => {
  const u = OTHER_USERS[(i * 3 + 1) % OTHER_USERS.length];
  const day = 17 + (i % 14); // 05-17 ~ 05-30
  const slot = RANGE_SLOTS[i % RANGE_SLOTS.length];
  // 친구는 public/friends 위주(보이게), 5개당 1개만 private
  const visibility: ScheduleVisibility = u.isFriend
    ? i % 5 === 4
      ? 'private'
      : i % 2 === 0
        ? 'public'
        : 'friends'
    : (NONFRIEND_VIS[i % 5] as ScheduleVisibility);
  return {
    id: `oth-range-${i + 1}`,
    userId: u.id,
    name: u.name,
    avatar: u.avatar,
    isFriend: u.isFriend,
    poolId: GWANAK.id,
    poolName: GWANAK.name,
    date: `2026-05-${String(day).padStart(2, '0')}`,
    start: slot.start,
    end: slot.end,
    visibility,
  };
});

// ── 지도 프로필 스택 테스트 전용 (Figma 173:13595 등) ──────────
// 친구 10명 전원, 2026-05-18·19 관악구민(POOL_SEOUL_0005) 자유수영.
// "24h 내 진행예정" 윈도가 롤링(now ~ now+24h)이라, 18·19 두 날에
// 시간대를 흩뿌려 18일 어느 시각에 테스트해도 일부가 잡히게 함.
// 5명 중 1명꼴(idx%5===4 → fr5·fr10) private = 스택 제외 검증용.
// (친구 roster가 10명뿐이라 "… more"(29 초과)는 이 데이터로는 미발생.)
const MAP_STACK_TEST_TIMES: { start: string; end: string }[] = [
  { start: '06:00', end: '07:50' },
  { start: '09:00', end: '10:50' },
  { start: '12:00', end: '13:50' },
  { start: '15:00', end: '16:50' },
  { start: '18:00', end: '19:50' },
  { start: '20:00', end: '21:50' },
];
const GWANAK_24H_TEST: OtherSchedule[] = MOCK_FRIENDS.flatMap((u, i) => {
  const visibility: ScheduleVisibility =
    i % 5 === 4 ? 'private' : i % 2 === 0 ? 'public' : 'friends';
  const t18 = MAP_STACK_TEST_TIMES[i % MAP_STACK_TEST_TIMES.length];
  const t19 = MAP_STACK_TEST_TIMES[(i + 3) % MAP_STACK_TEST_TIMES.length];
  const base = {
    userId: u.id,
    name: u.name,
    avatar: u.avatar,
    isFriend: true,
    poolId: GWANAK.id,
    poolName: GWANAK.name,
    visibility,
  };
  return [
    { ...base, id: `oth-map18-${u.id}`, date: '2026-05-18', start: t18.start, end: t18.end },
    { ...base, id: `oth-map19-${u.id}`, date: '2026-05-19', start: t19.start, end: t19.end },
  ];
});

export const MOCK_OTHER_SCHEDULES: OtherSchedule[] = [
  ...BASE_OTHER_SCHEDULES,
  ...RANGE_5_17_5_30,
  ...GWANAK_24H_TEST,
];
