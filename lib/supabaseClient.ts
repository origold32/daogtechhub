// lib/supabaseClient.ts
// Single Supabase browser client — explicit PKCE config to ensure consistency.
// The code_verifier is stored by @supabase/ssr in localStorage (not cookies)
// to avoid cookie-based race conditions during server redirects.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let _instance: BrowserClient | undefined;

export function getSupabaseBrowserClient(): BrowserClient {
  if (!_instance) {
    _instance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          flowType: "pkce",
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
          storageKey: "daog-auth",
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  return _instance;
}
