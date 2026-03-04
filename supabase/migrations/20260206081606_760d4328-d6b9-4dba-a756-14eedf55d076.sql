
-- Create storage bucket for notice attachments (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('notice-attachments', 'notice-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for notice-attachments bucket
CREATE POLICY "Anyone can view notice attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'notice-attachments');

CREATE POLICY "Authenticated users can upload notice attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'notice-attachments' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own notice attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'notice-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policies for avatars bucket
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
