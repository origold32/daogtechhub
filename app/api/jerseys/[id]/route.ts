import { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/supabase/server";
import { ok, notFound, serverError } from "@/lib/api-response";
import { requireRole } from "@/lib/auth-guard";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.from("jerseys").select("*").eq("id", id).eq("is_active", true).single();
    if (error || !data) return notFound("Jersey");
    return ok(data);
  } catch (err) { return serverError(err); }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;
    const { id } = await params;
    const body = await req.json();
    const { data, error } = await auth.supabase.from("jerseys").update({ ...body, updated_at: new Date().toISOString() }).eq("id", id).select().single();
    if (error) return serverError(error);
    return ok(data, "Jersey updated");
  } catch (err) { return serverError(err); }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole("admin");
    if (auth.error) return auth.error;
    const { id } = await params;
    const { error } = await auth.supabase.from("jerseys").update({ is_active: false, updated_at: new Date().toISOString() }).eq("id", id);
    if (error) return serverError(error);
    return ok({ deleted: true }, "Jersey removed");
  } catch (err) { return serverError(err); }
}
