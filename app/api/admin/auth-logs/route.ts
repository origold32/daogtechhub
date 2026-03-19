// app/api/admin/auth-logs/route.ts
// GET  → Returns auth event logs for admin dashboard
// POST → Manually log an auth event (called from server actions)

import { NextRequest } from "next/server";
import { createServiceRoleClient } from "@/supabase/server";
import { ok, forbidden, serverError, parsePagination } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    // Only admins can access this
    const service = createServiceRoleClient();
    const { data: profile } = await service.from("profiles").select("role").eq("id", user!.id).single();
    if (profile?.role !== "admin") return forbidden("Admin access required");

    const { searchParams } = new URL(req.url);
    const { from, to }     = parsePagination(searchParams);
    const eventType        = searchParams.get("event_type");

    let query = service
      .from("auth_logs")
      .select("*, profiles(first_name, last_name, email)")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (eventType) query = query.eq("event_type", eventType);

    const { data, error: qErr } = await query;
    if (qErr) return serverError(qErr);

    return ok(data ?? []);
  } catch (err) {
    return serverError(err);
  }
}
