import { Router } from "express";

import { authMiddleware } from "@wraith/auth/server";

import { joinParticipant, leaveParticipant } from "@/apps/intellmeet/controllers/participant.controller";

const router = Router();

router.post("/:meetingId/join", authMiddleware, joinParticipant);
router.post("/:meetingId/leave", authMiddleware, leaveParticipant);

export default router;
