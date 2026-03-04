import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NoticeSubscription } from '@/lib/types';
import { toast } from '@/hooks/use-toast';

export function useSubscriptions() {
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: async () => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return [];

      const { data, error } = await supabase
        .from('notice_subscriptions')
        .select(`
          *,
          department:departments(*)
        `)
        .eq('user_id', session.session.user.id);

      if (error) throw error;
      return data as (NoticeSubscription & { department: { id: string; name: string } | null })[];
    },
  });

  return { subscriptions: subscriptions || [], isLoading };
}

export function useSubscribeToDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notice_subscriptions')
        .insert({
          user_id: session.session.user.id,
          department_id: departmentId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Subscribed',
        description: 'You will now receive notifications from this department.',
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

export function useUnsubscribeFromDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (departmentId: string) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('notice_subscriptions')
        .delete()
        .eq('user_id', session.session.user.id)
        .eq('department_id', departmentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast({
        title: 'Unsubscribed',
        description: 'You will no longer receive notifications from this department.',
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

export function useIsSubscribed(departmentId: string | null) {
  const { subscriptions } = useSubscriptions();
  
  if (!departmentId) return false;
  return subscriptions.some(sub => sub.department_id === departmentId);
}
