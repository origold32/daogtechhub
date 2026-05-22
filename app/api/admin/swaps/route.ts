export const dynamic = "force-dynamic";
// app/api/admin/swaps/route.ts
// GET   → All swap requests with filters (admin)
// PATCH → Update swap status / add admin notes (admin)

import { NextRequest } from "next/server";
import { ok, badRequest, notFound, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import type { Database } from "@/types/database";

type SwapStatus = Database["public"]["Tables"]["swap_requests"]["Row"]["status"];
const VALID_STATUSES: SwapStatus[] = ["pending", "under_review", "approved", "rejected", "completed"];

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status") ?? "all";
    const { page, pageSize, from, to } = parsePagination(searchParams);

    let query = auth.supabase
      .from("swap_requests")
      .select("*, profiles(first_name, last_name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    // Validate statusParam against the SwapStatus union before passing to .eq()
    const status = VALID_STATUSES.find((s) => s === statusParam);
    if (status) query = query.eq("status", status);

    const { data, error, count } = await query;
    if (error) return serverError(error);

    return withMeta(data, {
      page, pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const body = await req.json();
    const { id, status, admin_notes } = body as { id: string; status: SwapStatus; admin_notes?: string };

    if (!id) return badRequest("id is required");
    if (!status || !VALID_STATUSES.includes(status)) {
      return badRequest(`status must be one of: ${VALID_STATUSES.join(", ")}`);
    }

    const update: Record<string, unknown> = { status };
    if (admin_notes !== undefined) update.admin_notes = admin_notes;

    const { data, error } = await auth.supabase
      .from("swap_requests")
      .update(update)
      .eq("id", id)
      .select("id, status, admin_notes")
      .single();

    if (error) return serverError(error);
    if (!data) return notFound("Swap request");

    return ok(data, `Swap status updated to ${status}`);
  } catch (err) {
    return serverError(err);
  }
}
