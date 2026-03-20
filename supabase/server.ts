// supabase/server.ts
// Server-side Supabase clients for API Route Handlers only.
// Auth is implicit/client-side — sessions are in localStorage, not cookies.
// API routes receive the JWT via Authorization header from axios interceptor.

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// ── Anon client — used by API routes that need to verify the user's JWT ───────
// The JWT is passed via the Authorization: Bearer <token> header from the client.
export const createServerSupabaseClient = async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local"
    );
  }

  return createSupabaseClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

// ── Service-role client — bypasses RLS, for trusted server operations ─────────
export const createServiceRoleClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Service role key not configured. Add SUPABASE_SERVICE_ROLE_KEY to .env.local"
    );
  }

  return createSupabaseClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};