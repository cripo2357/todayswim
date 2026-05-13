// 공지사항 4종 — Figma 75:1536. 유형별 아이콘은 AnnouncementsScreen에서 매핑.
export type AnnouncementType = 'new_feature' | 'feature_update' | 'info_update' | 'event';

export interface Announcement {
  id: string;
  type: AnnouncementType;
  title: string;
  body: string;
  bullets: string[] | null;        // null이면 글머리 항목 미표시
  buttonLabel: string | null;      // 이벤트 CTA — buttonUrl과 함께 NOT NULL일 때만 렌더
  buttonUrl: string | null;
  publishedAt: string;             // ISO timestamp (DB 컬럼: published_at)
}
