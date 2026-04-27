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
  // Round to 2 decimal places to avoid floating-point issues
  const roundedGrandTotal = Math.round(grandTotal * 100) / 100;
  return { subtotalAmount, discountAmount: safeDiscountAmount, deliveryFee, grandTotal: roundedGrandTotal };
}

export function buildManualPaymentReference(): string {
  return `MANUAL-${Date.now()}-${randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export async function createOrderWithItems(userId: string, payload: unknown) {
  const parsed = createOrderSchema.parse(payload);
  const service = createServiceRoleClient();
  type ProductTable = "gadgets" | "jerseys" | "cars" | "real_estates";

  // Validate products exist, have sufficient stock, and prices match
  for (const item of parsed.items) {
    let product: any = null;
    let tableName: ProductTable;
    switch (item.productCategory) {
      case 'gadget':
        tableName = 'gadgets';
        break;
      case 'jersey':
        tableName = 'jerseys';
        break;
      case 'car':
        tableName = 'cars';
        break;
      case 'realestate':
        tableName = 'real_estates';
        break;
      default:
        throw new Error(`Invalid product category: ${item.productCategory}`);
    }

    const { data, error } = await service.from(tableName).select('*').eq('id', item.productId).single();
    if (error || !data) {
      throw new Error(`Product ${item.productId} not found`);
    }
    product = data;

    // Check price matches (prevent tampering)
    if (product.price !== item.unitPrice) {
      throw new Error(`Price mismatch for product ${item.productId}: expected ${product.price}, got ${item.unitPrice}`);
    }

    // Check stock if available (assume stock field exists or default to unlimited)
    const stock = product.stock ?? Infinity;
    if (stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${item.productId}: available ${stock}, requested ${item.quantity}`);
    }
  }

  // Re-validate discount if code provided
  if (parsed.discountCode) {
    const subtotal = parsed.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const discountRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/discount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: parsed.discountCode, cartTotal: subtotal }),
    });
    const discountData = await discountRes.json();
    if (!discountData.success) {
      throw new Error(`Discount code invalid: ${discountData.error}`);
    }
    if (discountData.data.discountAmount !== parsed.discountAmount) {
      throw new Error(`Discount amount mismatch: expected ${discountData.data.discountAmount}, got ${parsed.discountAmount}`);
    }
  }

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
