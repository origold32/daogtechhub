// supabase/client.ts
// Browser-side Supabase client — module-level singleton.
// detectSessionInUrl: true (default) allows @supabase/ssr to automatically
// detect and exchange OAuth codes from the URL on page load.
// The OAuth redirect must point to a CLIENT-SIDE page (not a server route handler)
// so the browser client can read both the URL params and the stored code_verifier.

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
  // Note: detectSessionInUrl defaults to true in createBrowserClient.
  // This means on page load, if there's a ?code= or #access_token= in the URL,
  // Supabase will automatically exchange/set the session and fire SIGNED_IN.
  return _instance;
};