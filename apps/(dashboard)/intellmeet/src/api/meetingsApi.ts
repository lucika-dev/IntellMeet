import { supabase } from '@wraith/auth/client';

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:5000/api';

export type MeetingStatus = 'scheduled' | 'live' | 'recorded' | 'ended';
export type MeetingMode = 'instant' | 'scheduled';

export interface MeetingRecord {
  id: string;
  creator_user_id: string;
  title: string;
  image_url: string | null;
  scheduled_time: string;
  meeting_code: string;
  meeting_url: string;
  status: MeetingStatus;
  participant_count: number;
  organization_name: string | null;
  room_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMeetingInput {
  title: string;
  scheduleMode: MeetingMode;
  scheduledAt: string;
  organizationName: string;
  image?: File | null;
}

const buildHeaders = async (isFormData = false) => {
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = {};

  if (data.session?.access_token) {
    headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

const requestJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    headers: await buildHeaders(),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
};

export const meetingsApi = {
  fetchMeetings: async (): Promise<MeetingRecord[]> => {
    const data = await requestJson<{ meetings: MeetingRecord[] }>('/meetings');
    return data.meetings;
  },
  fetchLiveMeetings: async (): Promise<MeetingRecord[]> => {
    const data = await requestJson<{ meetings: MeetingRecord[] }>('/meetings/live');
    return data.meetings;
  },
  fetchMeetingByCode: async (meetingCode: string): Promise<MeetingRecord> => {
    const data = await requestJson<{ meeting: MeetingRecord }>(`/meetings/${meetingCode}`);
    return data.meeting;
  },
  createMeeting: async (input: CreateMeetingInput): Promise<MeetingRecord> => {
    const formData = new FormData();
    formData.append('title', input.title);
    formData.append('scheduleMode', input.scheduleMode);
    formData.append('scheduledAt', input.scheduledAt);
    formData.append('organizationName', input.organizationName);

    if (input.image) {
      formData.append('image', input.image);
    }

    const response = await fetch(`${API_URL}/meetings`, {
      method: 'POST',
      headers: await buildHeaders(true),
      body: formData,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = (await response.json()) as { meeting: MeetingRecord };
    return data.meeting;
  },
  joinMeeting: async (meetingCode: string): Promise<MeetingRecord> => {
    const response = await fetch(`${API_URL}/meetings/${meetingCode}/join`, {
      method: 'POST',
      headers: await buildHeaders(),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = (await response.json()) as { meeting: MeetingRecord };
    return data.meeting;
  },
};