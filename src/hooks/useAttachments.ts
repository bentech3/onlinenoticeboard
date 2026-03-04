import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AttachmentData {
  notice_id: string;
  file_name: string;
  file_url: string;
  file_type?: string;
  file_size?: number;
}

export function useCreateAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: AttachmentData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data: attachment, error } = await supabase
        .from('attachments')
        .insert({
          ...data,
          uploaded_by: session.session.user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return attachment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: (error) => {
      toast({
        title: 'Error saving attachment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useCreateMultipleAttachments() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachments: AttachmentData[]) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const attachmentsWithUser = attachments.map(att => ({
        ...att,
        uploaded_by: session.session!.user.id,
      }));

      const { data, error } = await supabase
        .from('attachments')
        .insert(attachmentsWithUser)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: (error) => {
      toast({
        title: 'Error saving attachments',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('attachments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notices'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting attachment',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
