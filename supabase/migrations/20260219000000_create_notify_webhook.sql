-- Create a trigger function to call the edge function when a notice is approved
CREATE OR REPLACE FUNCTION public.handle_notice_approval_notification()
RETURNS TRIGGER AS $$
DECLARE
  payload JSONB;
BEGIN
  -- We only want to notify when the status changes to 'approved'
  IF (TG_OP = 'UPDATE' AND NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved')) OR
     (TG_OP = 'INSERT' AND NEW.status = 'approved') THEN
    
    payload := jsonb_build_object(
      'record', jsonb_build_object(
        'id', NEW.id,
        'title', NEW.title,
        'content', NEW.content,
        'department_id', NEW.department_id,
        'status', NEW.status
      ),
      'old_record', CASE WHEN TG_OP = 'UPDATE' THEN jsonb_build_object('status', OLD.status) ELSE NULL END
    );

    -- Call the edge function
    -- Note: You'll need to replace YOUR_PROJECT_REF and YOUR_SUPABASE_ANON_KEY with actual values
    -- or use the net.http_post if extensions are enabled.
    -- For now, this is a placeholder for the logic.
    -- The most robust way in Supabase is using the 'Webhooks' UI or a direct HTTP call if extensions are enabled.
    
    PERFORM
      net.http_post(
        url := 'https://' || current_setting('app.settings.supabase_project_ref') || '.supabase.co/functions/v1/notify-subscribers',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || current_setting('app.settings.supabase_anon_key')
        ),
        body := payload
      );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_notice_approved_notify ON public.notices;
CREATE TRIGGER on_notice_approved_notify
  AFTER INSERT OR UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_notice_approval_notification();
