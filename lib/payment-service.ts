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

  const expectedAmount = Math.round(Number(order.grand_total) * 100);
  const validation = validateTransactionAmounts(tx.amount, tx.currency, expectedAmount, order.currency ?? EXPECTED_CURRENCY);

  if (!validation.valid) {
    console.error("[payment-service] amount/currency validation failed", { orderId, reference: tx.reference, validation });
    await service.from("notifications").insert({
      user_id: order.user_id,
      type: "order",
      title: "Payment mismatch detected",
      message: `We received a payment from Paystack for reference ${tx.reference}, but the amount or currency does not match your order. Please contact support.`,
      read: false,
      data: { order_id: orderId, reference: tx.reference },
    });
    return { reference: tx.reference, orderId, status: "amount_mismatch", message: validation.reason };
  }

  // Use atomic RPC function to process payment and prevent race conditions
  const { data: result, error: rpcError } = await service.rpc('process_payment', {
    p_order_id: orderId,
    p_payment_reference: tx.reference,
    p_amount_paid: tx.amount / 100,
    p_currency: tx.currency ?? EXPECTED_CURRENCY,
    p_channel: tx.channel ?? "paystack",
    p_paid_at: tx.paid_at ?? new Date().toISOString(),
    p_customer_name: tx.metadata?.customer_name ?? buildCustomerName({ email: tx.customer?.email }, null),
    p_customer_email: tx.customer?.email ?? null,
    p_items_snapshot: tx.metadata?.items ?? order.order_items ?? [],
  });

  if (rpcError) {
    console.error("[payment-service] RPC error", rpcError);
    throw rpcError;
  }

  if (result.status === 'already_confirmed') {
    return {
      reference: tx.reference,
      orderId,
      status: "already_confirmed",
      receiptId: result.receipt_id,
      receiptNumber: result.receipt_number,
      amount: tx.amount / 100,
      currency: tx.currency,
      paidAt: tx.paid_at,
      message: "Payment already processed",
    };
  }

  if (result.status === 'confirmed') {
    await service.from("notifications").insert({
      user_id: order.user_id,
      type: "order",
      title: "Payment confirmed",
      message: "Your payment of NGN " + (tx.amount / 100).toLocaleString() + " has been received. Receipt: " + result.receipt_number,
      read: false,
      data: { order_id: orderId, reference: tx.reference, receipt_number: result.receipt_number },
    });

    return {
      reference: tx.reference,
      orderId,
      status: "confirmed",
      receiptId: result.receipt_id,
      receiptNumber: result.receipt_number,
      amount: tx.amount / 100,
      currency: tx.currency,
      paidAt: tx.paid_at,
      message: "Payment confirmed",
    };
  }

  if (result.status === 'order_not_found') {
    return { reference: tx.reference, orderId, status: "not_found", message: "Order not found during processing" };
  }

  throw new Error(`Unexpected RPC result: ${JSON.stringify(result)}`);
}
