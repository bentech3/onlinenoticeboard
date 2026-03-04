
-- Fix security warnings

-- 1. Fix function search path for update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Fix log_audit_event to be more restrictive
DROP TRIGGER IF EXISTS audit_notices_changes ON public.notices;

CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only log if there's an authenticated user
  IF auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (user_id, action, target_table, target_id, details)
    VALUES (
      auth.uid(),
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      )
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER audit_notices_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();

-- 3. Fix the permissive audit_logs INSERT policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Only allow insert via trigger (not direct insert)
CREATE POLICY "No direct insert to audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (false);
