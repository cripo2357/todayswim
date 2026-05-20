// 자주 묻는 질문(FAQ) — Figma 239:3560. 시드/스키마는 0071·0072·0073.
// 4그룹 탭 필터(Figma 245:5819) — 영문 enum, 라벨은 UI 매핑.

export type FaqCategory = 'first' | 'info' | 'activity' | 'settings';

export const FAQ_CATEGORY_LABEL: Record<FaqCategory, string> = {
  first: '처음',
  info: '정보',
  activity: '일정',
  settings: '설정',
};

export const FAQ_CATEGORIES: FaqCategory[] = ['first', 'info', 'activity', 'settings'];

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  category: FaqCategory;
}
