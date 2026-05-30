import { createClient, type SupabaseClient } from "@supabase/supabase-js";

declare const __INTELLMEET_SUPABASE_URL__: string | undefined;
declare const __INTELLMEET_SUPABASE_ANON_KEY__: string | undefined;

const isBrowser = typeof window !== 'undefined';
const STORAGE_KEY = 'intellmeet-auth-token';
const CHUNK_SIZE = 3000;
const nextSupabaseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL : undefined;
const nextSupabaseKey = typeof process !== 'undefined'
  ? (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  : undefined;

let viteSupabaseUrl: string | undefined;
let viteSupabaseKey: string | undefined;
const injectedSupabaseUrl =
  typeof __INTELLMEET_SUPABASE_URL__ !== "undefined"
    ? __INTELLMEET_SUPABASE_URL__
    : undefined;
const injectedSupabaseKey =
  typeof __INTELLMEET_SUPABASE_ANON_KEY__ !== "undefined"
    ? __INTELLMEET_SUPABASE_ANON_KEY__
    : undefined;
try {
  const viteEnv = typeof import.meta !== 'undefined' ? (import.meta as any)?.env : undefined;
  viteSupabaseUrl = viteEnv?.VITE_SUPABASE_URL;
  viteSupabaseKey = viteEnv?.VITE_SUPABASE_ANON_KEY || viteEnv?.VITE_SUPABASE_PUBLISHABLE_KEY;
} catch {
  viteSupabaseUrl = undefined;
  viteSupabaseKey = undefined;
}

export interface CreateWraithSupabaseClientOptions {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  storageKey?: string;
}

const logMissingEnvOnce = (supabaseUrl?: string, supabaseAnonKey?: string) => {
  if (supabaseUrl && supabaseAnonKey) return;
  if (typeof window === 'undefined') return;

  const warnedKey = '__INTELLMEET_SUPABASE_ENV_WARNED__';
  const warned = (window as unknown as Record<string, boolean>)[warnedKey];
  if (!warned) {
    console.error("Supabase environment variables are missing!", {
      url: !!supabaseUrl,
      key: !!supabaseAnonKey,
    });
    (window as unknown as Record<string, boolean>)[warnedKey] = true;
  }
};

const resolveSupabaseConfig = (options: CreateWraithSupabaseClientOptions = {}) => {
  const supabaseUrl = options.supabaseUrl || nextSupabaseUrl || viteSupabaseUrl || injectedSupabaseUrl;
  const supabaseAnonKey = options.supabaseAnonKey || nextSupabaseKey || viteSupabaseKey || injectedSupabaseKey;
  logMissingEnvOnce(supabaseUrl, supabaseAnonKey);
  return {
    supabaseUrl,
    supabaseAnonKey,
    storageKey: options.storageKey || STORAGE_KEY,
  };
};

const parseCookieNumber = (cookie: string | undefined): number => {
  if (!cookie) return 0;
  const raw = cookie.split('=')[1];
  if (!raw) return 0;
  const num = Number.parseInt(raw, 10);
  return Number.isFinite(num) && num > 0 ? num : 0;
};

const encodeValue = (value: string) => encodeURIComponent(value);

const decodeValue = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};

const clearCookieState = (key: string) => {
  if (!isBrowser) return;
  const cookies = document.cookie.split(';');
  document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  const chunkCountMatch = cookies.find(row => row.trim().startsWith(`${key}-chunks=`));
  const count = parseCookieNumber(chunkCountMatch);
  if (count > 0) {
    for (let i = 0; i < count; i++) {
      document.cookie = `${key}.${i}=; path=/; max-age=0; SameSite=Lax`;
    }
    document.cookie = `${key}-chunks=; path=/; max-age=0; SameSite=Lax`;
  }
  for (let i = 0; i < 10; i++) {
    document.cookie = `${key}.${i}=; path=/; max-age=0; SameSite=Lax`;
  }
};

const cookieStorage = {
  getItem: (key: string) => {
    if (!isBrowser) return null;
    const cookies = document.cookie.split(';').map(c => c.trim());
    const chunkCountMatch = cookies.find(row => row.startsWith(`${key}-chunks=`));
    const count = parseCookieNumber(chunkCountMatch);
    if (count > 0) {
      let combinedValue = '';
      for (let i = 0; i < count; i++) {
        const chunkMatch = cookies.find(row => row.startsWith(`${key}.${i}=`));
        if (chunkMatch) {
          const parts = chunkMatch.split('=');
          parts.shift();
          combinedValue += parts.join('=');
        }
      }
      if (combinedValue) {
        const decoded = decodeValue(combinedValue);
        if (decoded) {
          return decoded;
        }
      }
    }

    const matches = cookies.filter(row => row.startsWith(`${key}=`));
    if (matches.length > 0) {
      for (const row of matches) {
        const parts = row.split('=');
        parts.shift();
        const value = parts.join('=');
        if (value && value !== 'undefined' && value !== 'null') {
          const decoded = decodeValue(value);
          if (decoded) {
            return decoded;
          }
        }
      }
    }

    return localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (!isBrowser) return;

    localStorage.setItem(key, value);

    const encoded = encodeValue(value);
    clearCookieState(key);

    if (encoded.length > CHUNK_SIZE) {
      const count = Math.ceil(encoded.length / CHUNK_SIZE);
      for (let i = 0; i < count; i++) {
        const start = i * CHUNK_SIZE;
        const chunk = encoded.substring(start, start + CHUNK_SIZE);
        document.cookie = `${key}.${i}=${chunk}; path=/; max-age=31104000; SameSite=Lax`;
      }
      document.cookie = `${key}-chunks=${count}; path=/; max-age=31104000; SameSite=Lax`;
    } else {
      document.cookie = `${key}=${encoded}; path=/; max-age=31104000; SameSite=Lax`;
    }
  },
  removeItem: (key: string) => {
    if (!isBrowser) return;

    localStorage.removeItem(key);
    clearCookieState(key);
  },
};

export const clearWraithAuthStorage = (key: string = STORAGE_KEY) => {
  if (!isBrowser) return;

  localStorage.removeItem(key);
  clearCookieState(key);
};

export const createWraithSupabaseClient = (
  options: CreateWraithSupabaseClientOptions = {}
): SupabaseClient => {
  const { supabaseUrl, supabaseAnonKey, storageKey } = resolveSupabaseConfig(options);

  return createClient(
    supabaseUrl!,
    supabaseAnonKey!,
    {
      auth: {
        storage: isBrowser ? cookieStorage : undefined,
        storageKey,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      }
    }
  );
};

export const supabase = createWraithSupabaseClient();