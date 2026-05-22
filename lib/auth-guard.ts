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

  // Check primary admin by JWT email — works even when profile is null or has wrong role.
  const userEmail = user.email ?? "";
  if (PRIMARY_ADMIN_EMAILS.includes(userEmail)) {
    // Silently repair DB role in background if wrong or missing
    if (!profile || profile.role !== "admin") {
      try {
        createServiceRoleClient()
          .from("profiles")
          .upsert({ id: user.id, email: userEmail, role: "admin", is_active: true, first_name: "", last_name: "" }, { onConflict: "id" })
          .then(() => {});
      } catch { /* best-effort */ }
    }
    const adminProfile = profile
      ? { ...profile, role: "admin" as UserRole }
      : { id: user.id, email: userEmail, role: "admin" as UserRole, is_active: true } as NonNullable<typeof profile>;
    return { user, supabase, profile: adminProfile, error: null } as const;
  }

  return { user, supabase, profile, error: null } as const;
}

export async function requireRole(...roles: UserRole[]) {
  const auth = await requireAuth();
  if (auth.error) return auth;

  // Primary admins always pass — email is sourced from the verified JWT, not the DB
  if (PRIMARY_ADMIN_EMAILS.includes(auth.user?.email ?? "")) {
    return { ...auth, error: null } as const;
  }

  if (auth.profile && auth.profile.is_active === false) {
    return { ...auth, error: forbidden("Account is inactive") } as const;
  }
  if (!auth.profile || !roles.includes(auth.profile.role as UserRole)) {
    return { ...auth, error: forbidden("Insufficient permissions") } as const;
  }
  return { ...auth, error: null } as const;
}
