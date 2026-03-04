
-- Create the trigger on notices table for approval notifications
-- First drop if exists to avoid conflicts
DROP TRIGGER IF EXISTS on_notice_approval_notify ON public.notices;

CREATE TRIGGER on_notice_approval_notify
  AFTER INSERT OR UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notice_approval_notification();

-- Also create the status change notification trigger if missing
DROP TRIGGER IF EXISTS on_notice_status_change ON public.notices;

CREATE TRIGGER on_notice_status_change
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_notice_status_change();

-- Update notifications INSERT policy to allow the trigger function (SECURITY DEFINER) to insert
-- The current policy only allows super_admin, but we need the trigger to insert for all users
DROP POLICY IF EXISTS "Super admin can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "System and admin can insert notifications" ON public.notifications;

CREATE POLICY "System and admin can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);
