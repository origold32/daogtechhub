// lib/supabaseClient.ts
// Browser-only Supabase client using @supabase/ssr defaults.
// Do NOT override flowType or storage — @supabase/ssr manages PKCE correctly.
// The code_verifier is stored in cookies (NOT localStorage) by @supabase/ssr.
// HTTP cookies are preserved through cross-origin redirects (Brave included).

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

export function getSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
