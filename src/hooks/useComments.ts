import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/lib/types';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export function useComments(noticeId: string) {
  const queryClient = useQueryClient();

  const { data: comments, isLoading, error } = useQuery({
    queryKey: ['comments', noticeId],
    queryFn: async () => {
      // Fetch all comments for this notice
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('notice_id', noticeId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch author profiles for each comment
      const commentsWithAuthors = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: author } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', comment.user_id)
            .single();
          return { ...comment, author } as Comment;
        })
      );

      // Build nested comment structure
      const commentMap = new Map<string, Comment>();
      const rootComments: Comment[] = [];

      commentsWithAuthors.forEach((comment) => {
        comment.replies = [];
        commentMap.set(comment.id, comment);
      });

      commentsWithAuthors.forEach((comment) => {
        if (comment.parent_id) {
          const parent = commentMap.get(comment.parent_id);
          if (parent) {
            parent.replies = parent.replies || [];
            parent.replies.push(comment);
          }
        } else {
          rootComments.push(comment);
        }
      });

      return rootComments;
    },
    enabled: !!noticeId,
  });

  // Real-time subscription for comments
  useEffect(() => {
    if (!noticeId) return;

    const channel = supabase
      .channel(`comments-${noticeId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `notice_id=eq.${noticeId}`,
        },
        (payload) => {
          console.log('Comment change:', payload);
          queryClient.invalidateQueries({ queryKey: ['comments', noticeId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [noticeId, queryClient]);

  return { comments: comments || [], isLoading, error };
}

export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      noticeId,
      content,
      parentId,
    }: {
      noticeId: string;
      content: string;
      parentId?: string | null;
    }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          notice_id: noticeId,
          user_id: session.session.user.id,
          content,
          parent_id: parentId || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.noticeId] });
      toast({
        title: variables.parentId ? 'Reply posted' : 'Comment posted',
        description: 'Your comment has been added.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, noticeId }: { commentId: string; noticeId: string }) => {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['comments', variables.noticeId] });
      toast({
        title: 'Comment deleted',
        description: 'The comment has been removed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}