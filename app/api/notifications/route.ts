export const dynamic = "force-dynamic";
// app/api/notifications/route.ts — GET user notifications
import { ok, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { data, error: qErr } = await supabase!
      .from("notifications")
      .select("*")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (qErr) return serverError(qErr);
    return ok(data ?? []);
  } catch (err) { return serverError(err); }
}

