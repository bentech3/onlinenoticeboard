import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useAutoArchive() {
  const { isSuperAdmin } = useAuth();

  useEffect(() => {
    if (!isSuperAdmin) return;

    const archiveExpiredNotices = async () => {
      try {
        const now = new Date().toISOString();
        
        // Find notices that are expired but not yet archived
        const { data: expiredNotices, error: selectError } = await supabase
          .from('notices')
          .select('id')
          .lt('expires_at', now)
          .eq('is_archived', false)
          .eq('status', 'approved');

        if (selectError) throw selectError;

        if (expiredNotices && expiredNotices.length > 0) {
          const ids = expiredNotices.map(n => n.id);
          
          const { error: updateError } = await supabase
            .from('notices')
            .update({ is_archived: true })
            .in('id', ids);

          if (updateError) throw updateError;
          
          console.log(`Auto-archived ${ids.length} expired notices.`);
        }
      } catch (error) {
        console.error('Failed to auto-archive notices:', error);
      }
    };

    // Run once on load for admins
    archiveExpiredNotices();
    
    // Optional: Setup a timer or rely on periodic dashboard visits
  }, [isSuperAdmin]);
}
