/**
 * 네비게이션 파라미터 타입.
 * SPEC.md §6 화면구성과 1:1 매칭.
 */
import type { TermsKey } from '@/lib/termsContent';

export type RootStackParamList = {
  Splash: undefined;
  MapMain: undefined;

  // 인증·약관·프로필 흐름 (Splash 직후 게이트)
  Login: undefined;
  TermsAgreement: undefined;
  // 단일 약관 상세 템플릿 — termsKey 로 5개 약관 커버 (Figma 101:3833)
  TermsDetail: { termsKey: TermsKey };
  ProfileSetup: undefined;
  // 가입 마지막 단계 전용 (완료→Welcome). 내 정보 수정은 이 화면을 쓰지 않음.
  ProfileImage: undefined;
  Welcome: undefined;

  // 내 정보 (로그인 계정) — 3탭: 프로필 / 달력 / 사람들
  MyInfo: undefined;

  // 설정 (내 정보 상단 우측 톱니 → 진입). Figma 129:5245
  Settings: undefined;

  // 지도 시작 위치 (설정 > 지도 > 지도 시작 위치). Figma 179:4805
  MapStartLocation: undefined;

  // 알림 설정 (설정 > 알림 > 알림 설정). Figma 129:5998 — 마스터 토글
  // (카테고리별 토글은 스펙 §1191 잔여 작업).
  NotificationSettings: undefined;

  // 프로필 (설정 > 프로필 → 진입). Figma 117:2556 — 기능은 MyInfo 프로필 탭과 동일
  Profile: undefined;

  // 수영 수업 시간 등록 (프로필 > 수영 수업 > 수업 시간 추가). Figma 90:6622
  SwimClassRegister: undefined;

  // 다른 사용자 프로필 (다양한 화면에서 사용자 아바타/이름 탭 → 진입).
  // Figma 172:9735/11530/12010/10725 — dim 모달 카드. 4상태+차단/삭제.
  OtherUserProfile: { userId: string };

  // 친구 초대 (일정 확정 → 초대 대상만 추가). Figma 150:8692 / 154:3850 / 129:3779
  InviteFriends: {
    poolId: string;
    poolName: string;
    poolPhotoUrl?: string;
    date: string; // YYYY-MM-DD
    start: string; // HH:MM
    end: string; // HH:MM — 슬롯 매칭(이미 참여 친구 제외)용
  };
  InviteDone: { count: number };

  // 자유수영 시간표 조회 (조회 전용 — 사용자 작성/수정 요청 기능 없음)
  ScheduleView: { poolId: string };

  // 수영장 등록·수정
  PoolName: { mode: 'create' | 'edit'; poolId?: string };
  PoolDone: { mode: 'create' | 'edit' };

  // 공지사항 (설정 > 공지사항 → 진입). 구 '부가 기능(More)' 화면은 제거됨 —
  // 기능은 모두 설정으로 이관(수영장 추가/수정 요청·공지사항·의견 메일).
  Announcements: undefined;

  // 수영장 검색 필터
  PoolFilter: undefined;

  // 수영장 목록 (지도에 보이는 풀 + 필터 적용분, 거리/이름 정렬)
  PoolList: undefined;

  // 즐겨찾는 수영장 (설정 > 즐겨찾는 수영장 — 수영장 목록과 분리). Figma 169:6312
  FavoritePools: undefined;

  // 상태 / 오류 / 점검 / 강제 업데이트 화면 (Figma 77:1064/77:1388/77:1462/77:1636).
  // - ErrorNotFound: deep link 매칭 실패 fallback (App.tsx linking.getStateFromPath).
  // - ErrorNoInternet: OfflineGate가 NetInfo로 감지 후 reset.
  // - Maintenance / AppUpdateRequired: Splash 부팅 게이트가 Supabase app_status fetch 후 reset.
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
