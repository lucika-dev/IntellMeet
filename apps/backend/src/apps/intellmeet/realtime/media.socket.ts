import type { Server } from "socket.io";

import { redis, getRedisKey } from "@/config/redis";

const getMediaKey = (meetingId: string) => getRedisKey("intellmeet", "meeting", meetingId, "media");

export const initializeMediaSockets = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on(
      "meeting:media-state",
      async ({ meetingId, userId, micEnabled, cameraEnabled, screenSharing }: { meetingId: string; userId: string; micEnabled: boolean; cameraEnabled: boolean; screenSharing: boolean }) => {
        if (redis) {
          await redis.hset(
            getMediaKey(meetingId),
            userId,
            JSON.stringify({ meetingId, userId, micEnabled, cameraEnabled, screenSharing }),
          );
        }

        socket.to(meetingId).emit("meeting:media-state-updated", {
          meetingId,
          userId,
          micEnabled,
          cameraEnabled,
          screenSharing,
        });
      },
    );
  });
};
