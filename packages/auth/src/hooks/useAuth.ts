import { useSession } from "./useSession";

export function useAuth() {
  const { session, loading } = useSession();

  return {
    user: session?.user ?? null,
    session,
    loading,
    authenticated: !!session,
  };
}