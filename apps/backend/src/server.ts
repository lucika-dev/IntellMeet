import "dotenv/config";
import http from "node:http";
import { Server } from "socket.io";
import { supabaseAdmin } from "@wraith/auth/server";
import { app } from "./app";
import { env } from "@/config/env";
import { initializeMeetingSockets } from "@/apps/intellmeet/realtime/meeting.socket";
import { initializeMediaSockets } from "@/apps/intellmeet/realtime/media.socket";
import { initializeReactionSockets } from "@/apps/intellmeet/realtime/reactions.socket";
import { initializeChatSockets } from "@/sockets/chat.socket";

const PORT = env.PORT || 5000;

async function runSupabasePreflight() {
  const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);

  if (error) {
    return;
  }
}

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean),
    credentials: true,
  },
});

initializeMeetingSockets(io);
initializeMediaSockets(io);
initializeReactionSockets(io);
initializeChatSockets(io);

runSupabasePreflight().finally(() => {
  httpServer.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
});
