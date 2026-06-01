import crypto from "node:crypto";

import type { MeetingType } from "@/apps/intellmeet/types/meeting";

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64) || "meeting";

export const createMeetingSlug = (prefix: MeetingType) =>
  `${prefix}-${crypto.randomBytes(5).toString("hex")}`;

export const createChannelSlug = (name: string) => slugify(name);

export const createRoomName = (meetingSlug: string) => `lk-${meetingSlug}`;
