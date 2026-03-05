
-- Add unique constraint for notice_reads upsert
ALTER TABLE public.notice_reads ADD CONSTRAINT notice_reads_notice_user_unique UNIQUE (notice_id, user_id);

-- Recreate triggers using DROP IF EXISTS first
DROP TRIGGER IF EXISTS on_notice_status_change ON public.notices;
CREATE TRIGGER on_notice_status_change
  AFTER UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_notice_status_change();

DROP TRIGGER IF EXISTS audit_notices ON public.notices;
CREATE TRIGGER audit_notices
  AFTER INSERT OR UPDATE OR DELETE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notices_updated_at ON public.notices;
CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Ensure global_alert setting exists
INSERT INTO public.system_settings (key, value)
VALUES ('global_alert', '{"enabled": false, "notice_id": null, "ticker_text": "", "updated_at": null}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Add unique constraint on system_settings key if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'system_settings_key_unique') THEN
    ALTER TABLE public.system_settings ADD CONSTRAINT system_settings_key_unique UNIQUE (key);
  END IF;
END $$;
