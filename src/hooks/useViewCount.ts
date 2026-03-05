import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useViewCount(noticeId: string | undefined) {
  useEffect(() => {
    if (!noticeId) return;
    // Fire and forget - don't block UI
    supabase.rpc('increment_view_count', { notice_uuid: noticeId }).then(({ error }) => {
      if (error) console.error('Failed to increment view count:', error);
    });

    // Track read status for heatmap
    const trackRead = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      
      const { data: profile } = await supabase.from('profiles').select('department_id').eq('id', session.user.id).single();
      
      await supabase.from('notice_reads').upsert({
        notice_id: noticeId,
        user_id: session.user.id,
        department_id: profile?.department_id || null,
      } as any, { onConflict: 'notice_id,user_id' });
    };
    trackRead();
  }, [noticeId]);
}
