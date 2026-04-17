import { createHmac, randomUUID } from "crypto";
import { createServiceRoleClient } from "@/supabase/server";
import type { Database } from "@/types/database";
import { buildCustomerName } from "./user-service";

export type PaystackPaymentStatus = "success" | "failed" | "abandoned" | "pending";

export type ProcessPaymentResult = {
  reference: string;
  orderId: string;
  status: "confirmed" | "already_confirmed" | "invalid" | "amount_mismatch" | "not_found";
  receiptId?: string | null;
  receiptNumber?: string | null;
  amount?: number;
  currency?: string;
  paidAt?: string;
  message?: string;
};

export type PaystackTransaction = {
  status: PaystackPaymentStatus;
  reference: string;
  amount: number;
  currency: string;
  channel?: string;
  paid_at?: string;
  customer?: { email?: string };
  metadata?: Record<string, any>;
};

const EXPECTED_CURRENCY = "NGN";

export function verifyPaystackWebhookSignature(body: string, signature: string, secret: string): boolean {
  if (!secret || !signature) return false;
  const hash = createHmac("sha512", secret).update(body).digest("hex");
  return hash === signature;
}

export function validateTransactionAmounts(
  paidAmount: number,
  paidCurrency: string,
  expectedAmount: number,
  expectedCurrency: string
) {
  const normalizedCurrency = (paidCurrency || "").trim().toUpperCase();
  const expectedCurrencyNormalized = (expectedCurrency || EXPECTED_CURRENCY).trim().toUpperCase();
  if (normalizedCurrency !== expectedCurrencyNormalized) {
    return { valid: false, reason: `Currency mismatch: expected ${expectedCurrencyNormalized}, got ${normalizedCurrency}` };
  }
  if (paidAmount !== expectedAmount) {
    return { valid: false, reason: `Amount mismatch: expected ${expectedAmount} kobo, got ${paidAmount} kobo` };
  }
  return { valid: true };
}

function mapReceiptStatus(status?: string) {
  return status === "paid" ? "paid" : status === "refunded" ? "refunded" : "failed";
}

export async function fetchPaystackTransaction(reference: string) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY is not configured");

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  const body = await response.json();
  if (!body?.status || body?.data?.status !== "success") {
    throw new Error(body?.data?.gateway_response ?? body?.message ?? "Payment was not successful");
  }
  return body.data as PaystackTransaction;
}

export async function processPaystackTransaction(
  tx: PaystackTransaction,
  options: { expectedUserId?: string; source: "webhook" | "verify" }
): Promise<ProcessPaymentResult> {
  if (tx.status !== "success") {
    return { reference: tx.reference, orderId: tx.metadata?.order_id, status: "invalid", message: `Transaction status is ${tx.status}` };
  }

  const orderId = tx.metadata?.order_id;
  if (!orderId || typeof orderId !== "string") {
    return { reference: tx.reference, orderId: "", status: "invalid", message: "Order ID is missing from metadata" };
  }

  const service = createServiceRoleClient();
  const { data: order, error: orderError } = await service
    .from("orders")
    .select("id, user_id, status, payment_reference, payment_method, subtotal_amount, discount_amount, delivery_fee, grand_total, currency, order_items(*)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    console.error("[payment-service] order not found", { orderId, reference: tx.reference, error: orderError });
    return { reference: tx.reference, orderId, status: "not_found", message: "Order not found" };
  }

  if (options.expectedUserId && order.user_id !== options.expectedUserId) {
    return { reference: tx.reference, orderId, status: "invalid", message: "Order does not belong to authenticated user" };
  }

  const expectedAmount = Math.round(Number(order.grand_total ?? order.total_amount) * 100);
  const validation = validateTransactionAmounts(tx.amount, tx.currency, expectedAmount, order.currency ?? EXPECTED_CURRENCY);

  if (!validation.valid) {
    console.error("[payment-service] amount/currency validation failed", { orderId, reference: tx.reference, validation });
    await service.from("notifications").insert({
      user_id: order.user_id,
      type: "order",
      title: "Payment mismatch detected",
      message: `We received a payment from Paystack for reference ${tx.reference}, but the amount or currency does not match your order. Please contact support.",
      read: false,
      data: { order_id: orderId, reference: tx.reference },
    });
    return { reference: tx.reference, orderId, status: "amount_mismatch", message: validation.reason };
  }

  const { data: existingReceipt, error: receiptError } = await service
    .from("receipts")
    .select("id, receipt_number, status")
    .eq("payment_reference", tx.reference)
    .maybeSingle();

  if (receiptError) {
    console.error("[payment-service] receipt lookup failed", receiptError);
    throw receiptError;
  }

  if (existingReceipt) {
    return {
      reference: tx.reference,
      orderId,
      status: "already_confirmed",
      receiptId: existingReceipt.id,
      receiptNumber: existingReceipt.receipt_number,
      amount: tx.amount / 100,
      currency: tx.currency,
      paidAt: tx.paid_at,
      message: "Payment already processed",
    };
  }

  const updatedStatus = ["pending", "awaiting_payment", "payment_submitted"].includes(order.status)
    ? "confirmed"
    : order.status;

  if (updatedStatus === "confirmed" && order.status !== "confirmed") {
    await service.from("orders").update({
      status: "confirmed",
      payment_reference: tx.reference,
      payment_method: tx.channel ?? order.payment_method ?? "paystack",
    }).eq("id", orderId);
  }

  const receiptNumber = `RCP-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase()}`;
  const insertResult = await service.from("receipts").insert({
    order_id: orderId,
    user_id: order.user_id,
    receipt_number: receiptNumber,
    payment_reference: tx.reference,
    customer_name: tx.metadata?.customer_name ?? buildCustomerName({ email: tx.customer?.email }, null),
    customer_email: tx.customer?.email ?? null,
    amount_paid: tx.amount / 100,
    currency: tx.currency ?? EXPECTED_CURRENCY,
    payment_channel: tx.channel ?? "paystack",
    payment_date: tx.paid_at ?? new Date().toISOString(),
    items_snapshot: tx.metadata?.items ?? order.order_items ?? [],
    status: "paid",
  }).select("id, receipt_number").single();

  if (insertResult.error || !insertResult.data) {
    console.error("[payment-service] failed to create receipt", insertResult.error);
    throw insertResult.error ?? new Error("Failed to create receipt");
  }

  await service.from("notifications").insert({
    user_id: order.user_id,
    type: "order",
    title: "Payment confirmed ✓",
    message: `Your payment of ₦${(tx.amount / 100).toLocaleString()} has been received. Receipt: ${receiptNumber}`,
    read: false,
    data: { order_id: orderId, reference: tx.reference, receipt_number: receiptNumber },
  });

  return {
    reference: tx.reference,
    orderId,
    status: "confirmed",
    receiptId: insertResult.data.id,
    receiptNumber,
    amount: tx.amount / 100,
    currency: tx.currency,
    paidAt: tx.paid_at,
    message: "Payment confirmed",
  };
}
