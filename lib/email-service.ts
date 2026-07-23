import { Resend } from "resend";

export interface ReceiptEmailParams {
  receiptNumber: string;
  amount: number;
  currency: string;
  paidAt: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
}

export async function sendReceiptEmail(params: ReceiptEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email-service] RESEND_API_KEY is not configured. Skipping receipt email.");
    return false;
  }

  const resend = new Resend(apiKey);
  const formatter = new Intl.NumberFormat("en-NG", { style: "currency", currency: params.currency || "NGN" });
  const formattedAmount = formatter.format(params.amount);
  const formattedDate = new Date(params.paidAt).toLocaleString("en-NG", { dateStyle: "long", timeStyle: "short" });

  try {
    const data = await resend.emails.send({
      from: "DAOG Store <no-reply@daogtech.com>", // Make sure to verify this domain in Resend
      to: params.customerEmail,
      subject: `Receipt for your payment - ${params.receiptNumber}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a2e; background-color: #ffffff; padding: 30px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #a855f7; margin: 0; font-size: 28px; font-weight: 900;">DAOG TECH HUB</h1>
            <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Payment Receipt</p>
          </div>
          
          <div style="background-color: #f9f5ff; padding: 20px; border-radius: 6px; border-left: 4px solid #a855f7; margin-bottom: 30px;">
            <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #1a1a2e;">Hello ${params.customerName},</h2>
            <p style="margin: 0; color: #4b5563; line-height: 1.6;">
              Thank you for your purchase! We've successfully received your payment of <strong>${formattedAmount}</strong>.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tbody>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Receipt Number</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1a1a2e; font-family: monospace;">${params.receiptNumber}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Order ID</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1a1a2e; font-family: monospace;">#${params.orderId.slice(0, 8).toUpperCase()}</td>
              </tr>
              <tr style="border-bottom: 1px solid #e5e7eb;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">Payment Date</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1a1a2e;">${formattedDate}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 16px; font-weight: 600;">Total Paid</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 900; color: #a855f7; font-size: 18px;">${formattedAmount}</td>
              </tr>
            </tbody>
          </table>

          <div style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 40px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
            <p style="margin: 0;">If you have any questions about your order, please contact our support team.</p>
            <p style="margin: 10px 0 0 0;">&copy; ${new Date().getFullYear()} DAOG Tech Hub. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    console.info(`[email-service] Receipt sent to ${params.customerEmail} (id: ${data.data?.id})`);
    return true;
  } catch (err) {
    console.error("[email-service] Error sending receipt:", err);
    return false;
  }
}
