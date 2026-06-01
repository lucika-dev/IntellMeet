import { Router } from "express";

import { authMiddleware } from "@wraith/auth/server";

import { endMeetingHandler, joinMeeting } from "@/apps/intellmeet/controllers/meeting.controller";

const router = Router();

router.post("/:meetingId/join", authMiddleware, joinMeeting);
router.post("/:meetingId/end", authMiddleware, endMeetingHandler);

export default router;
