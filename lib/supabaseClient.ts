// lib/supabaseClient.ts
// Single browser-side Supabase client singleton.
// Used for: OTP, session reads, UI subscriptions, file uploads.
// PKCE exchange happens server-side via /api/auth/exchange — not here.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient(): ReturnType<typeof createBrowserClient<Database>> {
  if (typeof window === "undefined") {
    throw new Error(
      "getSupabaseBrowserClient() was called server-side. " +
      "Use createServerClient from @supabase/ssr for server code."
    );
  }
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}