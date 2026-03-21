// lib/supabaseClient.ts
// Creates a fresh Supabase browser client on each call.
// NO singleton — singletons break across page navigations because each
// page load is a fresh JS environment in Next.js.
// @supabase/ssr uses cookies (not memory) to persist the PKCE code_verifier,
// so creating a new client instance on the callback page correctly reads
// the verifier that was stored by the instance on the auth page.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function getSupabaseBrowserClient() {
  // Always create a fresh instance — it reads verifier from cookies, not memory.
  // This is safe: @supabase/ssr deduplicates active sessions via cookie storage.
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
