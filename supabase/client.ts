// supabase/client.ts
// Browser-side Supabase client — singleton using @supabase/ssr.
// @supabase/ssr stores the PKCE code_verifier in COOKIES (not localStorage),
// so it survives page navigations and is readable by both client and server.

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

  _instance = createBrowserClient<Database>(url, key);
  return _instance;
};