import type { Request, Response } from "express";

import { endMeeting, findMeetingByIdentifier, markMeetingLive } from "@/apps/intellmeet/services/meeting.service";
import { sendError, sendOk } from "@/utils/response";

type AuthedRequest = Request & { user?: { id: string } };

const getParam = (req: Request, name: string) => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const joinMeeting = async (req: AuthedRequest, res: Response) => {
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

    if (meeting.status === "ended") {
      return sendError(res, 409, "Meeting has ended");
    }

    await markMeetingLive(meeting.id);

    return sendOk(res, { meeting });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to join meeting");
  }
};

export const endMeetingHandler = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const meetingId = getParam(req, "meetingId");

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    const result = await endMeeting(meetingId, userId);

    if ("error" in result) {
      return sendError(res, result.status ?? 500, result.error?.message ?? "Failed to end meeting");
    }

    return sendOk(res, result);
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to end meeting");
  }
};
