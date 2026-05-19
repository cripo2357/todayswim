// 약관 콘텐츠 단일 출처 — Figma 101:3833 "약관 상세보기" 템플릿이
// 이 메타를 termsKey로 받아 정보만 교체해 5개 약관 화면을 모두 커버.
//
// ⚠️ 본문은 전부 임시 더미. 실제 약관 문구 확정 시 여기 sections만 교체하면
//    화면/네비 변경 없이 5개 모두 반영됨(곧 교체 예정 — 사용자 확정).
//
// 개인정보 약관은 2종: privacyConsent(가입용 동의) / privacyPolicy(가입후
// 조회용 처리방침). 온보딩 게이트(lib/terms)는 service + privacyConsent.

export type TermsKey =
  | 'service'
  | 'privacyConsent'
  | 'privacyPolicy'
  | 'location'
  | 'marketing';

export interface TermsSection {
  title: string;
  body: string;
}
export interface TermsMeta {
  /** 상세 화면 제목 (Heading sm/Bold 30) */
  title: string;
  /** 버전 배지 */
  version: string;
  /** 발효일 표기 */
  effectiveDate: string;
  sections: TermsSection[];
}

const VERSION = 'v1.0.0';
const EFFECTIVE = '2026년 11월 23일';
// 실제 문구 미확정 표식 — 더미임을 화면에서도 인지 가능하게.
const DUMMY_NOTE = '(임시 더미 문구 — 실제 약관으로 교체 예정)';

export const TERMS_META: Record<TermsKey, TermsMeta> = {
  service: {
    title: '서비스 이용약관',
    version: VERSION,
    effectiveDate: EFFECTIVE,
    sections: [
      {
        title: '1. 목적',
        body:
          `${DUMMY_NOTE}\n` +
          `본 약관은 Pool's Day(이하 "서비스")의 이용 조건 및 절차, 이용자와 ` +
          `서비스의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.`,
      },
      {
        title: '2. 서비스의 제공',
        body:
          `서비스는 수영장 정보·자유수영 시간표·지도 및 일정 관리 기능을 ` +
          `제공합니다.\n서비스 내용은 운영상·기술상 필요에 따라 변경될 수 있으며, ` +
          `변경 시 앱 내 공지를 통해 안내합니다.`,
      },
      {
        title: '3. 이용자의 의무',
        body:
          `이용자는 관계 법령, 본 약관의 규정을 준수해야 하며, 타인의 권리나 ` +
          `명예를 침해하는 행위를 하여서는 안 됩니다.`,
      },
      {
        title: '4. 약관의 변경',
        body: '본 약관은 변경될 수 있으며 변경 시 앱 내 공지를 통해 안내드립니다.',
      },
    ],
  },

  privacyConsent: {
    title: '개인정보 수집·이용 동의',
    version: VERSION,
    effectiveDate: EFFECTIVE,
    sections: [
      {
        title: '1. 수집하는 개인정보 항목',
        body:
          `${DUMMY_NOTE}\n` +
          `필수 항목: 이메일 주소, 닉네임, 소셜 로그인 제공자(Google/Apple/` +
          `Kakao) 식별자\n자동 수집 항목: 단말 정보(OS·기기 모델), 앱 버전, ` +
          `서비스 이용 기록`,
      },
      {
        title: '2. 수집·이용 목적',
        body:
          `회원 식별 및 로그인 유지\n근거리 수영장 추천 및 지도 표시\n` +
          `자유수영 시간표·시설 정보 제공\n서비스 개선을 위한 통계 분석`,
      },
      {
        title: '3. 보유·이용 기간',
        body:
          `회원 탈퇴 시까지 보유하며 탈퇴 즉시 파기합니다.\n` +
          `법령에 의해 보존이 필요한 경우 해당 기간 동안 별도 보관합니다.`,
      },
      {
        title: '4. 동의 거부 권리',
        body:
          `귀하는 동의를 거부할 권리가 있으나, 필수 항목 미동의 시 회원가입 및 ` +
          `서비스 이용이 제한됩니다.`,
      },
    ],
  },

  privacyPolicy: {
    title: '개인정보 처리방침',
    version: VERSION,
    effectiveDate: EFFECTIVE,
    sections: [
      {
        title: '1. 총칙',
        body:
          `${DUMMY_NOTE}\n` +
          `Pool's Day는 이용자의 개인정보를 중요시하며 관련 법령을 준수합니다. ` +
          `본 방침은 회원의 개인정보가 어떻게 이용·보호되는지 안내합니다.`,
      },
      {
        title: '2. 개인정보의 제3자 제공',
        body:
          `회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. ` +
          `다만 법령에 근거가 있거나 수사기관의 적법한 요청이 있는 경우는 ` +
          `예외로 합니다.`,
      },
      {
        title: '3. 개인정보의 파기',
        body:
          `보유 기간 경과 또는 처리 목적 달성 시 지체 없이 파기하며, ` +
          `전자적 파일은 복구 불가능한 방법으로 삭제합니다.`,
      },
      {
        title: '4. 이용자의 권리',
        body:
          `이용자는 언제든지 본인 정보의 열람·정정·삭제·처리정지를 요구할 수 ` +
          `있으며, 앱 내 [설정 > 계정] 에서 처리하거나 고객센터로 요청할 수 ` +
          `있습니다.`,
      },
      {
        title: '5. 개인정보 보호책임자',
        body: '문의: privacy@poolsday.app',
      },
    ],
  },

  location: {
    title: '위치기반서비스 이용약관',
    version: VERSION,
    effectiveDate: EFFECTIVE,
    sections: [
      {
        title: '1. 목적',
        body:
          `${DUMMY_NOTE}\n` +
          `본 약관은 위치정보를 이용한 근거리 수영장 검색·지도 표시 등 ` +
          `위치기반서비스 이용에 관한 사항을 규정합니다.`,
      },
      {
        title: '2. 위치정보의 이용',
        body:
          `현재 위치 주변 수영장 추천 및 지도 중심 이동에만 사용하며, ` +
          `위치정보는 서버에 별도 저장하지 않습니다.`,
      },
      {
        title: '3. 권한 철회',
        body:
          `이용자는 단말의 위치 권한을 언제든지 해제할 수 있으며, ` +
          `해제 시 위치기반 기능이 제한됩니다.`,
      },
    ],
  },

  marketing: {
    title: '마케팅 정보 수신 동의',
    version: VERSION,
    effectiveDate: EFFECTIVE,
    sections: [
      {
        title: '1. 수신 동의 항목',
        body:
          `${DUMMY_NOTE}\n` +
          `이벤트·혜택·신규 기능 안내 등 마케팅 정보를 앱 푸시 알림으로 ` +
          `발송합니다.`,
      },
      {
        title: '2. 선택 동의',
        body:
          `본 동의는 선택 사항이며, 미동의 시에도 서비스의 필수 기능 이용에는 ` +
          `제한이 없습니다.`,
      },
      {
        title: '3. 동의 철회',
        body:
          `[설정 > 알림] 또는 고객센터를 통해 언제든지 수신 동의를 철회할 수 ` +
          `있습니다.`,
      },
    ],
  },
};
