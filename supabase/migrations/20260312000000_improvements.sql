-- Database Improvements Migration

-- 1. Create activity_logs table if not exists (extending audit_logs)
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_activity_logs
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy for super_admin to view logs
CREATE POLICY "Super admin can view all activity logs"
    ON public.admin_activity_logs FOR SELECT
    TO authenticated
    USING (public.is_super_admin());

-- Policy for systems/admins to insert logs
CREATE POLICY "Admins can insert activity logs"
    ON public.admin_activity_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = admin_id);

-- 2. Add engagement metrics columns to notices if missing
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT FALSE;

-- 3. Create function for analytics dashboard summary
CREATE OR REPLACE FUNCTION public.get_admin_analytics_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_notices', (SELECT count(*) FROM notices),
        'pending_notices', (SELECT count(*) FROM notices WHERE status = 'pending'),
        'total_views', (SELECT coalesce(sum(view_count), 0) FROM notices),
        'total_users', (SELECT count(*) FROM profiles),
        'department_engagement', (
            SELECT jsonb_agg(dept_stats)
            FROM (
                SELECT 
                    d.name as department_name,
                    count(n.id) as notice_count,
                    coalesce(sum(n.view_count), 0) as total_views
                FROM departments d
                LEFT JOIN notices n ON n.department_id = d.id
                GROUP BY d.name
            ) dept_stats
        ),
        'recent_activity', (
            SELECT jsonb_agg(activity)
            FROM (
                SELECT 
                    al.action,
                    al.target_type,
                    p.full_name as admin_name,
                    al.created_at
                FROM admin_activity_logs al
                JOIN profiles p ON p.id = al.admin_id
                ORDER BY al.created_at DESC
                LIMIT 5
            ) activity
        )
    ) INTO result;
    
    RETURN result;
END;
$$;

-- 4. Standardize Categories and Priorities (Metadata/Constraint hints)
COMMENT ON COLUMN public.notices.category IS 'Standardized categories: Academic, Finance, Exams, Events, Hostel, ICT, Administration';
COMMENT ON COLUMN public.notices.priority IS 'Priority levels: low, normal, high, urgent';

-- 5. Index for search optimization
CREATE INDEX IF NOT EXISTS idx_notices_fts ON public.notices USING GIN (to_tsvector('english', title || ' ' || content));
