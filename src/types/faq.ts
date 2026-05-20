// 자주 묻는 질문(FAQ) — Figma 239:3560. 시드/스키마는 0071_faqs.sql.
// sort_order 오름차순으로 노출. 단일 오픈 아코디언으로 1개씩만 펼침.

export interface Faq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}
