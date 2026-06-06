// 타인 프로필 상세 — 서버 profiles fetch → OtherProfile 매핑.
//
// (2026-06-05) P3에서 mock 소스 제거 후 getOtherProfile이 항상 null이라 모든
// 타인 프로필이 "조회 불가" 에러였음. profiles 테이블 실데이터로 교체.
//  · nickname/bio/avatar/자격증/영법/IM100/공개설정 = profiles 컬럼
//  · serviceDays = created_at 기준 경과일, friendCount = friendships 카운트
//  · weeklyAvgHours = 기록 백엔드 미연동이라 null(게이트 '—')

import { useQuery } from '@tanstack/react-query';
import {
  tryFetchOtherProfile,
  tryCountFriendsOf,
} from '@/lib/friendsSync';
import type { OtherProfile } from '@/lib/otherProfile';

const DAY_MS = 24 * 60 * 60 * 1000;

export function useOtherProfile(userId: string): {
  profile: OtherProfile | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ['otherProfile', userId],
    queryFn: async (): Promise<OtherProfile | null> => {
      const row = await tryFetchOtherProfile(userId);
      if (!row) return null;
      const friendCount = await tryCountFriendsOf(userId);

      const created = Date.parse(row.created_at);
      const serviceDays = Number.isFinite(created)
        ? Math.max(0, Math.floor((Date.now() - created) / DAY_MS))
        : 0;
      // 번들 AvatarId 또는 업로드 사진 uri 그대로 통과(렌더 측 가드 분기).
      // null 일 때만 기본 폴백 — URI 를 버리면 업로드 사진이 기본으로 잘못 보임.
      const avatar = row.photo_uri ?? 'avatar-male-1';

      return {
        id: row.id,
        nickname: row.nickname,
        bio: row.bio ?? '',
        avatar,
        certifications: row.certifications ?? [],
        im100: row.im100_record ?? undefined,
        strokes: row.strokes ?? [],
        serviceDays,
        serviceYears: Math.floor(serviceDays / 365),
        weeklyAvgHours: null, // 기록 백엔드 미연동 — '—' 표시
        friendCount,
        showServiceYears: row.show_service_years,
        showStrokes: row.show_strokes,
        showCerts: row.show_certs,
        showIm100: row.show_im100,
      };
    },
    enabled: !!userId,
  });

  return { profile: data ?? null, isLoading };
}
