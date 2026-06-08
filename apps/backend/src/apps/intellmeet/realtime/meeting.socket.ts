import type { Server, Socket } from "socket.io";

import { redis, getRedisKey } from "@/config/redis";

type MeetingPresence = {
  meetingId: string;
  userId: string;
  name: string;
  role: string;
  micEnabled: boolean;
  cameraEnabled: boolean;
  screenSharing: boolean;
  activeSpeaker: boolean;
  joinedAt: string;
};

const getPresenceKey = (meetingId: string) => getRedisKey("intellmeet", "meeting", meetingId, "presence");

const emitPresenceSnapshot = async (io: Server, meetingId: string) => {
  if (!redis) {
    return;
  }

  const snapshot = await redis.hgetall(getPresenceKey(meetingId));
  const participants = Object.values(snapshot).map((entry) => JSON.parse(entry) as MeetingPresence);

  io.to(meetingId).emit("meeting:presence:snapshot", { meetingId, participants });
};

const upsertPresence = async (socket: Socket, payload: MeetingPresence) => {
  if (!redis) {
    return;
  }

  await redis.hset(getPresenceKey(payload.meetingId), payload.userId, JSON.stringify(payload));
  socket.to(payload.meetingId).emit("meeting:presence:updated", payload);
};

const removePresence = async (io: Server, meetingId: string, userId: string) => {
  if (!redis) {
    io.to(meetingId).emit("meeting:presence:left", { meetingId, userId });
    return;
  }

  await redis.hdel(getPresenceKey(meetingId), userId);
  io.to(meetingId).emit("meeting:presence:left", { meetingId, userId });
};

export const initializeMeetingSockets = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("meeting:join", async (payload: MeetingPresence) => {
      socket.data.meetingId = payload.meetingId;
      socket.data.userId = payload.userId;
      socket.join(payload.meetingId);
      await upsertPresence(socket, payload);
      await emitPresenceSnapshot(io, payload.meetingId);
    });

    socket.on("meeting:state", async (payload: MeetingPresence) => {
      socket.data.meetingId = payload.meetingId;
      socket.data.userId = payload.userId;
      socket.join(payload.meetingId);
      await upsertPresence(socket, payload);
    });

    socket.on("meeting:leave", async ({ meetingId, userId }: { meetingId: string; userId: string }) => {
      await removePresence(io, meetingId, userId);
      await emitPresenceSnapshot(io, meetingId);
    });

    socket.on("disconnect", async () => {
      const meetingId = socket.data.meetingId as string | undefined;
      const userId = socket.data.userId as string | undefined;

      if (meetingId && userId) {
        await removePresence(io, meetingId, userId);
        await emitPresenceSnapshot(io, meetingId);
      }
    });
  });
};
