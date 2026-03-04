import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function useNoticeLikes(noticeId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: likesCount = 0 } = useQuery({
    queryKey: ['notice-likes-count', noticeId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notice_likes')
        .select('*', { count: 'exact', head: true })
        .eq('notice_id', noticeId);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!noticeId,
  });

  const { data: isLiked = false } = useQuery({
    queryKey: ['notice-liked', noticeId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase
        .from('notice_likes')
        .select('id')
        .eq('notice_id', noticeId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!noticeId && !!user,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Must be logged in');
      if (isLiked) {
        const { error } = await supabase
          .from('notice_likes')
          .delete()
          .eq('notice_id', noticeId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notice_likes')
          .insert({ notice_id: noticeId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice-likes-count', noticeId] });
      queryClient.invalidateQueries({ queryKey: ['notice-liked', noticeId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { likesCount, isLiked, toggleLike };
}
