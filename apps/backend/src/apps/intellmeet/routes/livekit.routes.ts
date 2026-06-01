import { Router } from "express";

import { authMiddleware } from "@wraith/auth/server";

import { createInstantMeetingHandler, createToken } from "@/apps/intellmeet/controllers/livekit.controller";

const router = Router();

router.post("/token", authMiddleware, createToken);
router.post("/meeting/instant", authMiddleware, createInstantMeetingHandler);

export default router;
