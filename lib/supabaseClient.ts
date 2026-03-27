// lib/supabaseClient.ts
// Browser Supabase client using @supabase/ssr (official SSR pattern).
// createBrowserClient manages PKCE code_verifier in cookies automatically.
//
// NOTE: We intentionally do NOT use a module-level singleton here.
// A cached instance can hold a stale PKCE code_verifier from a previous
// failed OAuth attempt, causing "code challenge does not match" on retries.
// createBrowserClient is lightweight — calling it per render is fine and
// @supabase/ssr deduplicates the underlying GoTrue client internally.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function getSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}