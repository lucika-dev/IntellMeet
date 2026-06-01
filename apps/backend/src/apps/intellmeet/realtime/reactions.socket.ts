import type { Server } from "socket.io";

export const initializeReactionSockets = (io: Server) => {
  io.on("connection", (socket) => {
    socket.on("meeting:reaction", (payload: { meetingId: string; userId: string; emoji: string }) => {
      socket.to(payload.meetingId).emit("meeting:reaction:created", payload);
    });
  });
};
