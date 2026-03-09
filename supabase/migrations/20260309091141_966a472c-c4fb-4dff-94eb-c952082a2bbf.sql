
-- Remove redundant policy - edge functions use service role key which bypasses RLS
DROP POLICY IF EXISTS "System can read all subscriptions" ON public.push_subscriptions;
