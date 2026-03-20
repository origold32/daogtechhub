// supabase/client.ts
// Pure browser client using @supabase/supabase-js with flowType:"implicit".
// This completely bypasses PKCE — no code_verifier, no code_challenge.
// OAuth tokens arrive in the URL hash (#access_token=...) and are set via setSession().
// Using @supabase/supabase-js directly (not @supabase/ssr) to avoid SSR wrapper
// forcing PKCE regardless of flowType setting.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let _instance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export const createClient = () => {
  if (_instance) return _instance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
    );
  }

  _instance = createSupabaseClient<Database>(url, key, {
    auth: {
      flowType: "implicit",        // No PKCE — tokens come in URL hash
      detectSessionInUrl: true,    // Auto-detect #access_token on page load
      persistSession: true,        // Keep session in localStorage
      autoRefreshToken: true,      // Auto-refresh before expiry
      storageKey: "daog-auth",     // Explicit storage key
    },
  });
  return _instance;
};