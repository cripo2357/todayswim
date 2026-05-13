// Supabase에서 공지사항 fetch — published_at 내림차순.
// usePools와 동일 패턴: snake_case row → camelCase TS 매핑.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Announcement, AnnouncementType } from '@/types/announcement';

interface AnnouncementRow {
  id: string;
  type: AnnouncementType;
  title: string;
  body: string;
  bullets: string[] | null;
  button_label: string | null;
  button_url: string | null;
  published_at: string;
}

function rowToAnnouncement(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    bullets: row.bullets,
    buttonLabel: row.button_label,
    buttonUrl: row.button_url,
    publishedAt: row.published_at,
  };
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ['announcements'],
    queryFn: async (): Promise<Announcement[]> => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) throw error;
      return (data as AnnouncementRow[]).map(rowToAnnouncement);
    },
  });
}
