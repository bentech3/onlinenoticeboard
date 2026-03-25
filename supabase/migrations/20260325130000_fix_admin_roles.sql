-- 1. Ensure your own user is a Super Admin
-- Replace 'your-email@example.com' with your actual login email
DO $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE';
  
  IF v_user_id IS NOT NULL THEN
    -- Delete any existing roles to avoid conflicts
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    
    -- Insert the super_admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin');
    
    RAISE NOTICE 'User % has been promoted to super_admin', v_user_id;
  ELSE
    RAISE NOTICE 'User not found. Please check the email address.';
  END IF;
END $$;

-- 2. Check for users with multiple or duplicate roles (which causes the "not accept" issue)
-- This query identifies users who might have stuck roles
SELECT user_id, count(*), array_agg(role) 
FROM public.user_roles 
GROUP BY user_id 
HAVING count(*) > 1;

-- 3. Cleanup: If you find users with multiple roles, you can run this to keep only one
-- (Warning: This keeps the 'highest' role based on our logic)
WITH ranked_roles AS (
  SELECT id, user_id, role,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY 
      CASE role 
        WHEN 'super_admin' THEN 1 
        WHEN 'approver' THEN 2 
        WHEN 'creator' THEN 3 
        ELSE 4 
      END
    ) as rn
  FROM public.user_roles
)
DELETE FROM public.user_roles 
WHERE id IN (SELECT id FROM ranked_roles WHERE rn > 1);
