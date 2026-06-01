import express from "express";
import cors from "cors";
import helmet from "helmet";
import userRoutes from "@/routes/user.routes";
import authRoutes from "@/routes/auth.routes";
import socialRoutes from "@/routes/social.routes";
import livekitRoutes from "@/apps/intellmeet/routes/livekit.routes";
import meetingRoutes from "@/apps/intellmeet/routes/meeting.routes";
import participantRoutes from "@/apps/intellmeet/routes/participant.routes";

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/intellmeet/livekit", livekitRoutes);
app.use("/api/intellmeet/meetings", meetingRoutes);
app.use("/api/intellmeet/participants", participantRoutes);

app.get("/", (_req, res) => {
  res.send("IntellMeet Backend Running");
});

export { app };
