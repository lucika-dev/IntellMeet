"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabaseClient";

const DEFAULT_DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:5173/dashboard";
const ALLOWED_RETURN_HOSTS = (process.env.NEXT_PUBLIC_ALLOWED_RETURN_TO_HOSTS || "")
  .split(",")
  .map((h) => h.trim())
  .filter(Boolean);
const CALLBACK_GUARD_KEY_PREFIX = "auth-callback-guard:";
const CALLBACK_GUARD_TTL_MS = 10000;

const resolveSafeReturnUrl = (candidate: string | null) => {
  if (!candidate) return DEFAULT_DASHBOARD_URL;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return DEFAULT_DASHBOARD_URL;
    if (ALLOWED_RETURN_HOSTS.length === 0) return candidate;
    if (ALLOWED_RETURN_HOSTS.includes(parsed.host)) return candidate;
    return DEFAULT_DASHBOARD_URL;
  } catch {
    return DEFAULT_DASHBOARD_URL;
  }
};

export default function CallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const guardKey = `${CALLBACK_GUARD_KEY_PREFIX}${window.location.pathname}${window.location.search}`;
      const previousRun = Number(sessionStorage.getItem(guardKey) || "0");
      const now = Date.now();
      if (previousRun && now - previousRun < CALLBACK_GUARD_TTL_MS) {
        return;
      }
      sessionStorage.setItem(guardKey, String(now));

      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const hashAccessToken = hash.get("access_token");
      const hashRefreshToken = hash.get("refresh_token");

      if (hashAccessToken && hashRefreshToken) {
        const { error: setSessionError } = await supabaseClient.auth.setSession({
          access_token: hashAccessToken,
          refresh_token: hashRefreshToken,
        });
        if (setSessionError) {
          console.error("CallbackPage: setSession failed", setSessionError.message);
        } else {
          const cleanUrl = `${window.location.pathname}${window.location.search}`;
          window.history.replaceState(null, "", cleanUrl);
        }
      }

      await new Promise(r => setTimeout(r, 300));

      const params = new URLSearchParams(window.location.search);
      const returnTo = resolveSafeReturnUrl(params.get("return_to"));

      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (!session) {
        console.error("Auth failed: No session after timeout");
        return router.replace("/?auth=failed");
      }

      await fetch("/api/auth/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      try {
        const userRes = await fetch("/api/user/me", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        const userData = await userRes.json();

        if (userData?.profile?.profile_status === 'active') {
          window.location.href = returnTo;
          return;
        }
      } catch {
      }

      router.replace(`/onboarding?return_to=${encodeURIComponent(returnTo)}`);
    };

    run();
  }, [router]);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-background">
      <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center gap-5 rounded-2xl border border-border/40 bg-background/70 px-10 py-8 shadow-2xl backdrop-blur-xl">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute h-14 w-14 rounded-full border border-red-500/20" />

          <div className="absolute h-14 w-14 animate-spin rounded-full border-2 border-transparent border-t-red-500 border-r-red-400" />

          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500 shadow-[0_0_18px_rgba(239,68,68,0.9)]" />
        </div>

        <div className="space-y-1 text-center">
          <h1 className="text-lg font-semibold tracking-tight text-foreground">
            Signing you in...
          </h1>

          <p className="text-sm text-muted-foreground">
            Syncing your session securely
          </p>
        </div>
      </div>
    </div>
  );
}