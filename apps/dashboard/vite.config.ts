import { defineConfig } from "vite";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      __INTELLMEET_SUPABASE_URL__: JSON.stringify(env.VITE_SUPABASE_URL ?? ""),
      __INTELLMEET_SUPABASE_ANON_KEY__: JSON.stringify(env.VITE_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_PUBLISHABLE_KEY ?? ""),
    },
    server: {
      port: 5173,
    },
  };
});