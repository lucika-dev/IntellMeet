import { getSession } from "./session";
import type { SupabaseClient } from "@supabase/supabase-js";

export const resolveAuthOrigin = (authOrigin?: string) => {
  if (authOrigin) return authOrigin;
  const nextVal = typeof process !== "undefined" ? process.env.NEXT_PUBLIC_AUTH_ORIGIN : undefined;
  if (nextVal) return nextVal;
  try {
    const viteVal = typeof import.meta !== "undefined" ? (import.meta as any)?.env?.VITE_AUTH_ORIGIN : undefined;
    if (viteVal) return viteVal;
  } catch {
  }
  return "https://auth.wraithorg.com";
};

export interface BuildAuthLoginUrlOptions {
  returnTo?: string;
  authOrigin?: string;
  prompt?: "select_account" | "consent" | "none";
}

export function buildAuthLoginUrl(
  returnTo?: string,
  authOrigin?: string,
  prompt?: BuildAuthLoginUrlOptions["prompt"]
) {
  const resolvedOrigin = resolveAuthOrigin(authOrigin).replace(/\/+$/, "");
  const finalReturnTo = returnTo || window.location.href;
  const promptQuery = prompt ? `&prompt=${encodeURIComponent(prompt)}` : "";
  return `${resolvedOrigin}/login?return_to=${encodeURIComponent(finalReturnTo)}${promptQuery}`;
}

export interface RequireAuthOptions {
  client?: SupabaseClient;
  returnTo?: string;
  authOrigin?: string;
  prompt?: BuildAuthLoginUrlOptions["prompt"];
}

export async function requireAuth(options: RequireAuthOptions = {}) {
  const session = await getSession(options.client);

  if (!session) {
    window.location.href = buildAuthLoginUrl(options.returnTo, options.authOrigin, options.prompt);
  }

  return session;
}