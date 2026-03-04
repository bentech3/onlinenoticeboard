
-- Add view_count, is_archived, and scheduled_at to notices
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;

-- Notice likes table
CREATE TABLE public.notice_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id)
);

ALTER TABLE public.notice_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.notice_likes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can like" ON public.notice_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON public.notice_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Notice bookmarks table
CREATE TABLE public.notice_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id)
);

ALTER TABLE public.notice_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmarks" ON public.notice_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookmarks" ON public.notice_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete bookmarks" ON public.notice_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  notice_id uuid REFERENCES public.notices(id) ON DELETE CASCADE,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" ON public.notifications
  FOR DELETE USING (auth.uid() = user_id);

-- System can insert notifications (via triggers/functions)
CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notice_likes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notice_bookmarks;

-- Function to increment view count
CREATE OR REPLACE FUNCTION public.increment_view_count(notice_uuid uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.notices SET view_count = view_count + 1 WHERE id = notice_uuid;
$$;

-- Function to create notification on notice approval
CREATE OR REPLACE FUNCTION public.notify_on_notice_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    -- Notify creator on approval
    IF NEW.status = 'approved' THEN
      INSERT INTO public.notifications (user_id, type, title, message, notice_id)
      VALUES (NEW.created_by, 'approval', 'Notice Approved', 'Your notice "' || NEW.title || '" has been approved and published.', NEW.id);
    END IF;
    -- Notify creator on rejection
    IF NEW.status = 'rejected' THEN
      INSERT INTO public.notifications (user_id, type, title, message, notice_id)
      VALUES (NEW.created_by, 'rejection', 'Notice Rejected', 'Your notice "' || NEW.title || '" has been rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'No reason provided'), NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_notice_status_change
  AFTER UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_notice_status_change();

-- Indexes for performance
CREATE INDEX idx_notice_likes_notice ON public.notice_likes(notice_id);
CREATE INDEX idx_notice_likes_user ON public.notice_likes(user_id);
CREATE INDEX idx_notice_bookmarks_user ON public.notice_bookmarks(user_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notices_archived ON public.notices(is_archived);
CREATE INDEX idx_notices_scheduled ON public.notices(scheduled_at) WHERE scheduled_at IS NOT NULL;
