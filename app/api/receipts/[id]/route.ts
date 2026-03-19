import { NextRequest } from "next/server";
import { ok, notFound, serverError } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-guard";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { user, supabase, error } = await requireAuth();
    if (error) return error;

    const { data, error: qErr } = await supabase!
      .from("receipts")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user!.id)
      .single();

    if (qErr || !data) return notFound("Receipt");
    return ok(data);
  } catch (err) { return serverError(err); }
}
