// supabase/client.ts
// Browser-side Supabase client — singleton, implicit flow (no PKCE).
// PKCE is disabled because the code_verifier is lost on full-page navigation
// (Google redirects to a new page, wiping the in-memory verifier).
// Implicit flow sends tokens directly in the URL hash — no verifier needed.

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
      flowType: "implicit",   // no PKCE — tokens come in the URL hash
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _instance;
};