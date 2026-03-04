import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, AlertCircle, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const FEEDBACK_OPTIONS = [
  { tag: 'helpful', label: 'Helpful', icon: ThumbsUp, color: 'text-success' },
  { tag: 'unhelpful', label: 'Unhelpful', icon: ThumbsDown, color: 'text-warning' },
  { tag: 'confusing', label: 'Confusing', icon: HelpCircle, color: 'text-info' },
  { tag: 'complaint', label: 'Complaint', icon: AlertCircle, color: 'text-destructive' },
] as const;

interface NoticeFeedbackProps {
  noticeId: string;
}

export function NoticeFeedback({ noticeId }: NoticeFeedbackProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: feedbackCounts = {} } = useQuery({
    queryKey: ['notice-feedback-counts', noticeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notice_feedback')
        .select('tag')
        .eq('notice_id', noticeId);
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((f: { tag: string }) => { counts[f.tag] = (counts[f.tag] || 0) + 1; });
      return counts;
    },
  });

  const { data: userFeedback } = useQuery({
    queryKey: ['notice-feedback-user', noticeId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('notice_feedback')
        .select('tag')
        .eq('notice_id', noticeId)
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.tag || null;
    },
    enabled: !!user,
  });

  const submitFeedback = useMutation({
    mutationFn: async (tag: string) => {
      if (!user) throw new Error('Must be signed in');
      if (userFeedback === tag) {
        await supabase.from('notice_feedback').delete().eq('notice_id', noticeId).eq('user_id', user.id);
      } else if (userFeedback) {
        await supabase.from('notice_feedback').update({ tag }).eq('notice_id', noticeId).eq('user_id', user.id);
      } else {
        await supabase.from('notice_feedback').insert({ notice_id: noticeId, user_id: user.id, tag });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice-feedback-counts', noticeId] });
      queryClient.invalidateQueries({ queryKey: ['notice-feedback-user', noticeId] });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">How did you find this notice?</p>
      <div className="flex flex-wrap gap-2">
        {FEEDBACK_OPTIONS.map(({ tag, label, icon: Icon, color }) => (
          <Button
            key={tag}
            variant="outline"
            size="sm"
            className={cn('gap-1.5', userFeedback === tag && color)}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (user) submitFeedback.mutate(tag); }}
            disabled={!user || submitFeedback.isPending}
          >
            <Icon className={cn('h-3.5 w-3.5', userFeedback === tag && 'fill-current')} />
            {label}
            {(feedbackCounts[tag] || 0) > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {feedbackCounts[tag]}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
