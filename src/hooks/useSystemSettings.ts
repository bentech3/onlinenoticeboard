import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';

export interface SystemSetting {
    id: string;
    key: string;
    value: Json;
    updated_at: string;
    updated_by: string | null;
}

export function useSystemSettings() {
    const queryClient = useQueryClient();

    const { data: settings = [], isLoading } = useQuery({
        queryKey: ['system_settings'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('system_settings')
                .select('*');

            if (error) throw error;
            return data as SystemSetting[];
        },
    });

    const getSetting = (key: string) => {
        return settings.find(s => s.key === key)?.value;
    };

    const updateSetting = useMutation({
        mutationFn: async ({ key, value }: { key: string, value: Json }) => {
            const { data: { user } } = await supabase.auth.getUser();

            const { error } = await supabase
                .from('system_settings')
                .upsert({
                    key,
                    value,
                    updated_at: new Date().toISOString(),
                    updated_by: user?.id || null,
                }, { onConflict: 'key' });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['system_settings'] });
        },
    });

    const maintenanceMode = getSetting('maintenance_mode') as { enabled: boolean, message: string } | undefined;

    return {
        settings,
        isLoading,
        getSetting,
        updateSetting,
        maintenanceEnabled: maintenanceMode?.enabled || false,
        maintenanceMessage: maintenanceMode?.message || 'The system is currently undergoing maintenance. Please check back later.',
    };
}
