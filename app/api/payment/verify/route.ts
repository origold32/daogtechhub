// app/api/payment/verify/route.ts
// Called from the /payment/callback page after Paystack redirect.
// Verifies with Paystack API (never trusts frontend), updates order, creates receipt.
import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";
import { createServiceRoleClient } from "@/supabase/server";
import type { Database } from "@/types/database";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"] | null;

function buildCustomerName(user: any, profile: ProfileRow) {
  const meta = (user?.user_metadata ?? {}) as {
    first_name?: string;
    last_name?: string;
    full_name?: string;
  };

  const fromProfile = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
  if (fromProfile) return fromProfile;

  if (meta.full_name?.trim()) return meta.full_name.trim();

  const fromMeta = [meta.first_name, meta.last_name].filter(Boolean).join(" ").trim();
  if (fromMeta) return fromMeta;

  return (user?.email as string | undefined)?.split("@")[0] ?? "Customer";
}

export async function POST(req: NextRequest) {
  try {
    const { user, profile, error } = await requireAuth();
    if (error) return error;

    const { reference } = await req.json() as { reference: string };
    if (!reference?.trim()) return badRequest("Payment reference is required");

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return serverError("PAYSTACK_SECRET_KEY is not configured");

    // Verify with Paystack — never trust client
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${secretKey}` } }
    );
    const data = await res.json();

    if (!data.status || data.data?.status !== "success") {
      return badRequest(
        data.data?.gateway_response ?? data.message ?? "Payment was not successful"
      );
    }

    const tx     = data.data;
    const meta   = tx.metadata ?? {};
    const orderId = meta.order_id;

    // Use service role to bypass RLS for receipt creation
    const service = createServiceRoleClient();

    // Idempotency — check if receipt already exists for this reference
    const { data: existing } = await service
      .from("receipts")
      .select("id, receipt_number")
      .eq("payment_reference", reference)
      .maybeSingle();

    let receiptNumber = existing?.receipt_number ?? null;
    let receiptId     = existing?.id ?? null;

    if (orderId && !existing) {
      // Fetch order + items to build receipt
      const { data: order } = await service
        .from("orders")
        .select("id, user_id, status, total_amount, order_items(*)")
        .eq("id", orderId)
        .single();

      if (order) {
        // Verify ownership
        if (order.user_id !== user!.id) return badRequest("Order ownership mismatch");

        // Only update if still pending (idempotency)
        if (order.status === "pending") {
          await service.from("orders").update({
            status: "confirmed",
            payment_reference: reference,
            payment_method: tx.channel ?? "paystack",
          }).eq("id", orderId);
        }

        // Generate receipt
        const receiptNum = `RCP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const { data: receipt } = await service.from("receipts").insert({
          order_id:           orderId,
          user_id:            user!.id,
          receipt_number:     receiptNum,
          payment_reference:  reference,
          customer_name:      meta.customer_name ?? buildCustomerName(user, profile),
          customer_email:     tx.customer?.email ?? user!.email,
          amount_paid:        tx.amount / 100,
          currency:           tx.currency ?? "NGN",
          payment_channel:    tx.channel ?? "paystack",
          payment_date:       tx.paid_at ?? new Date().toISOString(),
          items_snapshot:     order.order_items ?? [],
          status:             "paid",
        }).select("id, receipt_number").single();

        receiptNumber = receipt?.receipt_number ?? receiptNum;
        receiptId     = receipt?.id ?? null;

        // Send receipt email (non-blocking)
        sendReceiptEmail({
          to:            tx.customer?.email ?? user!.email ?? "",
          customerName:  meta.customer_name ?? buildCustomerName(user, profile),
          receiptNumber: receiptNumber,
          reference,
          amount:        tx.amount / 100,
          paidAt:        tx.paid_at ?? new Date().toISOString(),
          items:         meta.items ?? [],
        }).catch((e) => console.warn("[receipt email]", e));
      }
    }

    return ok({
      reference,
      amount:        tx.amount / 100,
      status:        "success",
      channel:       tx.channel,
      paidAt:        tx.paid_at,
      orderId,
      receiptNumber,
      receiptId,
      customerEmail: tx.customer?.email,
    });
  } catch (err) {
    console.error("[payment/verify]", err);
    return serverError(err);
  }
}

// Email receipt via Resend (fire-and-forget)
async function sendReceiptEmail(opts: {
  to: string; customerName: string; receiptNumber: string;
  reference: string; amount: number; paidAt: string;
  items: Array<{ name: string; qty: number; price: number }>;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !opts.to) return;

  const itemRows = opts.items
    .map((i) => `<tr><td>${i.name}</td><td style="text-align:right">${i.qty}</td><td style="text-align:right">₦${Number(i.price).toLocaleString()}</td></tr>`)
    .join("");

  const html = `
  <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#fff;color:#1a1a2e">
    <div style="background:#1a0b2e;padding:32px;text-align:center">
      <h1 style="color:#d4a5ff;margin:0;font-size:24px">DAOG Tech Hub</h1>
      <p style="color:#d4a5ff80;margin:8px 0 0">Payment Receipt</p>
    </div>
    <div style="padding:32px">
      <p>Hi <strong>${opts.customerName}</strong>,</p>
      <p>Your payment was received successfully. Here is your receipt.</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0">
        <tr><td style="color:#666;padding:6px 0">Receipt No.</td><td style="font-weight:bold">${opts.receiptNumber}</td></tr>
        <tr><td style="color:#666;padding:6px 0">Reference</td><td style="font-family:monospace">${opts.reference}</td></tr>
        <tr><td style="color:#666;padding:6px 0">Date</td><td>${new Date(opts.paidAt).toLocaleString("en-NG")}</td></tr>
        <tr><td style="color:#666;padding:6px 0">Status</td><td style="color:#16a34a;font-weight:bold">✓ Paid</td></tr>
      </table>
      ${itemRows ? `<table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px"><thead><tr style="background:#f3f4f6"><th style="padding:8px;text-align:left">Item</th><th style="padding:8px;text-align:right">Qty</th><th style="padding:8px;text-align:right">Price</th></tr></thead><tbody>${itemRows}</tbody></table>` : ""}
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0;text-align:center">
        <p style="margin:0;font-size:22px;font-weight:bold;color:#1a0b2e">Total: ₦${Number(opts.amount).toLocaleString()}</p>
      </div>
      <p style="color:#666;font-size:13px">We'll contact you via WhatsApp with delivery updates. If you have questions, reply to this email.</p>
      <p style="color:#666;font-size:13px">Thank you for shopping with DAOG Tech Hub! 🛍️</p>
    </div>
  </div>`;

  const from = process.env.EMAIL_FROM ?? "DAOG Tech Hub <noreply@daogtechhub.com>";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from, to: opts.to,
      subject: `Payment Receipt ${opts.receiptNumber} — DAOG Tech Hub`,
      html,
    }),
  });
}
