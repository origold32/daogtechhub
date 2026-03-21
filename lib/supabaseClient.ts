// lib/supabaseClient.ts
// Single Supabase browser client instance for the entire app.

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let _instance: BrowserClient | undefined;

export function getSupabaseBrowserClient(): BrowserClient {
  if (!_instance) {
    _instance = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return _instance;
}
