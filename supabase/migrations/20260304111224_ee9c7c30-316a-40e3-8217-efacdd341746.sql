
-- Recreate trigger: notify on notice status change
DROP TRIGGER IF EXISTS on_notice_status_change ON public.notices;
CREATE TRIGGER on_notice_status_change
  AFTER UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_notice_status_change();

-- Recreate trigger: auto-update updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate trigger: auto-update updated_at on notices
DROP TRIGGER IF EXISTS update_notices_updated_at ON public.notices;
CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate trigger: auto-update updated_at on departments
DROP TRIGGER IF EXISTS update_departments_updated_at ON public.departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate trigger: auto-update updated_at on comments
DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Recreate trigger: audit logging on notices
DROP TRIGGER IF EXISTS audit_notices ON public.notices;
CREATE TRIGGER audit_notices
  AFTER INSERT OR UPDATE OR DELETE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();
