import { supabase } from "./supabase";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function getSession(client: SupabaseClient = supabase) {
  const {
    data: { session },
  } = await client.auth.getSession();

  return session;
}