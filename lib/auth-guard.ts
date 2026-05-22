// lib/auth-guard.ts
import { createServerSupabaseClient, createServiceRoleClient } from "@/supabase/server";
import { unauthorized, forbidden } from "./api-response";
import type { UserRole } from "@/types/database";

const PRIMARY_ADMIN_EMAILS = ["daogstore@gmail.com", "adegbesanadebola1@gmail.com"];

export async function requireAuth() {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase, profile: null, error: unauthorized() } as const;
  }

  const { data: profile } = await supabase
    .from("profiles").select("*").eq("id", user.id).single();

  // Guarantee primary admins always have role = 'admin', fixing DB silently if needed
  if (profile && PRIMARY_ADMIN_EMAILS.includes(profile.email ?? "")) {
    if (profile.role !== "admin") {
      try {
        createServiceRoleClient()
          .from("profiles")
          .update({ role: "admin" })
          .eq("id", profile.id)
          .then(() => {});
      } catch { /* best-effort */ }
    }
    return { user, supabase, profile: { ...profile, role: "admin" as UserRole }, error: null } as const;
  }

  return { user, supabase, profile, error: null } as const;
}

export async function requireRole(...roles: UserRole[]) {
  const auth = await requireAuth();
  if (auth.error) return auth;
  if (auth.profile && auth.profile.is_active === false) {
    return { ...auth, error: forbidden("Account is inactive") } as const;
  }
  if (!auth.profile || !roles.includes(auth.profile.role as UserRole)) {
    return { ...auth, error: forbidden("Insufficient permissions") } as const;
  }
  return { ...auth, error: null } as const;
}
