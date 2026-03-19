-- Migration to name foreign keys on notices table for PostgREST ambiguity resolution
-- Created: 2026-03-19

ALTER TABLE public.notices 
DROP CONSTRAINT IF EXISTS notices_department_id_fkey,
ADD CONSTRAINT notices_department_id_fkey 
FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

ALTER TABLE public.notices 
DROP CONSTRAINT IF EXISTS notices_target_department_id_fkey,
ADD CONSTRAINT notices_target_department_id_fkey 
FOREIGN KEY (target_department_id) REFERENCES public.departments(id) ON DELETE SET NULL;
