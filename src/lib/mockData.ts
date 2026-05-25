// 더미 데이터 (Phase 1 목업) — 친구 / 친구아닌 계정 / 수영일정.
//
// P2 진입(2026-05-20) 시 모든 mock 계정 id를 **6자리 친구코드**로 통일
// (accountCode 결정적 해시 적용). 이전에는 'fr1'/'nf1' 같은 임의 string이라
// 서버 profiles 인프라(0047~)와 매핑이 안 됐음 — 통일 후 mock 친구 모두
// 클라 자동 시드(seedMockProfiles)로 실제 서버 row가 됨.
//
// FriendsTab / InviteFriendsScreen / 달력 store(useSwimSchedules) 에서 사용.

import type { MySwimSchedule, ScheduleVisibility } from '@/store/swimSchedule';
import type { AvatarId } from '@/lib/avatars';
import type { DayOfWeek } from '@/types/schedule';
import { accountCode } from '@/lib/friendCode';

// 실 데이터 모델은 nickname 단일 식별자(profiles.nickname). mock도 동일하게
// nickname만 둔다 — 과거의 name(실명) 필드는 표시 일관성·검색 혼란을 일으켜
// 제거(예: 닉네임 '돌고래'를 친구목록에선 '정해린'으로 보여주는 mismatch).
export interface MockAccount {
  id: string;
  nickname: string;
  status: string;
  code: string;
  /** 번들 프로필 아바타 (avatar-male-1 등) */
  avatar: AvatarId;
}

// ── 친구 10명 (기본) ──────────────────────────────────────────
// id = accountCode(seed) — deterministic 6자리 친구코드. code 컬럼은 표시용
// 흔적이지만 사용처 없음(friendSearch.toUser에서 code = a.id로 통일).
const BASE_FRIENDS_RAW: Array<Omit<MockAccount, 'id' | 'code'> & { _seed: string }> = [
  { _seed: 'fr1', nickname: '물개왕', status: '오늘도 1km 완영', avatar: 'avatar-male-1' },
  { _seed: 'fr2', nickname: '자유형장인', status: '접영 연습 중', avatar: 'avatar-female-1' },
  { _seed: 'fr3', nickname: 'josh', status: '수영 더 열심히', avatar: 'avatar-male-2' },
  { _seed: 'fr4', nickname: '새벽수영러', status: '아침 6시 고정', avatar: 'avatar-male-3' },
  { _seed: 'fr5', nickname: 'ally', status: '평영이 제일 좋아', avatar: 'avatar-female-2' },
  { _seed: 'fr6', nickname: '돌고래', status: '대회 준비 중 🏊', avatar: 'avatar-female-3' },
  { _seed: 'fr7', nickname: '버터플라이', status: '접영 200m 도전', avatar: 'avatar-male-4' },
  { _seed: 'fr8', nickname: 'danp', status: '주 5회 수영', avatar: 'avatar-male-5' },
  { _seed: 'fr9', nickname: '잠수왕', status: '숨 참기 2분', avatar: 'avatar-female-4' },
  { _seed: 'fr10', nickname: '수영바보', status: '수영장이 내 집', avatar: 'avatar-male-6' },
];
const BASE_FRIENDS: MockAccount[] = BASE_FRIENDS_RAW.map(({ _seed, ...rest }) => ({
  ...rest,
  id: accountCode(_seed),
  code: accountCode(_seed),
}));

// 사당문화회관 오버플로우 테스트용 친구 30명 — 전원 1개 슬롯 참여 →
// 참여자 "더보기" / 지도 "… more"(29 초과) 검증. 기존 GWANAK/RANGE
// 생성기엔 안 섞음(BASE_FRIENDS만 사용)이라 다른 화면 영향 없음.
const TEST_AVATAR_IDS: AvatarId[] = [
  'avatar-male-1', 'avatar-male-2', 'avatar-male-3',
  'avatar-male-4', 'avatar-male-5', 'avatar-male-6',
  'avatar-female-1', 'avatar-female-2', 'avatar-female-3',
  'avatar-female-4', 'avatar-female-5', 'avatar-female-6',
];
const SADANG_TEST_FRIENDS: MockAccount[] = Array.from({ length: 30 }, (_, i) => {
  const n = i + 11;
  const id = accountCode(`fr${n}`);
  return {
    id,
    nickname: `tester${n}`,
    status: '사당 13시 자유수영',
    code: id,
    avatar: TEST_AVATAR_IDS[i % TEST_AVATAR_IDS.length],
  };
});

