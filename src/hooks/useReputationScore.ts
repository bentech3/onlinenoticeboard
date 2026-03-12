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
      const helpful = (data || []).filter((f: { tag: string }) => f.tag === 'helpful').length;
      const complaints = (data || []).filter((f: { tag: string }) => ['complaint', 'unhelpful', 'confusing'].includes(f.tag)).length;
      return { helpful, complaints };
    },
    enabled: !!noticeId,
  });

  return useMemo(() => {
    // Enhanced Score formula: views(1x) + likes(5x) + comments(3x) + helpful(3x) - complaints(8x)
    // Differentiates high-quality institutional content from noise
    const baseScore = likesCount * 5 + commentsCount * 3 + feedbackData.helpful * 3 - feedbackData.complaints * 8;
    
    // Add engagement density bonus (helpful feedback per views) - simplified representation
    const totalEngagements = likesCount + commentsCount + feedbackData.helpful;
    const score = baseScore + (totalEngagements > 0 ? Math.floor(totalEngagements / 2) : 0);

    const tier = score >= 30 ? 'high' : score >= 10 ? 'medium' : 'low';
    return { score: Math.max(0, score), tier, likesCount, commentsCount, ...feedbackData };
  }, [likesCount, commentsCount, feedbackData]);
}

export function useNoticeReputation(viewCount: number, noticeId: string) {
  const rep = useReputationScore(noticeId);
  const totalScore = rep.score + Math.floor(viewCount / 10);
  const tier = totalScore >= 20 ? 'high' : totalScore >= 5 ? 'medium' : 'low';
  return { ...rep, totalScore, tier };
}
