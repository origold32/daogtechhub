// supabase/client.ts
// Browser-side Supabase client — singleton.
// Handles both PKCE (code) and implicit (hash) OAuth flows.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let _instance: ReturnType<typeof createBrowserClient<Database>> | null = null;

export const createClient = () => {
  if (_instance) return _instance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
    );
  }

  // detectSessionInUrl: false — we handle the code/hash manually in /auth/verifying
  // so the client doesn't auto-consume the code and interfere with our flow
  _instance = createBrowserClient<Database>(url, key, {
    auth: {
      detectSessionInUrl: false,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _instance;
};