export const MOCK_FRIENDS: MockAccount[] = [
  ...BASE_FRIENDS,
  ...SADANG_TEST_FRIENDS,
];

// ── 친구 아닌 계정 ──────────────────────────────────────────
// id = accountCode(seed). 'nf-id-7000234' seed의 accountCode 결과 그대로
// ID 검색용(이전 주석의 "ABCD2E" 값 — 결정적이라 변경 없음).
const NON_FRIENDS_RAW: Array<Omit<MockAccount, 'id' | 'code'> & { _seed: string }> = [
  { _seed: 'nf1', nickname: 'bobby', status: '수영 잘하고 싶다', avatar: 'avatar-male-2' },
  { _seed: 'nf2', nickname: '초보수영', status: '발차기 연습 중', avatar: 'avatar-male-5' },
  { _seed: 'nf3', nickname: 'clara', status: '물 무서워요', avatar: 'avatar-female-5' },
  { _seed: 'nf4', nickname: '주말수영', status: '주말에만 출몰', avatar: 'avatar-male-3' },
  { _seed: 'nf5', nickname: 'emma', status: '자유형 25m', avatar: 'avatar-female-6' },
  { _seed: 'nf6', nickname: '물방울', status: '수영 입문 1주차', avatar: 'avatar-female-2' },
  { _seed: 'nf7', nickname: 'frank', status: '레인 독차지 금지', avatar: 'avatar-male-6' },
  { _seed: 'nf8', nickname: '느림보', status: '천천히 오래', avatar: 'avatar-male-4' },
  { _seed: 'nf9', nickname: 'henry', status: '@henrymartinez', avatar: 'avatar-female-6' },
  { _seed: 'nf10', nickname: '인어공주', status: '바다 수영 좋아', avatar: 'avatar-female-3' },
  // ── 테스트용: 닉네임 'a' 검색용 ──
  { _seed: 'nf11', nickname: 'aaronl', status: '자유형 연습 중', avatar: 'avatar-male-1' },
  { _seed: 'nf12', nickname: 'maya', status: '초보 탈출 도전', avatar: 'avatar-female-1' },
  { _seed: 'nf13', nickname: 'hannah', status: '주말 수영러', avatar: 'avatar-female-2' },
  { _seed: 'nf14', nickname: 'liamp', status: '접영 배우는 중', avatar: 'avatar-male-2' },
  { _seed: 'nf15', nickname: 'sophia', status: '물과 친해지기', avatar: 'avatar-female-3' },
  { _seed: 'nf16', nickname: 'avaj', status: '아침 수영 좋아', avatar: 'avatar-female-4' },
  { _seed: 'nf17', nickname: 'nathan', status: '1km 도전', avatar: 'avatar-male-3' },
  { _seed: 'nf18', nickname: 'claray', status: '평영 연습', avatar: 'avatar-female-5' },
  { _seed: 'nf19', nickname: 'mason', status: '느긋하게 수영', avatar: 'avatar-male-4' },
  { _seed: 'nf20', nickname: 'diana', status: '수영 입문 2주차', avatar: 'avatar-female-6' },
  // ── 테스트용: ID 검색(정확 일치). accountCode('nf-id-7000234')="ABCD2E".
  //    ID 탭에 정확히 "ABCD2E" 입력해야 검색됨(부분일치 아님). ──
  { _seed: 'nf-id-7000234', nickname: 'idtest', status: 'ID 검색 테스트용', avatar: 'avatar-male-5' },
];
export const MOCK_NON_FRIENDS: MockAccount[] = NON_FRIENDS_RAW.map(({ _seed, ...rest }) => ({
  ...rest,
  id: accountCode(_seed),
  code: accountCode(_seed),
}));

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

