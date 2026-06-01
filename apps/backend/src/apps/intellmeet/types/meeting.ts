export type MeetingType = "instant" | "organization";
export type MeetingRole = "host" | "admin" | "member" | "guest";
export type MeetingStatus = "scheduled" | "live" | "recorded" | "ended";

export type MeetingRow = {
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

export type JoinMeetingRequest = {
  meetingId?: string;
  meetingSlug?: string;
  orgSlug?: string;
  channelSlug?: string;
  meetingCode?: string;
};

export type LiveKitTokenResponse = {
  meeting: MeetingRow;
  roomName: string;
  liveKitUrl: string;
  identity: string;
  participantName: string;
  participantRole: MeetingRole;
  accessToken: string;
};
