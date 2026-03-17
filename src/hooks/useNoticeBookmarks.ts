import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Notice } from '@/lib/types';

export function useNoticeBookmarks(noticeId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: isBookmarked = false } = useQuery({
    queryKey: ['notice-bookmarked', noticeId, user?.id],
    queryFn: async () => {
      if (!user || !noticeId) return false;
      const { data, error } = await supabase
        .from('notice_bookmarks')
        .select('id')
        .eq('notice_id', noticeId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
    enabled: !!noticeId && !!user,
  });

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!user || !noticeId) throw new Error('Must be logged in');
      if (isBookmarked) {
        const { error } = await supabase
          .from('notice_bookmarks')
          .delete()
          .eq('notice_id', noticeId)
          .eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notice_bookmarks')
          .insert({ notice_id: noticeId, user_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice-bookmarked', noticeId] });
      queryClient.invalidateQueries({ queryKey: ['bookmarked-notices'] });
      toast({
        title: isBookmarked ? 'Bookmark removed' : 'Notice saved',
        description: isBookmarked ? 'Removed from your saved notices' : 'Added to your saved notices',
      });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return { isBookmarked, toggleBookmark };
}

export function useBookmarkedNotices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['bookmarked-notices', user?.id],
    queryFn: async () => {
      if (!user) return [] as Notice[];
      const { data, error } = await supabase
        .from('notice_bookmarks')
        .select(`
          id,
          created_at,
          notice:notices(
            *,
            department:departments(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((b) => b.notice).filter(Boolean) as unknown as Notice[];
    },
    enabled: !!user,
  });
}
