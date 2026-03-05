import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, product, message } = await req.json();

    if (!name || !email || !product || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 },
      );
    }

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Oriola (daog tech hub)" <${process.env.GMAIL_USER}>`,
      to: process.env.TO_EMAIL,
      replyTo: email,
      subject: `${product}`,
      html: `
            <div style="font-family: sans-serif; color: #1a1a2e;">
              <p style="white-space: pre-wrap;">${message}</p>

              <hr style="margin: 20px 0;" />

              <p style="font-size: 12px; color: #6b7280;">
                This email was sent from the contact form on DAOG TECH HUB website. Hit reply to respond directly to ${name}.
              </p>
            </div>
            `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 },
    );
  }
}
