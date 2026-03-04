import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Notice, NoticeStatus } from '@/lib/types';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface CreateNoticeData {
  title: string;
  content: string;
  department_id?: string | null;
  category?: string | null;
  priority?: string;
  expires_at?: string | null;
  is_urgent?: boolean;
}

export function useNotices(status?: NoticeStatus | NoticeStatus[], departmentId?: string) {
  const queryClient = useQueryClient();

  const { data: notices, isLoading, error } = useQuery({
    queryKey: ['notices', status, departmentId],
    queryFn: async () => {
      let query = supabase
        .from('notices')
        .select(`
          *,
          department:departments(*)
        `)
        .order('created_at', { ascending: false });

      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }

      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch creator profiles separately
      const noticesWithCreators = await Promise.all(
        (data || []).map(async (notice) => {
          const { data: creator } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', notice.created_by)
            .single();
          return { ...notice, creator } as Notice;
        })
      );
      
      return noticesWithCreators;
    },
  });

  // Real-time subscription for notices
  useEffect(() => {
    const channel = supabase
      .channel('notices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notices',
        },
        (payload) => {
          console.log('Notice change:', payload);
          queryClient.invalidateQueries({ queryKey: ['notices'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { notices: notices || [], isLoading, error };
}

export function useNotice(id: string) {
  return useQuery({
    queryKey: ['notice', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notices')
        .select(`
          *,
          department:departments(*),
          attachments(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Fetch creator profile
      const { data: creator } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.created_by)
        .single();
      
      // Fetch approver profile if exists
      let approver = null;
      if (data.approved_by) {
        const { data: approverData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.approved_by)
          .single();
        approver = approverData;
      }
      
      return { ...data, creator, approver } as Notice;
    },
    enabled: !!id,
  });
}

export function useCreateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateNoticeData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data: notice, error } = await supabase
        .from('notices')
        .insert({
          ...data,
          created_by: session.session.user.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) throw error;
      return notice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: 'Notice created',
        description: 'Your notice has been saved as a draft.',
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

export function useUpdateNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string } & Partial<Notice>) => {
      const { data: notice, error } = await supabase
        .from('notices')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return notice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
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

export function useSubmitNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('notices')
        .update({ status: 'pending' as NoticeStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: 'Notice submitted',
        description: 'Your notice has been submitted for approval.',
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

export function useApproveNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notices')
        .update({
          status: 'approved' as NoticeStatus,
          approved_by: session.session.user.id,
          approved_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Trigger email notifications via edge function
      try {
        await supabase.functions.invoke('notify-subscribers', {
          body: {
            record: {
              id: data.id,
              title: data.title,
              content: data.content,
              department_id: data.department_id,
              status: data.status,
            },
            old_record: { status: 'pending' },
          },
        });
      } catch (e) {
        console.error('Failed to send notifications:', e);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: 'Notice approved',
        description: 'The notice is now published and visible to everyone.',
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

export function useRejectNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notices')
        .update({
          status: 'rejected' as NoticeStatus,
          rejection_reason: reason,
          approved_by: session.session.user.id,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: 'Notice rejected',
        description: 'The creator will be notified of the rejection.',
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

export function useDeleteNotice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
      toast({
        title: 'Notice deleted',
        description: 'The notice has been permanently deleted.',
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
