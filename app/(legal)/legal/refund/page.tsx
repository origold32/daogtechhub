import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Refund & Returns Policy",
  description: "DAOG Tech Hub refund, return, and exchange policy for all product categories.",
  alternates: { canonical: "https://daogtechhub.com/legal/refund" },
};
const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
    <div className="text-white/60 leading-7 space-y-3 text-sm">{children}</div>
  </section>
);
const Badge = ({ text, color }: { text: string; color: string }) => (
  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold mr-2 ${color}`}>{text}</span>
);
export default function RefundPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Refund & Returns Policy</h1>
      <p className="text-white/40 text-sm mb-4">Last updated: March 2025</p>
      <div className="p-4 rounded-xl bg-lilac/10 border border-lilac/20 mb-8">
        <p className="text-white/80 text-sm">🛡️ <strong>Our Commitment:</strong> We stand behind every product sold on DAOG Tech Hub. If something isn&apos;t right, we&apos;ll make it right.</p>
      </div>
      <S title="Return Window by Category">
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { cat: "Gadgets",     days: "7 days",   note: "Sealed, unused, original packaging" },
            { cat: "Jerseys",     days: "14 days",  note: "Unworn, tags attached" },
            { cat: "Cars",        days: "72 hours", note: "Pre-sale inspection recommended" },
            { cat: "Real Estate", days: "N/A",      note: "Subject to contract terms" },
          ].map((r) => (
            <div key={r.cat} className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
              <p className="font-semibold text-white/90">{r.cat}</p>
              <p className="text-lilac font-bold text-lg">{r.days}</p>
              <p className="text-xs text-white/40 mt-1">{r.note}</p>
            </div>
          ))}
        </div>
      </S>
      <S title="Conditions for Return">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Item must be in original condition with all packaging and accessories</li>
          <li>Proof of purchase (order confirmation email) is required</li>
          <li>Items showing signs of use, damage, or tampering are not eligible</li>
          <li>Software, digital goods, and sealed hygiene products are non-refundable once opened</li>
        </ul>
      </S>
      <S title="How to Request a Refund">
        <ol className="list-decimal list-inside space-y-2 ml-2">
          <li>Contact us within the return window at <strong className="text-white/80">support@daogtechhub.com</strong> or via WhatsApp</li>
          <li>Include your order ID, photos of the item, and reason for return</li>
          <li>We will provide a Return Merchandise Authorisation (RMA) number within 24 hours</li>
          <li>Ship the item back to our Lagos address (return shipping cost may apply)</li>
          <li>Refund is processed within <strong className="text-white/80">3–5 business days</strong> of receiving the returned item</li>
        </ol>
      </S>
      <S title="Refund Methods">
        <p>Refunds are issued via the original payment method:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Card payments: refunded to the original card (3–5 banking days)</li>
          <li>Bank transfer: refunded to your registered bank account (1–2 business days)</li>
          <li>Store credit: instant, with a 5% bonus added</li>
        </ul>
      </S>
      <S title="Defective or Wrong Items">
        <p>If you receive a defective item or the wrong product, we will arrange a free collection and provide a full refund or replacement at no extra cost — regardless of when you purchased.</p>
      </S>
      <S title="Exchanges">
        <p>We offer exchanges for a different size or colour where available. Contact us within the return window to arrange. If the exchanged item has a different price, the difference will be charged or refunded accordingly.</p>
      </S>
      <S title="Contact">
        <p>Email: <strong className="text-white/80">support@daogtechhub.com</strong><br />WhatsApp: Available on the website · Response within 2 hours (Mon–Sat, 8am–8pm WAT)</p>
      </S>
    </>
  );
}
