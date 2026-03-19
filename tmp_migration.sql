-- Migration to add target_department_id to notices
ALTER TABLE public.notices ADD COLUMN IF NOT EXISTS target_department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL;
COMMENT ON COLUMN public.notices.target_department_id IS 'Specific department target for the notice. If null, targets the entire university.';
