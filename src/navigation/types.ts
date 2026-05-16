/**
 * 네비게이션 파라미터 타입.
 * SPEC.md §6 화면구성과 1:1 매칭.
 */
export type RootStackParamList = {
  Splash: undefined;
  MapMain: undefined;

  // 인증·약관·프로필 흐름 (Splash 직후 게이트)
  Login: undefined;
  TermsAgreement: undefined;
  TermsService: undefined;
  TermsPrivacy: undefined;
  ProfileSetup: undefined;
  // 가입 마지막 단계 전용 (완료→Welcome). 내 정보 수정은 이 화면을 쓰지 않음.
  ProfileImage: undefined;
  Welcome: undefined;

  // 내 정보 (로그인 계정) — 3탭: 프로필 / 달력 / 사람들
  MyInfo: undefined;

  // 설정 (내 정보 상단 우측 톱니 → 진입). Figma 129:5245
  Settings: undefined;

  // 프로필 (설정 > 프로필 → 진입). Figma 117:2556 — 기능은 MyInfo 프로필 탭과 동일
  Profile: undefined;

  // 친구 초대 (일정 확정 → 초대 대상만 추가). Figma 150:8692 / 154:3850 / 129:3779
  InviteFriends: {
    poolName: string;
    poolPhotoUrl?: string;
    date: string; // YYYY-MM-DD
    start: string; // HH:MM
  };
  InviteDone: { count: number };

  // 자유수영 시간표 조회 (조회 전용 — 사용자 작성/수정 요청 기능 없음)
  ScheduleView: { poolId: string };

  // 수영장 등록·수정
  PoolName: { mode: 'create' | 'edit'; poolId?: string };
  PoolDone: { mode: 'create' | 'edit' };

  // 부가 기능
  More: undefined;
  Announcements: undefined;

  // 수영장 검색 필터
  PoolFilter: undefined;

  // 수영장 목록 (지도에 보이는 풀 + 필터 적용분, 거리/이름 정렬)
  PoolList: undefined;

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
