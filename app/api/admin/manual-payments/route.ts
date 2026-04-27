import { NextRequest } from "next/server";
import { ok, serverError, badRequest } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/supabase/server";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const service = createServiceRoleClient();
    const { data, error } = await service
      .from("orders")
      .select("id, user_id, status, payment_method, payment_reference, subtotal_amount, discount_amount, delivery_fee, grand_total, currency, manual_payment_submitted_at, manual_payment_note, manual_payment_proof_url, created_at, order_items(product_name, quantity, unit_price), profiles(first_name, last_name, email)")
      .eq("status", "payment_submitted")
      .order("created_at", { ascending: false });

    if (error) return serverError(error);
    return ok(data ?? []);
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const body = await req.json();
    const { orderId, action } = body; // action: 'approve' or 'reject'

    if (!orderId || !action) return badRequest("orderId and action required");
    if (!["approve", "reject"].includes(action)) return badRequest("Invalid action");

    const service = createServiceRoleClient();

    // Get current order
    const { data: currentOrder, error: fetchError } = await service
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .single();

    if (fetchError || !currentOrder) return badRequest("Order not found");
    if (currentOrder.status !== "payment_submitted") return badRequest("Order not in payment_submitted status");

    const newStatus = action === "approve" ? "confirmed" : "cancelled";

    // Update order
    const { error: updateError } = await service
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (updateError) return serverError(updateError);

    // If approved, create receipt
    if (action === "approve") {
      const receiptNumber = `RCP-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
      await service.from("receipts").insert({
        order_id: orderId,
        user_id: currentOrder.user_id,
        receipt_number: receiptNumber,
        payment_reference: currentOrder.payment_reference ?? `manual-${orderId}`,
        customer_name: "", // TODO: get from profile
        customer_email: "", // TODO
        amount_paid: currentOrder.grand_total,
        currency: currentOrder.currency,
        payment_channel: "manual",
        payment_date: new Date().toISOString(),
        items_snapshot: currentOrder.order_items ?? [],
        status: "paid",
      });

      await service.from("notifications").insert({
        user_id: currentOrder.user_id,
        type: "order",
        title: "Payment approved",
        message: `Your manual payment has been approved. Receipt: ${receiptNumber}`,
        read: false,
        data: { order_id: orderId, receipt_number: receiptNumber },
      });
    }

    // Audit log
    await service.from("admin_audit_log").insert({
      admin_id: auth.user.id,
      action: `manual_payment_${action}`,
      resource_type: "order",
      resource_id: orderId,
      old_value: { status: currentOrder.status },
      new_value: { status: newStatus },
      metadata: {},
    });

    return ok({ orderId, status: newStatus }, `Manual payment ${action}d successfully`);
  } catch (err) {
    return serverError(err);
  }
}
