import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useViewCount(noticeId: string | undefined) {
  useEffect(() => {
    if (!noticeId) return;

    // Detect if "from=qr" is in the URL
    const isQRScan = new URLSearchParams(window.location.search).get('from') === 'qr';

    // Fire and forget - don't block UI
    supabase.rpc('increment_view_count', { notice_uuid: noticeId }).then(({ error }) => {
      if (error) console.error('Failed to increment view count:', error);
    });

    const handleScanNotification = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // Only notify if it's a QR scan and user is unauthenticated (or just track as scan for all)
      if (isQRScan) {
        try {
          // 1. Get notice details (creator ID)
          const { data: notice } = await supabase
            .from('notices')
            .select('title, created_by')
            .eq('id', noticeId)
            .single();

          if (!notice) return;

          // 2. Get super admin IDs
          const { data: superAdmins } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'super_admin');

          const adminIds = superAdmins?.map(a => a.user_id) || [];
          const recipients = Array.from(new Set([notice.created_by, ...adminIds]));

          // 3. Create notifications for each recipient
          const notifications = recipients.map(uid => ({
            user_id: uid,
            type: 'qr_scan',
            title: 'Notice Scanned via QR',
            message: `Your notice "${notice.title}" was just viewed via QR code scan.`,
            notice_id: noticeId,
            is_read: false
          }));

          if (notifications.length > 0) {
            await supabase.from('notifications').insert(notifications);
          }
        } catch (err) {
          console.error('Failed to send scan notification:', err);
        }
      }

      // Track read status for authenticated users (heatmap)
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('department_id').eq('id', session.user.id).single();

        await supabase.from('notice_reads').upsert({
          notice_id: noticeId,
          user_id: session.user.id,
          department_id: profile?.department_id || null,
        } as any, { onConflict: 'notice_id,user_id' });
      }
    };

    handleScanNotification();
  }, [noticeId]);
}
