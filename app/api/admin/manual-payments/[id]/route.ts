import { NextRequest } from "next/server";
import { ok, badRequest, serverError, forbidden, notFound } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/supabase/server";
import { logAnalyticsEvent } from "@/lib/analytics-service";
import { randomUUID } from "crypto";

const VALID_ACTIONS = ["approve", "reject"] as const;
type ManualPaymentAction = (typeof VALID_ACTIONS)[number];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const id = params.id;
    const body = await req.json();
    const action = body.action as ManualPaymentAction;
    const adminNote = (body.note ?? "").trim();

    if (!VALID_ACTIONS.includes(action)) {
      return badRequest(`action must be one of: ${VALID_ACTIONS.join(", ")}`);
    }

    const service = createServiceRoleClient();
    const { data: order, error: orderError } = await service
      .from("orders")
      .select("id, user_id, status, payment_reference, payment_method, grand_total, currency, manual_payment_note, manual_payment_proof_url, manual_payment_submitted_at, order_items(*), profiles(first_name,last_name,email)")
      .eq("id", id)
      .single();

    if (orderError || !order) return notFound("Order");

    if (!["awaiting_payment", "payment_submitted"].includes(order.status)) {
      return badRequest("This order is not eligible for manual payment review.");
    }

    if (action === "approve") {
      const receiptReference = order.payment_reference ?? `MANUAL-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const { data: existingReceipt, error: receiptLookupError } = await service
        .from("receipts")
        .select("id")
        .eq("order_id", order.id)
        .maybeSingle();

      if (receiptLookupError) {
        return serverError(receiptLookupError);
      }

      const updatedOrder = await service
        .from("orders")
        .update({
          status: "confirmed",
          notes: adminNote ? `Manual payment approved: ${adminNote}` : "Manual payment approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id)
        .select("id, status")
        .single();

      if (updatedOrder.error) return serverError(updatedOrder.error);

      if (!existingReceipt) {
        const receiptNumber = `RCP-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
        const receiptInsert = await service.from("receipts").insert({
          order_id: order.id,
          user_id: order.user_id,
          receipt_number: receiptNumber,
          payment_reference: receiptReference,
          customer_name: order.profiles?.first_name && order.profiles?.last_name ? `${order.profiles.first_name} ${order.profiles.last_name}` : order.profiles?.email?.split("@")[0] ?? "Customer",
          customer_email: order.profiles?.email ?? null,
          amount_paid: Number(order.grand_total ?? 0),
          currency: order.currency ?? "NGN",
          payment_channel: "manual_transfer",
          payment_date: new Date().toISOString(),
          items_snapshot: order.order_items ?? [],
          status: "paid",
        }).select("id, receipt_number").single();

        if (receiptInsert.error) return serverError(receiptInsert.error);
      }

      await service.from("notifications").insert({
        user_id: order.user_id,
        type: "order",
        title: "Manual payment approved",
        message: adminNote ? `Your transfer has been approved. ${adminNote}` : "Your manual payment has been approved.",
        read: false,
        data: { order_id: order.id, action: "manual_payment_approved" },
      });

      await logAnalyticsEvent({
        eventType: "manual_payment_approved",
        userId: order.user_id,
        metadata: {
          orderId: order.id,
          note: adminNote || null,
        },
      });

      return ok({ orderId: order.id, status: "confirmed" }, "Manual payment approved.");
    }

    if (action === "reject") {
      if (order.status !== "payment_submitted") {
        return badRequest("Only submitted manual payments can be rejected.");
      }

      const { data: updatedOrder, error: updateError } = await service.from("orders").update({
        status: "awaiting_payment",
        notes: adminNote ? `Manual payment rejected: ${adminNote}` : "Manual payment rejected. Please resubmit proof.",
        updated_at: new Date().toISOString(),
      }).eq("id", order.id).select("id, status").single();

      if (updateError) return serverError(updateError);

      await service.from("notifications").insert({
        user_id: order.user_id,
        type: "order",
        title: "Manual payment rejected",
        message: adminNote ? `Your transfer was rejected: ${adminNote}` : "Your manual payment was rejected. Please review and resubmit.",
        read: false,
        data: { order_id: order.id, action: "manual_payment_rejected" },
      });

      await logAnalyticsEvent({
        eventType: "manual_payment_rejected",
        userId: order.user_id,
        metadata: {
          orderId: order.id,
          note: adminNote || null,
        },
      });

      return ok({ orderId: order.id, status: "awaiting_payment" }, "Manual payment rejected.");
    }

    return badRequest("Unknown manual payment action.");
  } catch (err) {
    return serverError(err);
  }
}
