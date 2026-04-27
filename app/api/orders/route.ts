export const dynamic = "force-dynamic";
// app/api/orders/route.ts
// GET  → List the authenticated user's orders
// POST → Create a new order (from cart items)

import { NextRequest } from "next/server";
import { ok, created, badRequest, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";
import { createOrderWithItems } from "@/lib/order-service";
import { createOrderSchema } from "@/lib/validators";
import type { Database } from "@/types/database";

const VALID_ORDER_STATUSES = [
  "pending", "awaiting_payment", "payment_submitted", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded",
] as const;

type OrderStatus = (typeof VALID_ORDER_STATUSES)[number];

export async function GET(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, from, to } = parsePagination(searchParams);
    const statusParam = searchParams.get("status");
    const status = VALID_ORDER_STATUSES.includes(statusParam as OrderStatus) ? statusParam : null;

    let query = supabase!
      .from("orders")
      .select("*, order_items(*)", { count: "exact" })
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status as Database["public"]["Enums"]["order_status"]);

    const { data, error: queryError, count } = await query.range(from, to);

    if (queryError) return serverError(queryError);

    return withMeta(data, {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors.map((err) => err.message).join(", "));

    const { order } = await createOrderWithItems(user!.id, parsed.data);
    return created(order, "Order placed successfully");
  } catch (err) {
    return serverError(err);
  }
}

