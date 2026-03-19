// app/api/admin/users/route.ts
// GET  → List all profiles (admin only)
// Requires admin role.

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { ok, serverError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role") ?? "all";
    const search = searchParams.get("search") ?? "";

    // Use service role to bypass RLS so admin can read all profiles
    const { createServiceRoleClient } = await import("@/supabase/server");
    const service = createServiceRoleClient();

    let query = service
      .from("profiles")
      .select("id, first_name, last_name, email, phone, avatar_url, role, created_at")
      .order("created_at", { ascending: false });

    if (role !== "all") {
      query = query.eq("role", role);
    }

    if (search) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) return serverError(error);

    return ok(data ?? []);
  } catch (err) {
    return serverError(err);
  }
}
