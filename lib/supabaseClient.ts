// lib/supabaseClient.ts
// Browser Supabase client using @supabase/ssr (official SSR pattern).
// createBrowserClient manages PKCE code_verifier in cookies automatically.
//
// IMPLEMENTATION: Singleton pattern to prevent race conditions where multiple
// GoTrue instances overwrite the PKCE cookie. This ensures a single, consistent
// client instance across the app, avoiding stale PKCE code_verifier issues.

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let supabase: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!supabase) {
    supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return supabase;
}