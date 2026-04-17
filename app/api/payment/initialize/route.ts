export const dynamic = "force-dynamic";
// app/api/payment/initialize/route.ts
// Creates a Paystack transaction and returns the hosted payment URL.
// ORDER is created BEFORE payment so the reference is tied to a real DB row.
import { NextRequest, NextResponse } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";
import { paymentInitializeSchema } from "@/lib/validators";
import { createServiceRoleClient } from "@/supabase/server";
import { logAnalyticsEvent } from "@/lib/analytics-service";
import { getClientIp, strictLimiter } from "@/lib/rate-limit";
import type { Database } from "@/types/database";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = paymentInitializeSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors.map((err) => err.message).join(", "));

    const ip = getClientIp(req.headers);
    const limit = strictLimiter.check(ip);
    if (!limit.success) {
      return NextResponse.json(
        { error: `Rate limit exceeded. Retry after ${Math.ceil((limit.reset - Date.now()) / 1000)}s` },
        { status: 429 },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return serverError("PAYSTACK_SECRET_KEY is not configured");

    const { data: order, error: orderErr } = await supabase!
      .from("orders")
      .select("id, user_id, status, grand_total, currency, payment_reference")
      .eq("id", parsed.data.orderId)
      .single();

    if (orderErr || !order) return badRequest("Order not found");
    if (order.user_id !== user!.id) return badRequest("Order does not belong to this account");
    if (order.status !== "pending") return badRequest(`Order is already ${order.status}`);

    const amountKobo = Math.round(Number(order.grand_total) * 100);
    if (amountKobo < 100) return badRequest("Order total is too small to process");

    const reference = order.payment_reference ?? `daog_${parsed.data.orderId}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://daogtech.vercel.app";
    const callbackUrl = `${siteUrl}/payment/callback`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: parsed.data.email.trim().toLowerCase(),
        amount: amountKobo,
        reference,
        callback_url: callbackUrl,
        currency: order.currency ?? "NGN",
        channels: ["card", "bank", "ussd", "qr", "bank_transfer", "mobile_money"],
        metadata: {
          order_id: order.id,
          user_id: user!.id,
          customer_name: user?.email ?? "Customer",
          cancel_action: `${siteUrl}/checkout`,
        },
      }),
    });

    const data = await response.json();
    if (!data.status) {
      console.error("[payment/initialize]", data.message);
      return serverError(data.message ?? "Payment initialization failed");
    }

    const service = createServiceRoleClient();
    await service.from("orders").update({ payment_reference: reference }).eq("id", order.id);

    await logAnalyticsEvent({
      eventType: "checkout_initialized",
      userId: user!.id,
      metadata: {
        orderId: order.id,
        reference,
        amountKobo,
        currency: order.currency ?? "NGN",
      },
    });

    return ok({
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    });
  } catch (err) {
    console.error("[payment/initialize]", err);
    return serverError(err);
  }
}

