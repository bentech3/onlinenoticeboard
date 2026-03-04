import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Loader2, Save, Send, AlertTriangle, Calendar, Paperclip, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/notices/FileUpload';
import { useCreateNotice, useSubmitNotice, useUpdateNotice } from '@/hooks/useNotices';
import { useCreateMultipleAttachments } from '@/hooks/useAttachments';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const CATEGORIES = [
  'Academic',
  'Administrative',
  'Events',
  'Examinations',
  'Financial',
  'General',
  'Sports',
  'Library',
];

const noticeSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(200, 'Title is too long'),
  content: z.string().trim().min(20, 'Content must be at least 20 characters').max(10000, 'Content is too long'),
  department_id: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  priority: z.string().default('normal'),
  expires_at: z.string().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  is_urgent: z.boolean().default(false),
});

type NoticeFormData = z.infer<typeof noticeSchema>;

interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
}

export default function CreateNotice() {
  const navigate = useNavigate();
  const { profile, isCreator } = useAuth();
  const { data: departments } = useDepartments();
  const createNotice = useCreateNotice();
  const submitNotice = useSubmitNotice();
  const updateNotice = useUpdateNotice();
  const createAttachments = useCreateMultipleAttachments();
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const form = useForm<NoticeFormData>({
    resolver: zodResolver(noticeSchema),
    defaultValues: {
      title: '',
      content: '',
      department_id: profile?.department_id || null,
      category: null,
      priority: 'normal',
      expires_at: null,
      scheduled_at: null,
      is_urgent: false,
    },
  });

  if (!isCreator) {
    navigate('/dashboard');
    return null;
  }

  const saveAttachments = async (noticeId: string) => {
    if (uploadedFiles.length > 0) {
      const attachmentsData = uploadedFiles.map(file => ({
        notice_id: noticeId,
        file_name: file.name,
        file_url: file.url,
        file_type: file.type,
        file_size: file.size,
      }));
      await createAttachments.mutateAsync(attachmentsData);
    }
  };

  const handleSaveDraft = async (data: NoticeFormData) => {
    setIsSaving(true);
    try {
      const notice = await createNotice.mutateAsync({
        title: data.title,
        content: data.content,
        department_id: data.department_id || null,
        category: data.category || null,
        priority: data.priority,
        expires_at: data.expires_at || null,
        is_urgent: data.is_urgent,
      });
      
      if (notice) {
        await saveAttachments(notice.id);
      }
      
      navigate('/dashboard');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForApproval = async (data: NoticeFormData) => {
    setIsSubmitting(true);
    try {
      const notice = await createNotice.mutateAsync({
        title: data.title,
        content: data.content,
        department_id: data.department_id || null,
        category: data.category || null,
        priority: data.priority,
        expires_at: data.expires_at || null,
        is_urgent: data.is_urgent,
      });
      
      if (notice) {
        await saveAttachments(notice.id);
        await submitNotice.mutateAsync(notice.id);
        toast({
          title: 'Notice submitted',
          description: 'Your notice has been submitted for approval.',
        });
        navigate('/dashboard');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Notice</h1>
            <p className="text-muted-foreground">Create a new notice for the board</p>
          </div>
        </div>

        <form className="space-y-6">
          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Notice Details</CardTitle>
              <CardDescription>Fill in the information for your notice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a clear, descriptive title"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write the main content of your notice here..."
                  rows={8}
                  {...form.register('content')}
                />
                {form.formState.errors.content && (
                  <p className="text-sm text-destructive">{form.formState.errors.content.message}</p>
                )}
              </div>

              {/* Department and Category */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select
                    value={form.watch('department_id') || ''}
                    onValueChange={(value) => form.setValue('department_id', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.watch('category') || ''}
                    onValueChange={(value) => form.setValue('category', value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Priority and Expiry */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={form.watch('priority')}
                    onValueChange={(value) => form.setValue('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires_at">Expiry Date (Optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      className="pl-9"
                      {...form.register('expires_at')}
                    />
                  </div>
                </div>
              </div>

              {/* Scheduled Publishing */}
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Schedule Publishing (Optional)</Label>
                <p className="text-xs text-muted-foreground">Set a future date/time for the notice to be automatically published</p>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    className="pl-9"
                    {...form.register('scheduled_at')}
                  />
                </div>
              </div>

              {/* Urgent Toggle */}
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <Label htmlFor="is_urgent" className="font-medium">Mark as Urgent</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Urgent notices are highlighted and appear at the top
                  </p>
                </div>
                <Switch
                  id="is_urgent"
                  checked={form.watch('is_urgent')}
                  onCheckedChange={(checked) => form.setValue('is_urgent', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Paperclip className="h-5 w-5" />
                Attachments
              </CardTitle>
              <CardDescription>
                Upload supporting documents or images (PDF, images, Word docs)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload
                files={uploadedFiles}
                onFilesChange={setUploadedFiles}
                maxFiles={5}
                maxSize={10 * 1024 * 1024}
              />
            </CardContent>
          </Card>
          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={form.handleSubmit(handleSaveDraft)}
              disabled={isSaving || isSubmitting}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit(handleSubmitForApproval)}
              disabled={isSaving || isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Send className="mr-2 h-4 w-4" />
              Submit for Approval
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
