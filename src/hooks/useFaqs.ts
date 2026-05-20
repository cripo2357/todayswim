// Supabase에서 FAQ fetch — sort_order 오름차순.
// useAnnouncements 와 동일 패턴: snake_case row → camelCase TS 매핑.

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Faq } from '@/types/faq';

interface FaqRow {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

function rowToFaq(row: FaqRow): Faq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
  };
}

export function useFaqs() {
  return useQuery({
    queryKey: ['faqs'],
    queryFn: async (): Promise<Faq[]> => {
      const { data, error } = await supabase
        .from('faqs')
        .select('id, question, answer, sort_order')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data as FaqRow[]).map(rowToFaq);
    },
  });
}
