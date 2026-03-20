// lib/supabaseClient.ts
// Browser-only Supabase client singleton.
// Used for: OTP send/verify, session reads, UI state.
// NOT used in the OAuth callback path — that goes through /auth/callback server route.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (typeof window === "undefined") {
    throw new Error("getSupabaseBrowserClient() must only be called in the browser.");
  }
  if (!_client) {
    _client = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _client;
}

// Default export for convenience
export const supabase = {
  get auth() { return getSupabaseBrowserClient().auth; },
  get from() { return getSupabaseBrowserClient().from.bind(getSupabaseBrowserClient()); },
  get storage() { return getSupabaseBrowserClient().storage; },
  get channel() { return getSupabaseBrowserClient().channel.bind(getSupabaseBrowserClient()); },
};