// lib/auth-guard.ts
// Server-side auth guard for API route handlers.
// Reads the JWT from Authorization: Bearer header (sent by axios interceptor).
// Falls back to cookie-based session for SSR compatibility.

import { createServerSupabaseClient } from "@/supabase/server";
import { unauthorized, forbidden } from "./api-response";
import type { UserRole } from "@/types/database";
import { headers } from "next/headers";

export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const headerStore = await headers();
  const authHeader = headerStore.get("authorization");

  let user = null;
  let error = null;

  if (authHeader?.startsWith("Bearer ")) {
    // Verify JWT from Authorization header
    const token = authHeader.slice(7);
    const result = await supabase.auth.getUser(token);
    user = result.data.user;
    error = result.error;
  } else {
    // Fallback: try getUser() directly (works if session cookie exists)
    const result = await supabase.auth.getUser();
    user = result.data.user;
    error = result.error;
  }

  if (error || !user) {
    return { user: null, supabase, profile: null, error: unauthorized() } as const;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, supabase, profile, error: null } as const;
}

export async function requireRole(...roles: UserRole[]) {
  const auth = await requireAuth();
  if (auth.error) return auth;

  if (!auth.profile || !roles.includes(auth.profile.role as UserRole)) {
    return { ...auth, error: forbidden("Insufficient permissions") } as const;
  }

  return { ...auth, error: null } as const;
}