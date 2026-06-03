// Figma 110:4477 — 성별 입력 바텀시트. 남성/여성 단일 선택.
// 가입(ProfileSetup)·내 정보(MyInfo) 공용.
// "목록 단일선택" 공통 컴포넌트(@/components/ui/OptionSheet) 재사용 —
// 이 파일은 성별 옵션 정의 + 기존 호출부 API 유지용 얇은 래퍼.

import { OptionSheet, type Option } from '@/components/ui/OptionSheet';
import type { Gender } from '@/store/profile';

interface Props {
  visible: boolean;
  value: Gender | null;
  onConfirm: (g: Gender) => void;
  onClose: () => void;
}

const GENDER_OPTIONS: Option<Gender>[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

export function GenderSheet({ visible, value, onConfirm, onClose }: Props) {
  return (
    <OptionSheet<Gender>
      visible={visible}
      onClose={onClose}
      title="성별"
      options={GENDER_OPTIONS}
      value={value}
      onConfirm={onConfirm}
      commitOnClose
    />
  );
}
