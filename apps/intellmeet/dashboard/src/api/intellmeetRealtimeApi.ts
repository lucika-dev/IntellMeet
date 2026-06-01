import { supabase } from '@wraith/auth/client';

export type MeetingType = 'instant' | 'organization';
export type MeetingRole = 'host' | 'admin' | 'member' | 'guest';
export type MeetingStatus = 'scheduled' | 'live' | 'recorded' | 'ended';

export type IntellMeetMeeting = {
  id: string;
  organization_id: string | null;
  channel_id: string | null;
  title: string;
  description: string | null;
  status: MeetingStatus;
  scheduled_at: string | null;
  thumbnail_url: string | null;
  created_by: string | null;
  created_at: string;
  meeting_slug: string;
  room_name: string;
  ended_at: string | null;
  meeting_type: MeetingType;
};

export type LiveKitTokenResponse = {
  meeting: IntellMeetMeeting;
  roomName: string;
  liveKitUrl: string;
  identity: string;
  participantName: string;
  participantRole: MeetingRole;
  accessToken: string;
};

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  'http://localhost:5000/api';

const getAccessToken = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('Missing session');
  }

  return session.access_token;
};

const request = async <T>(path: string, init?: RequestInit) => {
  const token = await getAccessToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || 'Request failed');
  }

  return payload.data as T;
};

export const intellmeetRealtimeApi = {
  createToken: (input: {
    meetingCode?: string;
    orgSlug?: string;
    channelSlug?: string;
    meetingSlug?: string;
    meetingId?: string;
  }) =>
    request<LiveKitTokenResponse>('/intellmeet/livekit/token', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  joinParticipant: (meetingId: string) =>
    request<{ participant: unknown }>(
      `/intellmeet/participants/${meetingId}/join`,
      {
        method: 'POST',
      },
    ),

  leaveParticipant: (meetingId: string) =>
    request<{ ok: boolean }>(
      `/intellmeet/participants/${meetingId}/leave`,
      {
        method: 'POST',
      },
    ),

  endMeeting: (meetingId: string) =>
    request<{ meeting: IntellMeetMeeting; endedBy: string }>(
      `/intellmeet/meetings/${meetingId}/end`,
      {
        method: 'POST',
      },
    ),
};
