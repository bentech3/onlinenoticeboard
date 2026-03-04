
-- ONBS Database Schema for UCU-BBUC

-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('viewer', 'creator', 'approver', 'super_admin');

-- 2. Create notice status enum
CREATE TYPE public.notice_status AS ENUM ('draft', 'pending', 'approved', 'rejected');

-- 3. Create departments table
CREATE TABLE public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create profiles table (linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 6. Create notices table
CREATE TABLE public.notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status notice_status NOT NULL DEFAULT 'draft',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  category TEXT,
  priority TEXT DEFAULT 'normal',
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Create attachments table
CREATE TABLE public.attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID NOT NULL REFERENCES public.notices(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 8. Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_table TEXT NOT NULL,
  target_id UUID,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 9. Create notice_subscriptions table (for notifications)
CREATE TABLE public.notice_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, department_id, category)
);

-- 10. Create indexes for performance
CREATE INDEX idx_notices_status ON public.notices(status);
CREATE INDEX idx_notices_department ON public.notices(department_id);
CREATE INDEX idx_notices_created_by ON public.notices(created_by);
CREATE INDEX idx_notices_created_at ON public.notices(created_at DESC);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- 11. Enable RLS on all tables
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notice_subscriptions ENABLE ROW LEVEL SECURITY;

-- 12. Create security definer function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 13. Create function to check if user is super_admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- 14. Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles 
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'super_admin' THEN 1 
      WHEN 'approver' THEN 2 
      WHEN 'creator' THEN 3 
      ELSE 4 
    END
  LIMIT 1
$$;

-- 15. RLS Policies for departments
CREATE POLICY "Anyone can view departments"
  ON public.departments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admin can manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 16. RLS Policies for profiles
CREATE POLICY "Users can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admin can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 17. RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Super admin can manage all roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- 18. RLS Policies for notices
CREATE POLICY "Anyone can view approved notices"
  ON public.notices FOR SELECT
  TO authenticated
  USING (
    status = 'approved' 
    OR created_by = auth.uid()
    OR public.is_super_admin()
    OR (
      public.has_role(auth.uid(), 'approver') 
      AND status = 'pending'
      AND department_id IN (
        SELECT department_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Public can view approved notices"
  ON public.notices FOR SELECT
  TO anon
  USING (status = 'approved');

CREATE POLICY "Creators can create notices"
  ON public.notices FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid() 
    AND (
      public.has_role(auth.uid(), 'creator') 
      OR public.has_role(auth.uid(), 'approver')
      OR public.is_super_admin()
    )
  );

CREATE POLICY "Users can update their draft notices"
  ON public.notices FOR UPDATE
  TO authenticated
  USING (
    (created_by = auth.uid() AND status IN ('draft', 'rejected'))
    OR public.is_super_admin()
    OR (
      public.has_role(auth.uid(), 'approver') 
      AND status = 'pending'
      AND department_id IN (
        SELECT department_id FROM public.profiles WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    (created_by = auth.uid() AND status IN ('draft', 'rejected', 'pending'))
    OR public.is_super_admin()
    OR public.has_role(auth.uid(), 'approver')
  );

CREATE POLICY "Users can delete their draft notices"
  ON public.notices FOR DELETE
  TO authenticated
  USING (
    (created_by = auth.uid() AND status = 'draft')
    OR public.is_super_admin()
  );

-- 19. RLS Policies for attachments
CREATE POLICY "Anyone can view attachments of visible notices"
  ON public.attachments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.notices n 
      WHERE n.id = notice_id 
      AND (
        n.status = 'approved' 
        OR n.created_by = auth.uid()
        OR public.is_super_admin()
      )
    )
  );

CREATE POLICY "Creators can manage their attachments"
  ON public.attachments FOR ALL
  TO authenticated
  USING (uploaded_by = auth.uid() OR public.is_super_admin())
  WITH CHECK (uploaded_by = auth.uid() OR public.is_super_admin());

-- 20. RLS Policies for audit_logs
CREATE POLICY "Super admin can view all audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "System can insert audit logs"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 21. RLS Policies for notice_subscriptions
CREATE POLICY "Users can manage their subscriptions"
  ON public.notice_subscriptions FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 22. Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  
  -- Default role is viewer
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  
  RETURN NEW;
END;
$$;

-- 23. Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 24. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 25. Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notices_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 26. Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 27. Create audit triggers for notices
CREATE TRIGGER audit_notices_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.log_audit_event();

-- 28. Insert default departments for UCU-BBUC
INSERT INTO public.departments (name, description) VALUES
  ('Academic Affairs', 'Academic programs, curriculum, and faculty matters'),
  ('Student Affairs', 'Student services, welfare, and extracurricular activities'),
  ('Finance', 'Financial matters, fees, and scholarships'),
  ('Administration', 'General administration and operations'),
  ('Library', 'Library services and resources'),
  ('ICT', 'Information technology and computer services'),
  ('Examinations', 'Examination schedules, results, and academic records'),
  ('Registry', 'Student registration and records');

-- 29. Enable realtime for notices
ALTER PUBLICATION supabase_realtime ADD TABLE public.notices;
