import { create } from 'zustand';
import { buildAuthLoginUrl, clearWraithAuthStorage, supabase } from '@wraith/auth/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

const STORAGE_KEY = 'intellmeet-auth-token';
const APP_ORIGIN = (import.meta.env.VITE_APP_ORIGIN as string | undefined) || 'http://localhost:3000';
const API_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:5000/api';

interface AuthState {
  isAuthenticated: boolean;
  user: { 
    id: string; 
    name: string; 
    email: string; 
    role: string;
    avatarUrl?: string | null;
  } | null;
  loading: boolean;
  setUser: (user: any) => void;
  switchAccount: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  loading: true,
  setUser: (user) => {
    if (user) {
      const userData = {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email!,
        role: user.user_metadata?.role || 'account',
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      };

      set({
        isAuthenticated: true,
        user: userData,
        loading: false,
      });
    } else {
      set({ isAuthenticated: false, user: null, loading: false }); 
    }
  },
  switchAccount: async () => {
    clearWraithAuthStorage();
    set({ isAuthenticated: false, user: null, loading: false });
    window.location.href = buildAuthLoginUrl(APP_ORIGIN, undefined, 'select_account');
  },
  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        useAuthStore.getState().setUser(session.user);
      } else {
        set({ isAuthenticated: false, user: null, loading: false });
      }
    } catch (error) {
      console.error('Session check error:', error);
      set({ isAuthenticated: false, user: null, loading: false });
    }
  },
}));

const initAuth = async () => {
  await new Promise(r => setTimeout(r, 200));

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      useAuthStore.getState().setUser(session.user);
    } else {
      const hasCookie = document.cookie.includes(STORAGE_KEY);
      const hasChunks = document.cookie.includes(`${STORAGE_KEY}-chunks`);
      const hasLocalStorage = localStorage.getItem(STORAGE_KEY) !== null;
      if ((hasCookie || hasChunks || hasLocalStorage) && !session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) useAuthStore.getState().setUser(user);
      }
      if (!hasCookie && !hasChunks && !hasLocalStorage && !session) {
        useAuthStore.getState().setUser(null);
      }
    }
  } catch (error) {
    console.error('Auth initialization failure', error);
    useAuthStore.getState().setUser(null);
  }

  supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
    if (session?.user) {
      useAuthStore.getState().setUser(session.user);
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        try {
          await fetch(`${API_URL}/auth/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (err) {
          console.error('INIT_AUTH: Sync failed', err);
        }
      }
    } else if (event === 'SIGNED_OUT') {
      useAuthStore.getState().setUser(null);
    }
  });
};

initAuth();
