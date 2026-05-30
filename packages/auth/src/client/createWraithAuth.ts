import type { Session, SupabaseClient } from "@supabase/supabase-js";
import {
  createWraithSupabaseClient,
  clearWraithAuthStorage,
  type CreateWraithSupabaseClientOptions,
} from "./supabase";
import { buildAuthLoginUrl, requireAuth } from "./guards";
import { getSession } from "./session";

export interface CreateWraithAuthOptions extends CreateWraithSupabaseClientOptions {
  authOrigin?: string;
}

export interface WraithAuth {
  supabase: SupabaseClient;
  getSession: () => Promise<Session | null>;
  requireAuth: (returnTo?: string) => Promise<Session | null>;
  buildLoginUrl: (returnTo?: string) => string;
  redirectToLogin: (returnTo?: string) => void;
  signOut: (options?: { global?: boolean; returnTo?: string; switchAccount?: boolean }) => Promise<void>;
}

export const createWraithAuth = (
  options: CreateWraithAuthOptions = {}
): WraithAuth => {
  const client = createWraithSupabaseClient(options);
  const authOrigin = options.authOrigin;

  return {
    supabase: client,
    getSession: () => getSession(client),
    requireAuth: (returnTo?: string) =>
      requireAuth({ client, returnTo, authOrigin }),
    buildLoginUrl: (returnTo?: string) =>
      buildAuthLoginUrl(returnTo, authOrigin),
    redirectToLogin: (returnTo?: string) => {
      window.location.href = buildAuthLoginUrl(returnTo, authOrigin);
    },
    signOut: async (options = {}) => {
      if (options.global) {
        await client.auth.signOut();
        return;
      }

      clearWraithAuthStorage();

      if (options.switchAccount) {
        window.location.href = buildAuthLoginUrl(options.returnTo, authOrigin, "select_account");
      }
    },
  };
};
