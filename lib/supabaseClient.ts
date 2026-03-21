// lib/supabaseClient.ts
// Supabase browser client using implicit flow (no PKCE).
// PKCE requires storing a code_verifier across a cross-origin redirect.
// Privacy browsers (Brave) clear first-party storage on cross-origin navigation,
// destroying the verifier. Implicit flow sends tokens directly in the URL hash,
// requiring no stored state — works in all browsers.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function getSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: "implicit",      // No PKCE — tokens arrive in URL hash
        detectSessionInUrl: true,  // Auto-detect #access_token on page load
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  );
}