export const MOCK_SCHEDULES: MySwimSchedule[] = Array.from({ length: 20 }, (_, i) => {
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

// 관악구민종합체육센터 (POOL_0001).
const GWANAK = { id: 'POOL_0001', name: '관악구민종합체육센터' };

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
  ...BASE_FRIENDS.map((u) => ({ ...u, isFriend: true })),
  ...MOCK_NON_FRIENDS.map((u) => ({ ...u, isFriend: false })),
];

// 친구·비친구 각각 가시성 분포 (필터 테스트용 — friends/private 섞음)
const FRIEND_VIS: ScheduleVisibility[] = [
  'public', 'friends', 'public', 'friends', 'private',
];
const NONFRIEND_VIS: ScheduleVisibility[] = [
  'public', 'public', 'public', 'friends', 'private',
];

// 20명 × 3 = 60 (성능: 과거 ×10=200에서 축소 — 참여자 데모엔 충분).
// 5/23·5/24 7개 슬롯에 분배 → 어느 슬롯이든 친구·비친구·가시성 섞임.
const BASE_OTHER_SCHEDULES: OtherSchedule[] = OTHER_USERS.flatMap(
  (u, ui) =>
    Array.from({ length: 3 }, (_, j) => {
      const slot = TEST_SLOTS[(ui + j) % TEST_SLOTS.length];
      const visibility = (u.isFriend ? FRIEND_VIS : NONFRIEND_VIS)[
        (ui + j) % 5
      ];
      return {
        id: `oth-${u.id}-${j + 1}`,
        userId: u.id,
        nickname: u.nickname,
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
const RANGE_5_17_5_30: OtherSchedule[] = Array.from({ length: 12 }, (_, i) => {
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
    nickname: u.nickname,
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
// 친구 10명 전원, 2026-05-18·19 관악구민(POOL_0001) 자유수영.
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
const GWANAK_24H_TEST: OtherSchedule[] = BASE_FRIENDS.flatMap((u, i) => {
  const visibility: ScheduleVisibility =
    i % 5 === 4 ? 'private' : i % 2 === 0 ? 'public' : 'friends';
  const t18 = MAP_STACK_TEST_TIMES[i % MAP_STACK_TEST_TIMES.length];
  const t19 = MAP_STACK_TEST_TIMES[(i + 3) % MAP_STACK_TEST_TIMES.length];
  const base = {
    userId: u.id,
    nickname: u.nickname,
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

// ── 사당문화회관 오버플로우 테스트 (사용자 요청) ───────────────
// 친구 30명 전원, 2026-05-18(월) 13:00~13:50 사당문화회관(POOL_0002)
// 자유수영 슬롯에 참여(가시성 public). 월 13:00 슬롯 = 13:00~13:50
// (migration 0029 — by_day "월", 평일 슬롯. 토 13:00~14:50과 다름).
// 같은 슬롯에 내가 등록하면 30명이 참여자로 잡혀 "더보기"/스택
// "… more"(29 초과) 검증 가능. 05-18은 오늘 → 기기 시계가 13:00
// 이전이면 지도 스택(24h 내 진행예정)에도 떠서 "… more"까지 확인됨.
const SADANG_0518: OtherSchedule[] = SADANG_TEST_FRIENDS.map((u) => ({
  id: `oth-sadang-${u.id}`,
  userId: u.id,
  nickname: u.nickname,
  avatar: u.avatar,
  isFriend: true,
  poolId: 'POOL_SEOUL_0006',
  poolName: '사당문화회관',
  date: '2026-05-18',
  start: '13:00',
  end: '13:50',
  visibility: 'public',
}));

export const MOCK_OTHER_SCHEDULES: OtherSchedule[] = [
  ...BASE_OTHER_SCHEDULES,
  ...RANGE_5_17_5_30,
  ...GWANAK_24H_TEST,
  ...SADANG_0518,
];

// ── 친구 수영 레슨 (Phase-1 mock) ──────────────────────────────
// 주간 반복 레슨(요일+시간). 레슨 받는 수영장 1곳. 공개(visibility
// 'public')일 때만 지도 stack 노출 — showSwimClasses 토글에 대응.
// 서버 친구 레슨 적재는 Phase-2 갭. 노출/차단은 useFriends 경유
// (mapProfileStacks). 관악구민(POOL_SEOUL_0005)에 요일 분산 배치 —
// 테스트 요일 무관 일부가 24h 창에 들어오게.
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
const LESSON_DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];
const LESSON_SLOTS: { start: string; end: string }[] = [
  { start: '06:00', end: '07:00' },
  { start: '10:00', end: '11:00' },
  { start: '14:00', end: '15:00' },
  { start: '19:00', end: '20:00' },
];
export const MOCK_OTHER_LESSONS: OtherLesson[] = BASE_FRIENDS.map((u, i) => {
  // idx%4===3 한 명꼴 private(stack 제외 검증). 나머지 public.
  const visibility: ScheduleVisibility = i % 4 === 3 ? 'private' : 'public';
  const day = LESSON_DAYS[i % LESSON_DAYS.length];
  const slot = LESSON_SLOTS[i % LESSON_SLOTS.length];
  return {
    id: `oth-lesson-${u.id}`,
    userId: u.id,
    nickname: u.nickname,
    avatar: u.avatar,
    isFriend: true,
    poolId: GWANAK.id,
    poolName: GWANAK.name,
    day,
    start: slot.start,
    end: slot.end,
    visibility,
  };
});
