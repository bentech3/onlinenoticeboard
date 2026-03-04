
-- 1. Notice feedback/complaints table
CREATE TABLE public.notice_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  tag text NOT NULL CHECK (tag IN ('unhelpful', 'confusing', 'complaint', 'helpful')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id)
);
ALTER TABLE public.notice_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view feedback counts" ON public.notice_feedback FOR SELECT USING (true);
CREATE POLICY "Authenticated users can give feedback" ON public.notice_feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own feedback" ON public.notice_feedback FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can update own feedback" ON public.notice_feedback FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Student-generated tags
CREATE TABLE public.notice_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
  tag text NOT NULL,
  created_by uuid NOT NULL,
  is_approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(notice_id, tag)
);
ALTER TABLE public.notice_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view approved tags" ON public.notice_tags FOR SELECT USING (is_approved OR created_by = auth.uid() OR is_super_admin());
CREATE POLICY "Authenticated users can suggest tags" ON public.notice_tags FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Admins can manage tags" ON public.notice_tags FOR UPDATE USING (is_super_admin()) WITH CHECK (is_super_admin());
CREATE POLICY "Admins can delete tags" ON public.notice_tags FOR DELETE USING (is_super_admin() OR auth.uid() = created_by);

-- 3. Notice read tracking for heatmap
CREATE TABLE public.notice_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  department_id uuid REFERENCES public.departments(id),
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id)
);
ALTER TABLE public.notice_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can mark as read" ON public.notice_reads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all reads" ON public.notice_reads FOR SELECT USING (is_super_admin());
CREATE POLICY "Users can view own reads" ON public.notice_reads FOR SELECT USING (auth.uid() = user_id);

-- 4. Scheduled reminders
CREATE TABLE public.notice_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notice_id uuid REFERENCES public.notices(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  remind_at timestamptz NOT NULL,
  is_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(notice_id, user_id, remind_at)
);
ALTER TABLE public.notice_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reminders" ON public.notice_reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Signage profiles
CREATE TABLE public.signage_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  preferred_departments uuid[] DEFAULT '{}',
  preferred_categories text[] DEFAULT '{}',
  rotation_interval integer NOT NULL DEFAULT 8000,
  layout text NOT NULL DEFAULT 'default' CHECK (layout IN ('default', 'compact', 'ticker', 'grid')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.signage_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view signage profiles" ON public.signage_profiles FOR SELECT USING (true);
CREATE POLICY "Admins manage signage profiles" ON public.signage_profiles FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- 6. Global alert / emergency mode settings
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Admins manage settings" ON public.system_settings FOR ALL USING (is_super_admin()) WITH CHECK (is_super_admin());

-- Insert default global alert setting
INSERT INTO public.system_settings (key, value) VALUES
  ('global_alert', '{"enabled": false, "notice_id": null, "ticker_text": "", "updated_at": null}'::jsonb);

-- Enable realtime for feedback and system_settings
ALTER PUBLICATION supabase_realtime ADD TABLE public.notice_feedback;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
