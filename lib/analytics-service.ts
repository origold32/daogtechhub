import type { Json } from "@/types/database";
import { createServiceRoleClient } from "@/supabase/server";

export type AnalyticsEventType =
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "checkout_initialized"
  | "payment_verification_attempt"
  | "payment_verification_confirmed"
  | "payment_verification_failed"
  | "payment_webhook_received"
  | "payment_webhook_confirmed"
  | "payment_webhook_duplicate"
  | "payment_webhook_rejected"
  | "payment_webhook_invalid_signature"
  | "manual_payment_approved"
  | "manual_payment_rejected";

export type ProductCategory = "gadget" | "jersey" | "car" | "realestate" | null;

export async function logAnalyticsEvent(options: {
  eventType: AnalyticsEventType;
  userId?: string | null;
  productId?: string | null;
  productCategory?: ProductCategory;
  metadata?: Json | null;
}) {
  try {
    const service = createServiceRoleClient();
    await service.from("analytics_events").insert({
      event_type: options.eventType,
      user_id: options.userId ?? null,
      product_id: options.productId ?? null,
      product_category: options.productCategory ?? null,
      metadata: options.metadata ?? null,
    });
  } catch (error) {
    console.warn("[analytics] failed to record event", error, options);
  }
}
