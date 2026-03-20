// lib/auth-guard.ts
import { createServerSupabaseClient } from "@/supabase/server";
import { unauthorized, forbidden } from "./api-response";
import type { UserRole } from "@/types/database";

export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase, profile: null, error: unauthorized() } as const;
  }

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

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