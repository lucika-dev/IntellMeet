import { supabaseAdmin } from "@wraith/auth/server";

import type { MeetingRole } from "@/apps/intellmeet/types/meeting";

export const upsertParticipantJoin = async ({
  meetingId,
  userId,
  role,
}: {
  meetingId: string;
  userId: string;
  role: MeetingRole;
}) => {
  const now = new Date().toISOString();

  return supabaseAdmin
    .from("meeting_participants")
    .upsert(
      {
        meeting_id: meetingId,
        user_id: userId,
        role,
        joined_at: now,
        left_at: null,
      },
      { onConflict: "meeting_id,user_id" },
    )
    .select("id, meeting_id, user_id, joined_at, left_at, role")
    .single();
};

export const markParticipantLeft = async ({ meetingId, userId }: { meetingId: string; userId: string }) => {
  return supabaseAdmin
    .from("meeting_participants")
    .update({ left_at: new Date().toISOString() })
    .eq("meeting_id", meetingId)
    .eq("user_id", userId)
    .is("left_at", null);
};
