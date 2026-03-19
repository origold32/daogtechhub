// app/api/payment/webhook/route.ts
// Paystack sends events here — HMAC-SHA512 verified, idempotent.
// Register at: https://dashboard.paystack.com → Settings → Webhooks
// URL: https://daogtech.vercel.app/api/payment/webhook
import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/supabase/server";
import { createHmac } from "crypto";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret    = process.env.PAYSTACK_SECRET_KEY ?? "";

  // ── 1. Verify HMAC-SHA512 signature ────────────────────────────────────────
  const hash = createHmac("sha512", secret).update(body).digest("hex");
  if (hash !== signature) {
    console.warn("[webhook] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; data: Record<string, any> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  // ── 2. Handle charge.success ────────────────────────────────────────────────
  if (event.event === "charge.success") {
    const tx      = event.data;
    const ref     = tx.reference as string;
    const meta    = tx.metadata ?? {};
    const orderId = meta.order_id as string | undefined;

    if (!orderId || !ref) {
      console.warn("[webhook] Missing order_id or reference in metadata");
      return NextResponse.json({ received: true });
    }

    // ── 3. Idempotency — check receipt already exists ─────────────────────────
    const { data: existingReceipt } = await supabase
      .from("receipts")
      .select("id")
      .eq("payment_reference", ref)
      .maybeSingle();

    if (existingReceipt) {
      console.info(`[webhook] Duplicate event for ref ${ref} — skipped`);
      return NextResponse.json({ received: true });
    }

    // ── 4. Fetch order (only update if still pending) ─────────────────────────
    const { data: order } = await supabase
      .from("orders")
      .select("id, user_id, status, total_amount, order_items(*)")
      .eq("id", orderId)
      .single();

    if (!order) {
      console.error(`[webhook] Order ${orderId} not found`);
      return NextResponse.json({ received: true });
    }

    if (order.status === "pending") {
      await supabase.from("orders").update({
        status:            "confirmed",
        payment_reference: ref,
        payment_method:    tx.channel ?? "paystack",
      }).eq("id", orderId);
    }

    // ── 5. Create receipt ─────────────────────────────────────────────────────
    const receiptNum = `RCP-${Date.now()}-${randomUUID().replace(/-/g,"").slice(0,6).toUpperCase()}`;
    await supabase.from("receipts").insert({
      order_id:           orderId,
      user_id:            order.user_id,
      receipt_number:     receiptNum,
      payment_reference:  ref,
      customer_name:      meta.customer_name ?? "Customer",
      customer_email:     tx.customer?.email ?? null,
      amount_paid:        tx.amount / 100,
      currency:           tx.currency ?? "NGN",
      payment_channel:    tx.channel ?? "paystack",
      payment_date:       tx.paid_at ?? new Date().toISOString(),
      items_snapshot:     meta.items ?? order.order_items ?? [],
      status:             "paid",
    });

    // ── 6. Add success notification to user inbox ─────────────────────────────
    await supabase.from("notifications").insert({
      user_id: order.user_id,
      type:    "order",
      title:   "Payment confirmed ✓",
      message: `Your payment of ₦${(tx.amount / 100).toLocaleString()} has been received. Receipt: ${receiptNum}`,
      read:    false,
      data:    { order_id: orderId, reference: ref, receipt_number: receiptNum },
    }).catch(() => {});
  }

  return NextResponse.json({ received: true });
}
