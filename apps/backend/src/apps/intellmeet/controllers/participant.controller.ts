import type { Request, Response } from "express";

import { markParticipantLeft, upsertParticipantJoin } from "@/apps/intellmeet/services/participant.service";
import { findMeetingByIdentifier } from "@/apps/intellmeet/services/meeting.service";
import { sendError, sendOk } from "@/utils/response";

type AuthedRequest = Request & { user?: { id: string } };

const getParam = (req: Request, name: string) => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const joinParticipant = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const meetingId = getParam(req, "meetingId");

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const meeting = await findMeetingByIdentifier(meetingId);

    if (!meeting) {
      return sendError(res, 404, "Meeting not found");
    }

    const result = await upsertParticipantJoin({
      meetingId: meeting.id,
      userId,
      role: meeting.created_by === userId ? "host" : "guest",
    });

    if (result.error) {
      return sendError(res, 500, result.error.message);
    }

    return sendOk(res, { participant: result.data });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to join participant");
  }
};

export const leaveParticipant = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const meetingId = getParam(req, "meetingId");

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const meeting = await findMeetingByIdentifier(meetingId);

    if (!meeting) {
      return sendError(res, 404, "Meeting not found");
    }

    const result = await markParticipantLeft({
      meetingId: meeting.id,
      userId,
    });

    if (result.error) {
      return sendError(res, 500, result.error.message);
    }

    return sendOk(res, { ok: true });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to leave participant");
  }
};
