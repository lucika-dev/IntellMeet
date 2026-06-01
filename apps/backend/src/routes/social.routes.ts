import { Router } from "express";
import { authMiddleware } from "@wraith/auth/server";

import {
  acceptRequest,
  declineRequest,
  getDirectConversation,
  getFriendRequests,
  getFriends,
  getMessages,
  searchUsers,
  sendFriendRequest,
} from "@/controllers/social.controller";

const router = Router();

router.get("/friends", authMiddleware, getFriends);
router.get("/friend-requests", authMiddleware, getFriendRequests);
router.get("/users/search", authMiddleware, searchUsers);
router.post("/friend-requests", authMiddleware, sendFriendRequest);
router.post("/friend-requests/:requestId/accept", authMiddleware, acceptRequest);
router.delete("/friend-requests/:requestId", authMiddleware, declineRequest);
router.post("/direct-conversations", authMiddleware, getDirectConversation);
router.get("/conversations/:conversationId/messages", authMiddleware, getMessages);

export default router;
