// app/api/payment/initialize/route.ts
// Creates a Paystack transaction and returns the hosted payment URL.
// ORDER is created BEFORE payment so the reference is tied to a real DB row.
import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";
import type { Database } from "@/types/database";
import { randomUUID } from "crypto";

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
    const { user, supabase, profile, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const { amount, email, orderId, items, deliveryNote } = body as {
      amount: number;
      email: string;
      orderId: string;
      items?: Array<{ name: string; qty: number; price: number }>;
      deliveryNote?: string;
    };

    if (!amount || amount < 100)   return badRequest("Amount must be at least ₦100");
    if (!email?.trim())            return badRequest("Email is required");
    if (!orderId)                  return badRequest("Order ID is required");

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) return serverError("PAYSTACK_SECRET_KEY is not configured");

    // Verify the order belongs to this user and is still pending
    const { data: order, error: orderErr } = await supabase!
      .from("orders")
      .select("id, user_id, status, total_amount")
      .eq("id", orderId)
      .single();

    if (orderErr || !order)          return badRequest("Order not found");
    if (order.user_id !== user!.id)  return badRequest("Order does not belong to this account");
    if (order.status !== "pending")  return badRequest(`Order is already ${order.status}`);

    // Unique reference — deterministic for idempotency: daog_{orderId}_{uuid}
    const reference = `daog_${orderId}_${randomUUID().replace(/-/g, "").slice(0, 12)}`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://daogtech.vercel.app";
    const callbackUrl = `${siteUrl}/payment/callback`;

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        amount: Math.round(amount * 100), // NGN → kobo
        reference,
        callback_url: callbackUrl,
        currency: "NGN",
        channels: ["card", "bank", "ussd", "qr", "bank_transfer", "mobile_money"],
        metadata: {
          order_id: orderId,
          user_id: user!.id,
          customer_name: buildCustomerName(user, profile),
          items: items ?? [],
          delivery_note: deliveryNote ?? "",
          cancel_action: `${siteUrl}/checkout`,
        },
      }),
    });

    const data = await response.json();
    if (!data.status) {
      console.error("[payment/initialize]", data.message);
      return serverError(data.message ?? "Payment initialization failed");
    }

    // Store the reference on the order so webhook can match it
    await supabase!
      .from("orders")
      .update({ payment_reference: reference })
      .eq("id", orderId);

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
