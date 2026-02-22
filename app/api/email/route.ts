import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { name, email, product, message } = await req.json();

    if (!name || !email || !product || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    await resend.emails.send({
      from: "DAOG Store <no-reply@yourdomain.com>", // 👈 replace with your verified domain
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
            This email was sent from the contact form on your DAOG website.
            Hit reply to respond directly to ${name}.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }
}
