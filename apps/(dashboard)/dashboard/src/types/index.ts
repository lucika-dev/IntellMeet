export type UserRole = 'admin' | 'account';

export interface TeamMember {
  id: string;
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
  status: 'todo' | 'in-progress' | 'done';
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
