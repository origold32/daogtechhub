// app/api/admin/users/[id]/route.ts
// PATCH → Update a user's role (admin only)
// DELETE → Remove a user profile (admin only, does NOT delete auth.users)

import { NextRequest } from "next/server";
import { requireRole } from "@/lib/auth-guard";
import { ok, badRequest, notFound, serverError } from "@/lib/api-response";
import type { UserRole } from "@/types/database";

const VALID_ROLES: UserRole[] = ["customer", "admin", "vendor"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { id } = params;
    const body = await req.json();
    const { role } = body as { role: UserRole };

    if (!role || !VALID_ROLES.includes(role)) {
      return badRequest(`role must be one of: ${VALID_ROLES.join(", ")}`);
    }

    // Prevent admin from demoting themselves accidentally
    if (id === auth.user!.id && role !== "admin") {
      return badRequest("You cannot change your own role. Ask another admin.");
    }

    // Use service role client so the update bypasses RLS
    const { createServiceRoleClient } = await import("@/supabase/server");
    const service = createServiceRoleClient();

    const { data, error } = await service
      .from("profiles")
      .update({ role })
      .eq("id", id)
      .select("id, first_name, last_name, email, role")
      .single();

    if (error) return serverError(error);
    if (!data) return notFound("User");

    return ok(data, `Role updated to ${role}`);
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { id } = params;

    if (id === auth.user!.id) {
      return badRequest("You cannot delete your own account.");
    }

    const { createServiceRoleClient } = await import("@/supabase/server");
    const service = createServiceRoleClient();

    // Delete from auth.users — cascades to profiles via FK
    const { error } = await service.auth.admin.deleteUser(id);
    if (error) return serverError(error);

    return ok({ id }, "User deleted");
  } catch (err) {
    return serverError(err);
  }
}
