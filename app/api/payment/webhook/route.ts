// app/api/payment/webhook/route.ts
// Paystack sends events here — HMAC-SHA512 verified, idempotent.
// Register at: https://dashboard.paystack.com → Settings → Webhooks
// URL: https://daogtech.vercel.app/api/payment/webhook
import { NextRequest, NextResponse } from "next/server";
import { processPaystackTransaction, verifyPaystackWebhookSignature } from "@/lib/payment-service";
import { logAnalyticsEvent } from "@/lib/analytics-service";
import { apiLimiter, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const ip = getClientIp(req.headers);
  const limit = apiLimiter.check(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry after ${Math.ceil((limit.reset - Date.now()) / 1000)}s` },
      { status: 429 },
    );
  }

  if (!secret) {
    console.error("[webhook] PAYSTACK_SECRET_KEY is not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  if (!verifyPaystackWebhookSignature(body, signature, secret)) {
    await logAnalyticsEvent({
      eventType: "payment_webhook_invalid_signature",
      metadata: {
        source: "webhook",
        url: req.url,
      },
    });
    console.warn("[webhook] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event: string; data: Record<string, any> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (event.event === "charge.success") {
    const tx = event.data as any;

    await logAnalyticsEvent({
      eventType: "payment_webhook_received",
      userId: tx.metadata?.user_id ?? null,
      metadata: {
        orderId: tx.metadata?.order_id,
        reference: tx.reference,
        source: "webhook",
      },
    });

    const result = await processPaystackTransaction(tx, { source: "webhook" });

    if (result.status === "invalid" || result.status === "amount_mismatch" || result.status === "not_found") {
      await logAnalyticsEvent({
        eventType: "payment_webhook_rejected",
        userId: tx.metadata?.user_id ?? null,
        metadata: {
          orderId: tx.metadata?.order_id,
          reference: tx.reference,
          reason: result.message,
        },
      });
      console.error("[webhook] Payment event rejected", { reference: tx.reference, orderId: tx.metadata?.order_id, reason: result.message });
      return NextResponse.json({ received: true });
    }

    if (result.status === "already_confirmed") {
      await logAnalyticsEvent({
        eventType: "payment_webhook_duplicate",
        userId: tx.metadata?.user_id ?? null,
        metadata: {
          orderId: tx.metadata?.order_id,
          reference: tx.reference,
        },
      });
      console.info(`[webhook] Duplicate event for ref ${result.reference} — skipped`);
      return NextResponse.json({ received: true });
    }

    await logAnalyticsEvent({
      eventType: "payment_webhook_confirmed",
      userId: tx.metadata?.user_id ?? null,
      metadata: {
        orderId: tx.metadata?.order_id,
        reference: tx.reference,
      },
    });
    console.info(`[webhook] Payment confirmed for order ${result.orderId}`, { reference: result.reference });
  }

  return NextResponse.json({ received: true });
}
