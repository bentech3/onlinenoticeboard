import { supabase } from '@/integrations/supabase/client';
import { type Json } from '@/integrations/supabase/types';

export function useActivityLog() {
  const logActivity = async (action: string, targetType: string, targetId?: string, details?: Json) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      await supabase.from('audit_logs').insert({
        user_id: session.user.id,
        action,
        target_table: targetType,
        target_id: targetId,
        details,
      });
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }
  };

  return { logActivity };
}
