// app/api/gadgets/[id]/route.ts

import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { ok, notFound, serverError, badRequest } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase
      .from("gadgets")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single();

    if (error || !data) return notFound("Gadget");
    return ok(data);
  } catch (err) {
    return serverError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { id } = await params;
    const body = await req.json();

    const { data, error } = await auth.supabase
      .from("gadgets")
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) return serverError(error);
    return ok(data, "Gadget updated");
  } catch (err) {
    return serverError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;

    const { id } = await params;

    // Soft-delete
    const { error } = await auth.supabase
      .from("gadgets")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) return serverError(error);
    return ok({ deleted: true }, "Gadget removed");
  } catch (err) {
    return serverError(err);
  }
}
