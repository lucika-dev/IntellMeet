import type { TeamMember, Meeting, ActionItem, Task } from '../types';

let membersDB: TeamMember[] = [
  { id: '1', name: 'Emma Watson', email: 'emma@intellimeet.ai', role: 'admin', avatarInitials: 'EW', dateAdded: new Date().toISOString(), lastActive: new Date().toISOString() },
  { id: '2', name: 'Liam Chen', email: 'liam@intellimeet.ai', role: 'admin', avatarInitials: 'LC', dateAdded: new Date().toISOString(), lastActive: new Date().toISOString() },
  { id: '3', name: 'Sofia Rodriguez', email: 'sofia@intellimeet.ai', role: 'account', avatarInitials: 'SR', dateAdded: new Date().toISOString(), lastActive: new Date().toISOString() },
];

let meetingsDB: Meeting[] = [
  { id: 'm1', title: 'Product Roadmap Q2', date: new Date().toISOString(), duration: 45, participants: ['Emma', 'Liam'], summary: 'Discussed AI features and Q2 launch timeline.', actionItems: [{ id: 'ai1', text: 'Finalize UI mockups', assigneeId: '1', completed: false, meetingId: 'm1' }], transcript: 'Mock transcript...' },
  { id: 'm2', title: 'Sprint Planning', date: new Date(Date.now() - 86400000).toISOString(), duration: 30, participants: ['Sofia', 'Liam'], summary: 'Planned backend optimizations.', actionItems: [{ id: 'ai2', text: 'Optimize API rate limits', assigneeId: '2', completed: true, meetingId: 'm2' }] }
];

let tasksDB: Task[] = [
  { id: 't1', title: 'Implement video grid', status: 'done', assignee: 'Emma', meetingId: 'm1' },
  { id: 't2', title: 'AI summary integration', status: 'in-progress', assignee: 'Liam', meetingId: 'm1' },
  { id: 't3', title: 'Deploy to staging', status: 'todo', assignee: 'Sofia' }
];

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  fetchAllMembers: async (): Promise<TeamMember[]> => { await delay(300); return [...membersDB]; },
  addMember: async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
    await delay(400);
    const newMember = { ...member, id: Date.now().toString() };
    membersDB.push(newMember);
    return newMember;
  },
  updateMember: async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
    await delay(300);
    const index = membersDB.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Not found');
    membersDB[index] = { ...membersDB[index], ...updates };
    return membersDB[index];
  },
  deleteMember: async (id: string): Promise<void> => { await delay(300); membersDB = membersDB.filter(m => m.id !== id); },
  
  fetchMeetings: async (): Promise<Meeting[]> => { await delay(300); return [...meetingsDB]; },
  createMeeting: async (title: string): Promise<Meeting> => {
    await delay(400);
    const newMeeting: Meeting = { id: Date.now().toString(), title, date: new Date().toISOString(), duration: 0, participants: [], actionItems: [] };
    meetingsDB.push(newMeeting);
    return newMeeting;
  },
  fetchMeetingById: async (id: string): Promise<Meeting | undefined> => { await delay(200); return meetingsDB.find(m => m.id === id); },
  generateAISummary: async (_meetingId: string, transcriptText: string): Promise<{ summary: string; actionItems: string[] }> => {
    await delay(1500);
    return {
      summary: `AI generated summary: The team discussed ${transcriptText.slice(0, 60)}. Key decisions: proceed with AI integration.`,
      actionItems: ['Assign follow-up tasks', 'Update project timeline', 'Review by Friday']
    };
  },
  addActionItem: async (meetingId: string, text: string, assigneeId?: string): Promise<ActionItem> => {
    const meeting = meetingsDB.find(m => m.id === meetingId);
    if (!meeting) throw new Error('Meeting not found');
    const newItem = { id: Date.now().toString(), text, assigneeId, completed: false, meetingId };
    meeting.actionItems.push(newItem);
    return newItem;
  },
  toggleActionItem: async (meetingId: string, itemId: string) => {
    const meeting = meetingsDB.find(m => m.id === meetingId);
    const item = meeting?.actionItems.find(i => i.id === itemId);
    if (item) item.completed = !item.completed;
  },
  fetchTasks: async (): Promise<Task[]> => { await delay(300); return [...tasksDB]; },
  addTask: async (task: Omit<Task, 'id'>): Promise<Task> => {
    const newTask = { ...task, id: Date.now().toString() };
    tasksDB.push(newTask);
    return newTask;
  },
  updateTaskStatus: async (id: string, status: Task['status']) => {
    const task = tasksDB.find(t => t.id === id);
    if (task) task.status = status;
  }
};
