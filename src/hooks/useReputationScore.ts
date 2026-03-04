import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useReputationScore(noticeId: string) {
  const { data: likesCount = 0 } = useQuery({
    queryKey: ['notice-likes-count', noticeId],
    queryFn: async () => {
      const { count } = await supabase
        .from('notice_likes')
        .select('*', { count: 'exact', head: true })
        .eq('notice_id', noticeId);
      return count || 0;
    },
    enabled: !!noticeId,
  });

  const { data: commentsCount = 0 } = useQuery({
    queryKey: ['notice-comments-count', noticeId],
    queryFn: async () => {
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('notice_id', noticeId);
      return count || 0;
    },
    enabled: !!noticeId,
  });

  const { data: feedbackData = { helpful: 0, complaints: 0 } } = useQuery({
    queryKey: ['notice-feedback-summary', noticeId],
    queryFn: async () => {
      const { data } = await supabase
        .from('notice_feedback')
        .select('tag')
        .eq('notice_id', noticeId);
      const helpful = (data || []).filter((f: any) => f.tag === 'helpful').length;
      const complaints = (data || []).filter((f: any) => ['complaint', 'unhelpful', 'confusing'].includes(f.tag)).length;
      return { helpful, complaints };
    },
    enabled: !!noticeId,
  });

  return useMemo(() => {
    // Score formula: views(1x) + likes(3x) + comments(2x) + helpful(2x) - complaints(3x)
    const score = likesCount * 3 + commentsCount * 2 + feedbackData.helpful * 2 - feedbackData.complaints * 3;
    const tier = score >= 20 ? 'high' : score >= 5 ? 'medium' : 'low';
    return { score: Math.max(0, score), tier, likesCount, commentsCount, ...feedbackData };
  }, [likesCount, commentsCount, feedbackData]);
}

export function useNoticeReputation(viewCount: number, noticeId: string) {
  const rep = useReputationScore(noticeId);
  const totalScore = rep.score + Math.floor(viewCount / 10);
  const tier = totalScore >= 20 ? 'high' : totalScore >= 5 ? 'medium' : 'low';
  return { ...rep, totalScore, tier };
}
