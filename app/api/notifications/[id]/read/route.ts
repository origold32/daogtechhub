// app/api/notifications/[id]/read/route.ts — mark one notification read
import { NextRequest } from "next/server";
import { ok, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function PATCH(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    await supabase!
      .from("notifications")
      .update({ read: true })
      .eq("id", params.id)
      .eq("user_id", user!.id);

    return ok({ updated: true });
  } catch (err) { return serverError(err); }
}
