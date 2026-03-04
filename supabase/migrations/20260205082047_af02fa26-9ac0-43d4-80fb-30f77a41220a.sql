-- Create comments table for notice discussions
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX idx_comments_notice_id ON public.comments(notice_id);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);

-- Enable RLS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on approved notices
CREATE POLICY "Anyone can view comments on approved notices"
ON public.comments
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.notices n
    WHERE n.id = comments.notice_id
    AND n.status = 'approved'
  )
);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.notices n
    WHERE n.id = notice_id
    AND n.status = 'approved'
  )
);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
ON public.comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete own comments, super_admin can delete any
CREATE POLICY "Users and admins can delete comments"
ON public.comments
FOR DELETE
USING (
  auth.uid() = user_id
  OR public.is_super_admin()
);

-- Add trigger for updated_at
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;

-- Add audit logging trigger for comments
CREATE TRIGGER audit_comments_changes
AFTER INSERT OR UPDATE OR DELETE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.log_audit_event();