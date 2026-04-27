import { NextRequest } from "next/server";
import { ok, serverError, badRequest, parsePagination, withMeta } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import type { Database } from "@/types/database";

export const dynamic = "force-dynamic";
type OrderStatus = Database["public"]["Enums"]["order_status"];

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, from, to } = parsePagination(searchParams);
    const status = searchParams.get("status")?.trim();
    const paymentMethod = searchParams.get("paymentMethod")?.trim();
    const search = searchParams.get("search")?.trim();
    const fromDate = searchParams.get("from")?.trim();
    const toDate = searchParams.get("to")?.trim();

    const { createServiceRoleClient } = await import("@/supabase/server");
    const service = createServiceRoleClient();

    let query = service
      .from("orders")
      .select(
        "id, status, payment_method, payment_reference, subtotal_amount, discount_amount, delivery_fee, grand_total, currency, created_at, profiles(first_name, last_name, email), order_items(product_name, quantity, unit_price)",
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    if (status) query = query.eq("status", status as OrderStatus);
    if (paymentMethod) query = query.eq("payment_method", paymentMethod);
    if (fromDate) query = query.gte("created_at", fromDate);
    if (toDate) query = query.lte("created_at", toDate);
    if (search) {
      const clean = search.replace(/"/g, "\\\"");
      query = query.or(
        `id.ilike.%${clean}%,payment_reference.ilike.%${clean}%,profiles.first_name.ilike.%${clean}%,profiles.last_name.ilike.%${clean}%,profiles.email.ilike.%${clean}%`
      );
    }

    const { data, error, count } = await query.range(from, to);
    if (error) return serverError(error);

    return withMeta(data ?? [], {
      page,
      pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const body = await req.json();
    const { orderId, status, note } = body;

    if (!orderId || !status) return badRequest("orderId and status required");

    const validStatuses: OrderStatus[] = ["pending", "awaiting_payment", "payment_submitted", "confirmed", "processing", "shipped", "delivered", "cancelled", "refunded"];
    if (!validStatuses.includes(status as OrderStatus)) return badRequest("Invalid status");

    const { createServiceRoleClient } = await import("@/supabase/server");
    const service = createServiceRoleClient();

    // Get current order for audit
    const { data: currentOrder, error: fetchError } = await service
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !currentOrder) return badRequest("Order not found");

    // Update order
    const { error: updateError } = await service
      .from("orders")
      .update({ status: status as OrderStatus })
      .eq("id", orderId);

    if (updateError) return serverError(updateError);

    // Audit log
    await service.from("admin_audit_log").insert({
      admin_id: auth.user.id,
      action: "update_order_status",
      resource_type: "order",
      resource_id: orderId,
      old_value: { status: currentOrder.status },
      new_value: { status },
      metadata: { note },
    });

    return ok({ orderId, status }, "Order updated successfully");
  } catch (err) {
    return serverError(err);
  }
}
