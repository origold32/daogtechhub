// lib/supabaseClient.ts
// Browser Supabase client using @supabase/ssr (official SSR pattern).
// createBrowserClient manages PKCE code_verifier in cookies automatically.
// Singleton pattern ensures the same instance is reused within a page session.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;
  browserClient = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return browserClient;
}
