import type { Request, Response } from "express";
import { supabaseAdmin } from "@wraith/auth/server";

import { createLiveKitAccessToken } from "@/apps/intellmeet/services/livekit.service";
import { createInstantMeeting, findMeetingByIdentifier, resolveInstantMeeting, resolveOrganizationMeeting } from "@/apps/intellmeet/services/meeting.service";
import { env } from "@/config/env";
import { sendError, sendOk } from "@/utils/response";

type AuthedRequest = Request & { user?: { id: string; email?: string } };

const getUserProfileName = async (userId: string) => {
  const { data } = await supabaseAdmin.from("profiles").select("name, google_photo, user_photo, avatar_url").eq("id", userId).maybeSingle<{ name: string | null; google_photo: string | null; user_photo: string | null; avatar_url: string | null }>();

  return {
    name: data?.name || "Participant",
    avatarUrl: data?.user_photo || data?.google_photo || data?.avatar_url || null,
  };
};

export const createToken = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { meetingId, meetingSlug, orgSlug, channelSlug, meetingCode } = req.body ?? {};

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const profile = await getUserProfileName(userId);

    if (meetingCode) {
      const resolution = await resolveInstantMeeting(String(meetingCode), userId);

      if ("error" in resolution) {
        return sendError(res, resolution.status ?? 500, resolution.error?.message ?? "Meeting not found");
      }

      const token = createLiveKitAccessToken({
        roomName: resolution.meeting.room_name,
        identity: userId,
        participantName: profile.name,
        metadata: {
          userId,
          meetingId: resolution.meeting.id,
          meetingSlug: resolution.meeting.meeting_slug,
          meetingType: resolution.meeting.meeting_type,
          avatarUrl: profile.avatarUrl,
        },
      });

      return sendOk(res, {
        meeting: resolution.meeting,
        roomName: resolution.meeting.room_name,
        liveKitUrl: env.LIVEKIT_URL,
        identity: userId,
        participantName: profile.name,
        accessToken: token,
        participantRole: resolution.role,
      });
    }

    if (orgSlug && channelSlug && meetingSlug) {
      const resolution = await resolveOrganizationMeeting({
        orgSlug: String(orgSlug),
        channelSlug: String(channelSlug),
        meetingSlug: String(meetingSlug),
        userId,
      });

      if ("error" in resolution) {
        return sendError(res, resolution.status ?? 500, resolution.error?.message ?? "Meeting not found");
      }

      const token = createLiveKitAccessToken({
        roomName: resolution.meeting.room_name,
        identity: userId,
        participantName: profile.name,
        metadata: {
          userId,
          meetingId: resolution.meeting.id,
          organizationId: resolution.meeting.organization_id,
          channelId: resolution.meeting.channel_id,
          meetingSlug: resolution.meeting.meeting_slug,
          meetingType: resolution.meeting.meeting_type,
          avatarUrl: profile.avatarUrl,
        },
      });

      return sendOk(res, {
        meeting: resolution.meeting,
        roomName: resolution.meeting.room_name,
        liveKitUrl: env.LIVEKIT_URL,
        identity: userId,
        participantName: profile.name,
        accessToken: token,
        participantRole: resolution.role,
      });
    }

    if (meetingId) {
      const meeting = await findMeetingByIdentifier(String(meetingId));

      if (!meeting) {
        return sendError(res, 404, "Meeting not found");
      }

      const token = createLiveKitAccessToken({
        roomName: meeting.room_name,
        identity: userId,
        participantName: profile.name,
        metadata: {
          userId,
          meetingId: meeting.id,
          meetingSlug: meeting.meeting_slug,
          meetingType: meeting.meeting_type,
          avatarUrl: profile.avatarUrl,
        },
      });

      return sendOk(res, {
        meeting,
        roomName: meeting.room_name,
        liveKitUrl: env.LIVEKIT_URL,
        identity: userId,
        participantName: profile.name,
        accessToken: token,
        participantRole: meeting.created_by === userId ? "host" : "guest",
      });
    }

    return sendError(res, 400, "Missing meeting identifiers");
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to create LiveKit token");
  }
};

export const createInstantMeetingHandler = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const title = typeof req.body?.title === "string" ? req.body.title : undefined;
    const meeting = await createInstantMeeting({ userId, title });
    const profile = await getUserProfileName(userId);

    const token = createLiveKitAccessToken({
      roomName: meeting.room_name,
      identity: userId,
      participantName: profile.name,
      metadata: {
        userId,
        meetingId: meeting.id,
        meetingSlug: meeting.meeting_slug,
        meetingType: meeting.meeting_type,
        avatarUrl: profile.avatarUrl,
      },
    });

    return sendOk(res, {
      meeting,
      roomName: meeting.room_name,
      liveKitUrl: env.LIVEKIT_URL,
      identity: userId,
      participantName: profile.name,
      participantRole: "host",
      accessToken: token,
    }, 201);
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to create instant meeting");
  }
};
