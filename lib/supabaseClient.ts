// lib/supabaseClient.ts
// THE single Supabase browser client for the entire app.
// One instance, created once, used everywhere in client code.
// @supabase/ssr's createBrowserClient automatically:
//   - stores PKCE code_verifier in cookies
//   - exchanges OAuth codes on page load (detectSessionInUrl: true by default)
//   - persists session in cookies across navigations

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Module-level singleton — safe because Next.js client bundles are browser-only.
// The SSR guard below prevents accidental server-side execution.
const createSingleton = () => {
  if (typeof window === "undefined") return null as never;
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (!_client) _client = createSingleton();
  return _client!;
}

// Named export for direct use
export const supabase = {
  get auth() { return getSupabaseBrowserClient().auth; },
  get from()  { return getSupabaseBrowserClient().from.bind(getSupabaseBrowserClient()); },
  get storage(){ return getSupabaseBrowserClient().storage; },
};