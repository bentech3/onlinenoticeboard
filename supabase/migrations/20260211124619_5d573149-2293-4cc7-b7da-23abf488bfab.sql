
-- Fix the overly permissive insert policy on notifications
-- Drop the permissive one and replace with a definer-function approach
DROP POLICY "System can insert notifications" ON public.notifications;

-- Only the trigger (security definer) creates notifications, no direct user inserts needed
-- But super_admin might need to send notifications:
CREATE POLICY "Super admin can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_super_admin());
