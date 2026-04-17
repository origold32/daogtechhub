export const dynamic = "force-dynamic";
// app/api/discount/route.ts
// POST → Validate and apply a discount code
// GET  → Admin: list all discount codes

import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/api-response";
import { requireAuth, requireRole } from "@/lib/auth-guard";
import { discountValidationSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const parsed = discountValidationSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors.map((err) => err.message).join(", "));
    const { code, cartTotal } = parsed.data;
    if (!code?.trim()) return badRequest("Discount code is required");

    const { data: discount, error: dbErr } = await supabase!
      .from("discount_codes")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .eq("is_active", true)
      .single();

    if (dbErr || !discount) return badRequest("Invalid or expired discount code");

    // Validate expiry
    if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
      return badRequest("This discount code has expired");
    }

    // Validate usage limit
    if (discount.max_uses && discount.times_used >= discount.max_uses) {
      return badRequest("This discount code has reached its usage limit");
    }

    // Validate minimum order
    if (discount.minimum_order && cartTotal < discount.minimum_order) {
      return badRequest(`Minimum order of ₦${discount.minimum_order.toLocaleString()} required`);
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (discount.type === "percentage") {
      discountAmount = Math.round((cartTotal * discount.value) / 100);
      if (discount.max_discount) discountAmount = Math.min(discountAmount, discount.max_discount);
    } else {
      discountAmount = Math.min(discount.value, cartTotal);
    }

    return ok({
      code:           discount.code,
      type:           discount.type,
      value:          discount.value,
      discountAmount,
      finalTotal:     cartTotal - discountAmount,
      description:    discount.description,
    }, `Code applied! You save ₦${discountAmount.toLocaleString()}`);
  } catch (err) { return serverError(err); }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;
    const { data } = await auth.supabase!.from("discount_codes").select("*").order("created_at", { ascending: false });
    return ok(data ?? []);
  } catch (err) { return serverError(err); }
}

