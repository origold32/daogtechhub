// supabase/client.ts
// Browser-side Supabase client — module-level singleton.
// detectSessionInUrl is DISABLED to prevent the browser client from trying
// to exchange OAuth codes that have already been handled server-side.
// Session is read from cookies set by the server callback route.

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

  _instance = createBrowserClient<Database>(url, key, {
    auth: {
      detectSessionInUrl: false, // Server callback handles code exchange
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _instance;
};