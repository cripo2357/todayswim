// 다른 사용자 프로필 데이터.
//
// (P3 prod, 2026-06-02): mock 계정/일정 소스 제거 — 타인 프로필 상세를 채울
// 서버 백엔드(자격증·IM100·주평균 등)는 미구현이라 후보 풀은 비어 있다.
// getOtherProfile 은 항상 null, upcomingSchedulesFor 는 [] 를 반환한다.
// 결정적 생성 로직은 서버 prefs/records 연동 시 교체할 수 있도록 유지.

import type { MockAccount, OtherSchedule } from '@/lib/mockData';

const ALL_ACCOUNTS: MockAccount[] = [];

/** id → 안정적 정수 해시 */
function hash(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const CERT_POOL = ['생활스포츠지도사 2급', '생활스포츠지도사 1급', '수상인명구조원'];
const IM100_POOL = ['IM 100 2분 이내', 'IM 100 1분 50초 이내', 'IM 100 1분 40초 이내'];
const STROKE_POOL = ['자유형', '평영', '배영', '접영'];

export interface OtherProfile {
  id: string;
  nickname: string;
  bio: string; // 한 줄 자기소개(status 재사용)
  avatar: MockAccount['avatar'];
  certifications: string[]; // 자격증
  im100?: string; // IM 100 기록
  strokes: string[]; // 가능 영법(자격증·IM100 둘 다 없을 때 노출)
  serviceDays: number; // 서비스 이용 일수
  serviceYears: number; // 수영 기간(년) — floor
  /** 주 평균 수영시간(H, 소수1). 가입 32일 미만이면 null(게이트). */
  weeklyAvgHours: number | null;
  friendCount: number; // 수영 친구 수
  // 항목별 공개여부 (소유자 설정 — Figma 117:2556). 공개일 때만 노출.
  // Phase1: 목업 사용자는 결정적 해시로 시뮬레이션(실서비스=백엔드 prefs).
  showServiceYears: boolean;
  showStrokes: boolean;
  showCerts: boolean;
  showIm100: boolean;
}

/**
 * 주 평균 수영시간 계산(스펙):
 *  지난 한 달(30일)의 총 수영시간을 일수로 나눠 하루 평균을 구하고
 *  ×7 → 주 평균, 소수 1자리. 수영 시간 = 평균 수영 수업시간 + 자유수영
 *  완료 기록 합산. 단, 가입 후 32일이 지나야 노출(미만이면 null).
 *
 * Phase1 목업: 실제 기록 테이블이 없어 id 해시로 결정적인 "지난 30일
 * 총 분"을 만들어 동일 공식을 적용한다(실서비스 시 records 인자로 교체).
 */
function weeklyAvgHours(id: string, serviceDays: number): number | null {
  if (serviceDays < 32) return null; // 32일 게이트
  // 결정적 더미: 주 2~6회 × 50~110분 (수업 + 자유수영 완료 합산 가정)
  const sessionsPerWeek = 2 + (hash(id + 's') % 5); // 2~6
  const minutesPerSession = 50 + (hash(id + 'm') % 61); // 50~110
  const last30Min = (sessionsPerWeek * minutesPerSession * 30) / 7;
  const dailyAvgMin = last30Min / 30;
  const weeklyMin = dailyAvgMin * 7;
  return Math.round((weeklyMin / 60) * 10) / 10; // 시간, 소수1
}

export function getOtherProfile(userId: string): OtherProfile | null {
  const acc = ALL_ACCOUNTS.find((a) => a.id === userId);
  if (!acc) return null;
  const h = hash(userId);

  // 결정적 자격증/IM100/영법 분포
  const certCount = h % 3; // 0~2개
  const certifications = CERT_POOL.slice(0, certCount);
  const hasIm100 = (h >> 2) % 2 === 0;
  const im100 = hasIm100 ? IM100_POOL[(h >> 3) % IM100_POOL.length] : undefined;
  const strokeCount = 1 + ((h >> 4) % 3); // 1~3개
  const strokes = STROKE_POOL.slice(0, strokeCount);

  // 가입일: 대부분 오래전, 일부(해시 0)는 32일 미만(게이트 테스트)
  const serviceDays = (h % 7 === 0) ? 5 + (h % 20) : 60 + (h % 1400);
  const serviceYears = Math.floor(serviceDays / 365);
  const friendCount = 30 + (h % 12970);

  // 결정적 공개여부 (대체로 공개, 일부 비공개 — Phase1 시뮬레이션)
  const showServiceYears = hash(userId + 'vy') % 4 !== 0;
  const showStrokes = hash(userId + 'vs') % 5 !== 0;
  const showCerts = hash(userId + 'vc') % 3 === 0;
  const showIm100 = hash(userId + 'vi') % 4 !== 0;

  return {
    id: acc.id,
    nickname: acc.nickname,
    bio: acc.status,
    avatar: acc.avatar,
    certifications,
    im100,
    strokes,
    serviceDays,
    serviceYears,
    weeklyAvgHours: weeklyAvgHours(userId, serviceDays),
    friendCount,
    showServiceYears,
    showStrokes,
    showCerts,
    showIm100,
  };
}

/**
 * 프로필 라벨 칩: 자격증 또는 IM100 기록이 있으면 그것들을, 둘 다 없으면
 * 가능 영법을 노출(스펙).
 */
export function profileLabels(p: OtherProfile): string[] {
  // 공개 설정된 것만 노출
  const certs = p.showCerts ? p.certifications : [];
  const im100 = p.showIm100 ? p.im100 : undefined;
  if (certs.length > 0 || im100) {
    return [...certs, ...(im100 ? [im100] : [])];
  }
  return p.showStrokes ? p.strokes : [];
}

/** "주 X.XH" — 게이트면 "—" */
export function formatWeeklyAvg(p: OtherProfile): string {
  return p.weeklyAvgHours == null ? '—' : `주 ${p.weeklyAvgHours.toFixed(1)}H`;
}

/** YYYY-MM-DD 로컬 오늘 */
function todayYmd(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/**
 * 해당 사용자의 예정 수영 일정 — 비공개 제외, 오늘 이후, 슬롯 중복 제거.
 * (관계 무관 public, 친구면 friends도 표시.)
 */
export function upcomingSchedulesFor(
  userId: string,
  isFriend: boolean,
): OtherSchedule[] {
  const today = todayYmd();
  const seen = new Set<string>();
  const source: OtherSchedule[] = []; // P3 prod: 서버 일정 소스 미연동 — 빈 배열.
  return source.filter((o) => {
    if (o.userId !== userId) return false;
    if (o.visibility === 'private') return false;
    if (o.visibility === 'friends' && !isFriend) return false;
    if (o.date < today) return false;
    const k = `${o.poolId}|${o.date}|${o.start}|${o.end}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  }).sort(
    (a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start),
  );
}
