// lib/supabaseClient.ts
// Uses @supabase/supabase-js directly (NOT @supabase/ssr).
// @supabase/supabase-js stores the PKCE code_verifier in localStorage.
// localStorage is same-origin first-party storage — preserved by ALL browsers
// including Brave, even during cross-origin OAuth redirects.
// @supabase/ssr uses cookies which Brave's ephemeral storage can partition.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Module-level singleton. Next.js evaluates client modules once per browser session.
// The SAME instance must be used for signInWithOAuth AND exchangeCodeForSession
// so both operations share the same localStorage namespace and the verifier is found.
let _instance: ReturnType<typeof createSupabaseClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    // Server context: return a no-op compatible client
    // This path should never be used for auth operations
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
  }

  if (!_instance) {
    _instance = createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: "pkce",           // Use PKCE (Supabase default)
          storage: window.localStorage, // Store verifier in localStorage (Brave-safe)
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );
  }
  return _instance;
}
