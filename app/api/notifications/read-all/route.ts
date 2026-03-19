export const dynamic = "force-dynamic";
// app/api/notifications/read-all/route.ts — mark all notifications read
import { ok, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function PATCH() {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    await supabase!
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user!.id)
      .eq("read", false);

    return ok({ updated: true });
  } catch (err) { return serverError(err); }
}

