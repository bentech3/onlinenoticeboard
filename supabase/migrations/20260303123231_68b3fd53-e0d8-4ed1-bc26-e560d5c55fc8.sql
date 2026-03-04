
-- Allow super_admin to delete ANY notice (not just drafts)
DROP POLICY IF EXISTS "Users can delete their draft notices" ON public.notices;
CREATE POLICY "Users can delete their draft notices or admin can delete any"
ON public.notices
FOR DELETE
USING (
  ((created_by = auth.uid()) AND (status = 'draft'::notice_status))
  OR is_super_admin()
);
