export const dynamic = "force-dynamic";
// app/api/contact/route.ts
// POST → Saves enquiry to Supabase AND sends email via Resend

import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServerSupabaseClient } from "@/supabase/server";
import { ok, badRequest, serverError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { name, email, product, message } = await req.json();

    if (!name || !email || !product || !message) {
      return badRequest("All fields are required");
    }

    const supabase = await createServerSupabaseClient();

    // Persist to database
    const { error: dbError } = await supabase.from("contact_enquiries").insert({
      name, email, product, message,
    });

    if (dbError) console.error("[contact] DB insert error:", dbError);

    // Send email notification
    await resend.emails.send({
      from: "DAOG Tech Hub <no-reply@yourdomain.com>",
      to: "daogstore@gmail.com",
      replyTo: email,
      subject: `New enquiry from ${name}: ${product}`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a2e;">
          <h2 style="color: #a855f7; margin-bottom: 4px;">New Contact Form Submission</h2>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 20px;" />
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #a855f7;">${email}</a></p>
          <p><strong>Looking for:</strong> ${product}</p>
          <div style="background:#f9f5ff; border-left: 4px solid #a855f7; padding: 12px 16px; border-radius: 4px; margin-top: 16px;">
            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #9ca3af;">
            Sent from the DAOG Tech Hub contact form. Reply directly to respond to ${name}.
          </p>
        </div>
      `,
    });

    return ok({ sent: true }, "Your message has been sent!");
  } catch (err) {
    return serverError(err);
  }
}

// GET → Admin: list all enquiries
export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const resolved = searchParams.get("resolved");

    let query = supabase
      .from("contact_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (resolved === "true") query = query.eq("is_resolved", true);
    if (resolved === "false") query = query.eq("is_resolved", false);

    const { data, error } = await query;
    if (error) return serverError(error);
    return ok(data);
  } catch (err) {
    return serverError(err);
  }
}
