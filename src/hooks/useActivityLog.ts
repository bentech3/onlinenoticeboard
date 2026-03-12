import { supabase } from '@/integrations/supabase/client';

export function useActivityLog() {
  const logActivity = async (action: string, targetType: string, targetId?: string, details?: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await (supabase.from('admin_activity_logs' as any) as any).insert({
        admin_id: session.user.id,
        action,
        target_type: targetType,
        target_id: targetId,
        details,
      });
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }
  };

  return { logActivity };
}
