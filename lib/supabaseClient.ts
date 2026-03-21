// lib/supabaseClient.ts
// Single Supabase browser client for the entire app.
// Uses @supabase/ssr defaults — do NOT override storage or storageKey.
// @supabase/ssr manages the PKCE code_verifier internally using its own key scheme.
// Any override (custom storageKey, custom storage) breaks the verifier lookup.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;
let _instance: BrowserClient | undefined;

export function getSupabaseBrowserClient(): BrowserClient {
  if (!_instance) {
    _instance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      // No custom auth options — use @supabase/ssr defaults exactly
    );
  }
  return _instance;
}
