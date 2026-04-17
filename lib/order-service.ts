import { randomUUID } from "crypto";
import { createServiceRoleClient } from "@/supabase/server";
import type { Database } from "@/types/database";
import { createOrderSchema } from "./validators";

export type OrderItemInput = {
  productId: string;
  productCategory: Database["public"]["Tables"]["order_items"]["Row"]["product_category"];
  productName: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
};

export type OrderAmountSummary = {
  subtotalAmount: number;
  discountAmount: number;
  deliveryFee: number;
  grandTotal: number;
};

const DELIVERY_THRESHOLD = 100_000;
const DELIVERY_FEE = 5000;
const CURRENCY = "NGN";

export function calculateOrderAmounts(items: OrderItemInput[], discountAmount = 0): OrderAmountSummary {
  const subtotalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const safeDiscountAmount = Math.min(discountAmount, subtotalAmount);
  const deliveryFee = subtotalAmount >= DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const grandTotal = Math.max(0, subtotalAmount - safeDiscountAmount + deliveryFee);
  return { subtotalAmount, discountAmount: safeDiscountAmount, deliveryFee, grandTotal };
}

export function buildManualPaymentReference(): string {
  return `MANUAL-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function createOrderWithItems(userId: string, payload: unknown) {
  const parsed = createOrderSchema.parse(payload);
  const service = createServiceRoleClient();

  const amounts = calculateOrderAmounts(parsed.items, parsed.discountAmount);
  const status = parsed.paymentMethod === "paystack" ? "pending" : "awaiting_payment";
  const paymentReference = parsed.paymentMethod === "paystack" ? null : buildManualPaymentReference();

  const { data, error } = await service.rpc("create_order_with_items", {
    p_user_id: userId,
    p_status: status,
    p_payment_method: parsed.paymentMethod,
    p_payment_reference: paymentReference,
    p_notes: parsed.notes ?? null,
    p_subtotal_amount: amounts.subtotalAmount,
    p_discount_amount: amounts.discountAmount,
    p_delivery_fee: amounts.deliveryFee,
    p_grand_total: amounts.grandTotal,
    p_currency: CURRENCY,
    p_items: JSON.stringify(parsed.items),
  }).single();

  if (error || !data) {
    throw error ?? new Error("Order creation failed");
  }

  return { order: data as Database["public"]["Tables"]["orders"]["Row"], amounts };
}
