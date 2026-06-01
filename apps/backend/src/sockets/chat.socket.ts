import type { Server, Socket } from "socket.io";
import { verifyToken } from "@wraith/auth/server";

import { assertConversationMember, createConversationMessage } from "@/services/social.service";

type ChatSocket = Socket & {
  data: {
    userId?: string;
  };
};

const getToken = (socket: Socket) => {
  const token = socket.handshake.auth?.token;
  return typeof token === "string" ? token : null;
};

const getRoomName = (conversationId: string) => `chat:${conversationId}`;

const ensureUserId = async (socket: ChatSocket) => {
  if (socket.data.userId) {
    return socket.data.userId;
  }

  const token = getToken(socket);

  if (!token) {
    return null;
  }

  const user = await verifyToken(token);

  if (!user) {
    return null;
  }

  socket.data.userId = user.id;

  return user.id;
};

export const initializeChatSockets = (io: Server) => {
  io.on("connection", (socket: ChatSocket) => {
    socket.on("chat:conversation:join", async ({ conversationId }: { conversationId: string }) => {
      try {
        const userId = await ensureUserId(socket);

        if (!userId || !conversationId) {
          return;
        }

        await assertConversationMember(userId, conversationId);
        socket.join(getRoomName(conversationId));
        socket.emit("chat:conversation:joined", { conversationId });
      } catch {
        socket.emit("chat:error", { message: "Unable to join conversation" });
      }
    });

    socket.on("chat:message:send", async ({ conversationId, body }: { conversationId: string; body: string }) => {
      try {
        const userId = await ensureUserId(socket);

        if (!userId || !conversationId) {
          return;
        }

        const message = await createConversationMessage(userId, conversationId, body);
        io.to(getRoomName(conversationId)).emit("chat:message:new", message);
      } catch {
        socket.emit("chat:error", { message: "Unable to send message" });
      }
    });
  });
};
