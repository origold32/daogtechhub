import { z } from "zod";

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  productCategory: z.enum(["gadget", "jersey", "car", "realestate"]),
  productName: z.string().min(1),
  productImage: z.string().max(2048).optional().default("").transform((value) => value ?? ""),
  unitPrice: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1),
  paymentMethod: z.enum(["paystack", "transfer", "ussd"]),
  discountAmount: z.number().nonnegative().default(0),
  notes: z.string().max(1000).optional().nullable(),
});

export const paymentInitializeSchema = z.object({
  email: z.string().email(),
  orderId: z.string().uuid(),
});

export const paymentVerifySchema = z.object({
  reference: z.string().min(1),
});

export const manualPaymentSubmitSchema = z.object({
  orderId: z.string().uuid(),
  note: z.string().min(10).max(1000),
  proofUrl: z.string().url().optional(),
});

export const analyticsEventLogSchema = z.object({
  eventType: z.enum([
    "product_view",
    "add_to_cart",
    "checkout_started",
    "payment_webhook_received",
    "payment_webhook_confirmed",
    "payment_webhook_duplicate",
    "payment_webhook_rejected",
    "payment_webhook_invalid_signature",
    "payment_verification_attempt",
    "payment_verification_confirmed",
    "payment_verification_failed",
    "manual_payment_approved",
    "manual_payment_rejected",
  ]),
  userId: z.string().uuid().optional(),
  productId: z.string().optional(),
  productCategory: z.enum(["gadget", "jersey", "car", "realestate"]).optional(),
  metadata: z.record(z.any()).optional(),
});

export const discountValidationSchema = z.object({
  code: z.string().min(1),
  cartTotal: z.number().nonnegative(),
});
