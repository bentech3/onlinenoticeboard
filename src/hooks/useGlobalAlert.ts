import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

interface GlobalAlertSettings {
  enabled: boolean;
  notice_id: string | null;
  ticker_text: string;
  updated_at: string | null;
}

export function useGlobalAlert() {
  const queryClient = useQueryClient();

  const { data: alertSettings, isLoading } = useQuery({
    queryKey: ['global-alert'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'global_alert')
        .single();
      if (error) throw error;
      return data.value as unknown as GlobalAlertSettings;
    },
  });

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('global-alert-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, () => {
        queryClient.invalidateQueries({ queryKey: ['global-alert'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const updateAlert = useMutation({
    mutationFn: async (settings: Partial<GlobalAlertSettings>) => {
      const current = alertSettings || { enabled: false, notice_id: null, ticker_text: '', updated_at: null };
      const newValue = { ...current, ...settings, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('system_settings')
        .update({ value: newValue as any })
        .eq('key', 'global_alert');
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['global-alert'] }),
  });

  return {
    alertSettings: alertSettings || { enabled: false, notice_id: null, ticker_text: '', updated_at: null },
    isLoading,
    updateAlert,
  };
}
