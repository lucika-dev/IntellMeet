import { supabaseAdmin } from "@wraith/auth/server";

import { createChannelSlug, createMeetingSlug, createRoomName } from "@/apps/intellmeet/utils/meeting";
import type { MeetingRole, MeetingRow, MeetingType } from "@/apps/intellmeet/types/meeting";

type OrganizationRow = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  secret_code: string | null;
  logo_url: string | null;
  created_at: string;
};

type ChannelRow = {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

type MembershipRow = {
  organization_id: string;
  user_id: string;
  role: MeetingRole;
};

const meetingSelect =
  "id, organization_id, channel_id, title, description, status, scheduled_at, thumbnail_url, created_by, created_at, meeting_slug, room_name, ended_at, meeting_type";

const mapMeeting = (row: Record<string, unknown>): MeetingRow => row as MeetingRow;

export const resolveOrganizationMeeting = async ({
  orgSlug,
  channelSlug,
  meetingSlug,
  userId,
}: {
  orgSlug: string;
  channelSlug: string;
  meetingSlug: string;
  userId: string;
}) => {
  const { data: organization, error: organizationError } = await supabaseAdmin
    .from("organizations")
    .select("id, name, slug, owner_id, secret_code, logo_url, created_at")
    .eq("slug", orgSlug)
    .maybeSingle<OrganizationRow>();

  if (organizationError || !organization) {
    return { error: organizationError ?? new Error("Organization not found"), status: 404 as const };
  }

  const { data: channel, error: channelError } = await supabaseAdmin
    .from("channels")
    .select("id, organization_id, name, slug, description, created_by, created_at")
    .eq("organization_id", organization.id)
    .eq("slug", channelSlug)
    .maybeSingle<ChannelRow>();

  if (channelError || !channel) {
    return { error: channelError ?? new Error("Channel not found"), status: 404 as const };
  }

  const { data: membership } = await supabaseAdmin
    .from("organization_members")
    .select("organization_id, user_id, role")
    .eq("organization_id", organization.id)
    .eq("user_id", userId)
    .maybeSingle<MembershipRow>();

  const { data: meeting, error: meetingError } = await supabaseAdmin
    .from("meetings")
    .select(meetingSelect)
    .eq("organization_id", organization.id)
    .eq("channel_id", channel.id)
    .eq("meeting_slug", meetingSlug)
    .maybeSingle<MeetingRow>();

  if (meetingError || !meeting) {
    return { error: meetingError ?? new Error("Meeting not found"), status: 404 as const };
  }

  const role: MeetingRole =
    meeting.created_by === userId || organization.owner_id === userId
      ? "host"
      : membership?.role ?? "guest";

  return {
    meeting: mapMeeting(meeting as unknown as Record<string, unknown>),
    organization,
    channel,
    role,
  };
};

export const resolveInstantMeeting = async (meetingCode: string, userId: string) => {
  const { data: meeting, error } = await supabaseAdmin
    .from("meetings")
    .select(meetingSelect)
    .eq("meeting_type", "instant")
    .eq("meeting_slug", meetingCode)
    .maybeSingle<MeetingRow>();

  if (error || !meeting) {
    return { error: error ?? new Error("Meeting not found"), status: 404 as const };
  }

  const role: MeetingRole = meeting.created_by === userId ? "host" : "guest";

  return {
    meeting: mapMeeting(meeting as unknown as Record<string, unknown>),
    role,
  };
};

export const findMeetingByIdentifier = async (identifier: string) => {
  const { data: byId } = await supabaseAdmin.from("meetings").select(meetingSelect).eq("id", identifier).maybeSingle<MeetingRow>();

  if (byId) {
    return mapMeeting(byId as unknown as Record<string, unknown>);
  }

  const { data: bySlug, error } = await supabaseAdmin
    .from("meetings")
    .select(meetingSelect)
    .eq("meeting_slug", identifier)
    .maybeSingle<MeetingRow>();

  if (error || !bySlug) {
    return null;
  }

  return mapMeeting(bySlug as unknown as Record<string, unknown>);
};

export const createInstantMeeting = async ({
  userId,
  title,
}: {
  userId: string;
  title?: string;
}) => {
  const meetingSlug = createMeetingSlug("instant");
  const roomName = createRoomName(meetingSlug);
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("meetings")
    .insert({
      organization_id: null,
      channel_id: null,
      title: title?.trim() || "Instant meeting",
      description: null,
      status: "live",
      scheduled_at: null,
      thumbnail_url: null,
      created_by: userId,
      created_at: now,
      meeting_slug: meetingSlug,
      room_name: roomName,
      ended_at: null,
      meeting_type: "instant",
    })
    .select(meetingSelect)
    .single<MeetingRow>();

  if (error || !data) {
    throw error ?? new Error("Failed to create instant meeting");
  }

  return mapMeeting(data as unknown as Record<string, unknown>);
};

export const markMeetingLive = async (meetingId: string) => {
  return supabaseAdmin.from("meetings").update({ status: "live" }).eq("id", meetingId);
};

export const endMeeting = async (meetingId: string, endedBy: string) => {
  const meeting = await findMeetingByIdentifier(meetingId);

  if (!meeting) {
    return { error: new Error("Meeting not found"), status: 404 as const };
  }

  const { error: updateError } = await supabaseAdmin
    .from("meetings")
    .update({ status: "ended", ended_at: new Date().toISOString() })
    .eq("id", meeting.id);

  if (updateError) {
    return { error: updateError, status: 500 as const };
  }

  await supabaseAdmin
    .from("meeting_participants")
    .update({ left_at: new Date().toISOString() })
    .eq("meeting_id", meeting.id)
    .is("left_at", null);

  return { meeting, endedBy };
};

export const resolveChannelSlug = (channelName: string) => createChannelSlug(channelName);
