import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFile = async (file: File, noticeId?: string): Promise<UploadedFile | null> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.session.user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage
      const { data, error } = await supabase.storage
        .from('notice-attachments')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('notice-attachments')
        .getPublicUrl(data.path);

      setUploadProgress(100);

      return {
        name: file.name,
        url: urlData.publicUrl,
        type: file.type,
        size: file.size,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      toast({
        title: 'Upload failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const uploadMultipleFiles = async (files: File[]): Promise<UploadedFile[]> => {
    const uploadedFiles: UploadedFile[] = [];

    for (const file of files) {
      const result = await uploadFile(file);
      if (result) {
        uploadedFiles.push(result);
      }
    }

    return uploadedFiles;
  };

  const deleteFile = async (fileUrl: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = fileUrl.split('/notice-attachments/');
      if (urlParts.length < 2) {
        throw new Error('Invalid file URL');
      }

      const filePath = urlParts[1];

      const { error } = await supabase.storage
        .from('notice-attachments')
        .remove([filePath]);

      if (error) throw error;

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown delete error';
      toast({
        title: 'Delete failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    isUploading,
    uploadProgress,
  };
}
