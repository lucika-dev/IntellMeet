export type UserRole =
  | 'admin'
  | 'account';

export interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  avatarInitials: string;
  dateAdded: string;
  lastActive: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: number;
  participants: string[];
  summary?: string;
  actionItems: ActionItem[];
  transcript?: string;
  recordingUrl?: string;
}

export interface ActionItem {
  id: string;
  text: string;
  assigneeId?: string;
  completed: boolean;
  meetingId: string;
}

export interface Task {
  id: string;
  title: string;
  status:
    | 'todo'
    | 'in-progress'
    | 'done';
  assignee: string;
  meetingId?: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: string;
}

export type WorkspaceRole =
  | 'owner'
  | 'admin'
  | 'member'
  | string;

export interface WorkspaceOrganization {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  secret_code: string | null;
  logo_url: string | null;
  created_at: string;
  role: WorkspaceRole;
}

export interface WorkspaceChannel {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
}

export type DashboardMeeting = {
  id: string;

  organization_id: string;

  channel_id: string | null;

  title: string;

  description: string | null;

  status: string;

  scheduled_at: string | null;

  thumbnail_url: string | null;


  created_by: string | null;

  created_at: string;

  participant_count?: number;

  creator_label?: string;

  watch_url?: string;

  organization?: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;

  channel?: {
    id: string;
    name: string;
  } | null;
};

export type RecordedMeeting = {
  id: string;

  organization_id: string;

  channel_id: string | null;

  uploaded_by: string | null;

  title: string;

  description: string | null;

  youtube_url: string;

  thumbnail_url: string | null;

  duration: string | null;

  created_at: string;

  participant_count?: number;

  creator_label?: string;

  organization?: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;

  channel?: {
    id: string;
    name: string;
  } | null;
};