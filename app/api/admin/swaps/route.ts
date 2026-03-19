// app/api/admin/swaps/route.ts
// GET   → All swap requests with filters (admin)
// PATCH → Update swap status (admin)

import { NextRequest } from "next/server";
import { ok, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") ?? "all";
    const { page, pageSize, from, to } = parsePagination(searchParams);

    let query = auth.supabase
      .from("swap_requests")
      .select("*, profiles(first_name, last_name, email)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status !== "all") query = query.eq("status", status);

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
