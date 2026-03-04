export type AppRole = 'viewer' | 'creator' | 'approver' | 'super_admin';
export type NoticeStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  department_id: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  department?: Department;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  status: NoticeStatus;
  department_id: string | null;
  category: string | null;
  priority: string;
  created_by: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  expires_at: string | null;
  is_urgent: boolean;
  view_count: number;
  is_archived: boolean;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  department?: Department;
  creator?: Profile;
  approver?: Profile;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  notice_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  target_table: string;
  target_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user?: Profile;
}

export interface NoticeSubscription {
  id: string;
  user_id: string;
  department_id: string | null;
  category: string | null;
  created_at: string;
}

export interface Comment {
  id: string;
  notice_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
  replies?: Comment[];
}
