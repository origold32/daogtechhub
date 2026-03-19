import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "How DAOG Tech Hub uses cookies and tracking technologies.",
  alternates: { canonical: "https://daogtechhub.com/legal/cookies" },
};
const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
    <div className="text-white/60 leading-7 space-y-3 text-sm">{children}</div>
  </section>
);
export default function CookiesPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Cookie Policy</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: March 2025</p>
      <S title="What Are Cookies">
        <p>Cookies are small text files stored on your device when you visit a website. They help us recognise you and improve your experience on DAOG Tech Hub.</p>
      </S>
      <S title="Types of Cookies We Use">
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="font-semibold text-white/80 mb-1">Essential Cookies <span className="text-xs text-green-400 ml-2">Always Active</span></p>
            <p>Required for authentication (Supabase session), cart persistence, and security. These cannot be disabled as the site would not function without them.</p>
            <p className="mt-1 text-xs text-white/40">Examples: sb-access-token, sb-refresh-token, cart-storage</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="font-semibold text-white/80 mb-1">Functional Cookies</p>
            <p>Remember your preferences such as theme (dark/light), currency, and filter settings for a personalised experience.</p>
            <p className="mt-1 text-xs text-white/40">Examples: theme-store, filter-preferences</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="font-semibold text-white/80 mb-1">Analytics Cookies</p>
            <p>Help us understand how visitors interact with the site (pages visited, time spent, device type). Data is anonymised and aggregated.</p>
            <p className="mt-1 text-xs text-white/40">Examples: _ga, _gid (Google Analytics)</p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <p className="font-semibold text-white/80 mb-1">Payment Cookies</p>
            <p>Set by Paystack to enable secure payment processing and fraud detection during checkout.</p>
            <p className="mt-1 text-xs text-white/40">Managed by Paystack — PCI-DSS compliant</p>
          </div>
        </div>
      </S>
      <S title="Managing Cookies">
        <p>You can control cookies through your browser settings. Note that disabling essential cookies will prevent login and checkout from working. Most browsers allow you to view, delete, and block cookies — refer to your browser&apos;s help documentation for instructions.</p>
      </S>
      <S title="Third-Party Cookies">
        <p>Our embedded services (Paystack checkout, Google Analytics) may set their own cookies. We do not control these cookies and they are governed by the respective providers&apos; policies.</p>
      </S>
      <S title="Contact">
        <p>Questions? Email <strong className="text-white/80">privacy@daogtechhub.com</strong></p>
      </S>
    </>
  );
}
