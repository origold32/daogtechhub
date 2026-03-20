// lib/supabaseClient.ts
// THE single shared Supabase browser client used across the entire app.
// Exported as a constant — always the same instance.
// Uses @supabase/ssr which stores PKCE code_verifier in COOKIES,
// so the verifier survives full-page navigations (localStorage does not persist
// across different Vercel edge instances but cookies always do).

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Module-level singleton — created once when the module first loads.
// Every import of this file shares the same instance and the same cookie storage.
export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseKey);