import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Hash, Plus, X, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NoticeTaggingProps {
  noticeId: string;
}

export function NoticeTagging({ noticeId }: NoticeTaggingProps) {
  const { user, isSuperAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = useState('');
  const [showInput, setShowInput] = useState(false);

  const { data: tags = [] } = useQuery({
    queryKey: ['notice-tags', noticeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notice_tags')
        .select('*')
        .eq('notice_id', noticeId)
        .order('created_at');
      if (error) throw error;
      return data;
    },
  });

  const addTag = useMutation({
    mutationFn: async (tag: string) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase.from('notice_tags').insert({
        notice_id: noticeId,
        tag: tag.toLowerCase().replace(/[^a-z0-9]/g, ''),
        created_by: user.id,
        is_approved: isSuperAdmin,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notice-tags', noticeId] });
      setNewTag('');
      setShowInput(false);
      toast({ title: isSuperAdmin ? 'Tag added' : 'Tag submitted for moderation' });
    },
    onError: (err: Error) => toast({ title: 'Error', description: err.message, variant: 'destructive' }),
  });

  const approveTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase.from('notice_tags').update({ is_approved: true }).eq('id', tagId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notice-tags', noticeId] }),
  });

  const deleteTag = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase.from('notice_tags').delete().eq('id', tagId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notice-tags', noticeId] }),
  });

  const approvedTags = tags.filter((t) => t.is_approved);
  const pendingTags = tags.filter((t) => !t.is_approved);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Hash className="h-4 w-4 text-muted-foreground" />
        {approvedTags.map((t) => (
          <Badge key={t.id} variant="secondary" className="gap-1">
            #{t.tag}
            {isSuperAdmin && (
              <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => deleteTag.mutate(t.id)} />
            )}
          </Badge>
        ))}
        {user && !showInput && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setShowInput(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Add Tag
          </Button>
        )}
        {showInput && (
          <form
            className="flex items-center gap-1"
            onSubmit={(e) => { e.preventDefault(); if (newTag.trim()) addTag.mutate(newTag.trim()); }}
          >
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="e.g. exam"
              className="h-7 w-24 text-xs"
              autoFocus
            />
            <Button type="submit" size="sm" className="h-7 px-2" disabled={!newTag.trim()}>
              <Plus className="h-3 w-3" />
            </Button>
            <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={() => setShowInput(false)}>
              <X className="h-3 w-3" />
            </Button>
          </form>
        )}
      </div>

      {isSuperAdmin && pendingTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Pending:</span>
          {pendingTags.map((t) => (
            <Badge key={t.id} variant="outline" className="gap-1 border-warning/50">
              #{t.tag}
              <Check
                className="h-3 w-3 cursor-pointer text-success hover:scale-110"
                onClick={() => approveTag.mutate(t.id)}
              />
              <X
                className="h-3 w-3 cursor-pointer text-destructive hover:scale-110"
                onClick={() => deleteTag.mutate(t.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
