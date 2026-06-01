import type { Request, Response } from "express";

import {
  acceptFriendRequest,
  createFriendRequest,
  declineFriendRequest,
  ensureDirectConversation,
  listConversationMessages,
  listFriendRequests,
  listFriends,
  searchProfiles,
} from "@/services/social.service";
import { sendError, sendOk } from "@/utils/response";

type AuthedRequest = Request & { user?: { id: string; email?: string } };

const getUserId = (req: AuthedRequest) => req.user?.id ?? null;
const getParam = (req: Request, name: string) => {
  const value = req.params[name];
  return Array.isArray(value) ? value[0] : value;
};

export const getFriends = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    return sendOk(res, {
      friends: await listFriends(userId),
    });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to load friends");
  }
};

export const getFriendRequests = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    return sendOk(res, await listFriendRequests(userId));
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to load friend requests");
  }
};

export const searchUsers = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const query = String(req.query.q ?? "");

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    return sendOk(res, {
      users: await searchProfiles(userId, query),
    });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to search users");
  }
};

export const sendFriendRequest = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const addresseeId = typeof req.body?.addresseeId === "string" ? req.body.addresseeId : "";

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!addresseeId) {
      return sendError(res, 400, "Missing addressee");
    }

    return sendOk(res, {
      friendship: await createFriendRequest(userId, addresseeId),
    }, 201);
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to send friend request");
  }
};

export const acceptRequest = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    return sendOk(res, {
      friendship: await acceptFriendRequest(userId, getParam(req, "requestId")),
    });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to accept friend request");
  }
};

export const declineRequest = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    await declineFriendRequest(userId, getParam(req, "requestId"));

    return sendOk(res, {
      ok: true,
    });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to decline friend request");
  }
};

export const getDirectConversation = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getUserId(req);
    const friendId = typeof req.body?.friendId === "string" ? req.body.friendId : "";

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    if (!friendId) {
      return sendError(res, 400, "Missing friend");
    }

    return sendOk(res, {
      conversation: await ensureDirectConversation(userId, friendId, userId),
    });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to load conversation");
  }
};

export const getMessages = async (req: AuthedRequest, res: Response) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return sendError(res, 401, "Unauthorized");
    }

    return sendOk(res, {
      messages: await listConversationMessages(userId, getParam(req, "conversationId")),
    });
  } catch (error: any) {
    return sendError(res, 500, error?.message || "Failed to load messages");
  }
};
