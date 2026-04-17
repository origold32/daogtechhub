import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { badRequest, ok, serverError } from "@/lib/api-response";
import { createServiceRoleClient } from "@/supabase/server";
import { apiLimiter, getClientIp } from "@/lib/rate-limit";

const analyticsEventSchema = z.object({
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

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const limit = apiLimiter.check(ip);
  if (!limit.success) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Retry after ${Math.ceil((limit.reset - Date.now()) / 1000)}s` },
      { status: 429 },
    );
  }

  try {
    const payload = await req.json();
    const parsed = analyticsEventSchema.safeParse(payload);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map((err) => err.message).join(", "));
    }

    const service = createServiceRoleClient();
    await service.from("analytics_events").insert({
      event_type: parsed.data.eventType,
      user_id: parsed.data.userId ?? null,
      product_id: parsed.data.productId ?? null,
      product_category: parsed.data.productCategory ?? null,
      metadata: parsed.data.metadata ?? null,
    });

    return ok({ recorded: true });
  } catch (err) {
    console.error("[analytics/log]", err);
    return serverError(err);
  }
}
