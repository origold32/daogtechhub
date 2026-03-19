// app/api/swap/route.ts
// POST → Submit a new swap request (authenticated users)
// GET  → List user's own swap requests

import { NextRequest } from "next/server";
import { ok, created, badRequest, serverError, withMeta, parsePagination } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const { page, pageSize, from, to } = parsePagination(searchParams);

    const { data, error: queryError, count } = await supabase!
      .from("swap_requests")
      .select("*", { count: "exact" })
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (queryError) return serverError(queryError);

    return withMeta(data, {
      page, pageSize,
      total: count ?? 0,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    });
  } catch (err) {
    return serverError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const body = await req.json();
    const {
      targetGadgetId,
      targetGadgetName,
      memory,
      batteryHealth,
      hasFaceId,
      repairHistory,
      imageUrls,
      videoUrl,
    } = body;

    if (!targetGadgetId || !memory || !batteryHealth) {
      return badRequest("targetGadgetId, memory, and batteryHealth are required");
    }

    if (!imageUrls || imageUrls.length < 1) {
      return badRequest("At least one image is required for the swap request");
    }

    const { data, error: insertError } = await supabase!
      .from("swap_requests")
      .insert({
        user_id: user!.id,
        target_gadget_id: targetGadgetId,
        target_gadget_name: targetGadgetName,
        memory,
        battery_health: batteryHealth,
        has_face_id: hasFaceId ?? false,
        repair_history: repairHistory ?? "None",
        image_urls: imageUrls,
        video_url: videoUrl ?? null,
        status: "pending",
      })
      .select()
      .single();

    if (insertError) return serverError(insertError);

    return created(data, "Swap request submitted! We'll review it within 24 hours.");
  } catch (err) {
    return serverError(err);
  }
}
