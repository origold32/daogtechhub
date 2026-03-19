import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DAOG Tech Hub collects, uses, and protects your personal data.",
  alternates: { canonical: "https://daogtechhub.com/legal/privacy" },
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
    <div className="text-white/60 leading-7 space-y-3 text-sm">{children}</div>
  </section>
);

export default function PrivacyPage() {
  const date = "March 2025";
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: {date}</p>

      <Section title="1. Who We Are">
        <p>DAOG Tech Hub (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates <strong className="text-white/80">daogtechhub.com</strong>, Nigeria&apos;s premier marketplace for gadgets, jerseys, cars, and real estate. This policy explains how we handle your personal data in compliance with the Nigeria Data Protection Regulation (NDPR) and applicable law.</p>
      </Section>

      <Section title="2. Data We Collect">
        <p>We collect data you provide directly:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Account information (name, email address, phone number)</li>
          <li>Delivery address and order history</li>
          <li>Payment details (processed securely by Paystack — we never store card numbers)</li>
          <li>Profile photo (optional)</li>
          <li>Messages sent through our contact form or WhatsApp</li>
        </ul>
        <p className="mt-3">We also collect automatically via cookies and analytics:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Device type, browser, IP address</li>
          <li>Pages visited, time spent, referring URLs</li>
          <li>Cart and wishlist interactions</li>
        </ul>
      </Section>

      <Section title="3. How We Use Your Data">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Process and fulfil your orders</li>
          <li>Send order confirmations and shipping updates</li>
          <li>Personalise your browsing experience and recommendations</li>
          <li>Detect and prevent fraud</li>
          <li>Respond to your enquiries and support requests</li>
          <li>Send promotional emails (you may unsubscribe at any time)</li>
          <li>Improve our platform through analytics</li>
        </ul>
      </Section>

      <Section title="4. Legal Basis for Processing">
        <p>We process your data under the following bases: <strong className="text-white/80">Contract</strong> (to fulfil orders), <strong className="text-white/80">Legitimate interests</strong> (fraud prevention, analytics), <strong className="text-white/80">Consent</strong> (marketing emails, cookies), and <strong className="text-white/80">Legal obligation</strong> (tax records).</p>
      </Section>

      <Section title="5. Data Sharing">
        <p>We share data only with trusted partners necessary to run our service:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong className="text-white/80">Supabase</strong> — database and authentication hosting</li>
          <li><strong className="text-white/80">Paystack</strong> — payment processing (PCI-DSS Level 1 compliant)</li>
          <li><strong className="text-white/80">Resend / Email provider</strong> — transactional email delivery</li>
          <li><strong className="text-white/80">Google Analytics</strong> — anonymised traffic analytics</li>
        </ul>
        <p className="mt-3">We never sell your personal data to third parties.</p>
      </Section>

      <Section title="6. Data Retention">
        <p>We retain your account data for as long as your account is active. Order records are kept for 7 years for tax and legal compliance. You may request deletion of your account at any time via <strong className="text-white/80">Settings → Delete Account</strong>.</p>
      </Section>

      <Section title="7. Your Rights">
        <p>Under the NDPR you have the right to: access your data, correct inaccuracies, request deletion, object to processing, and data portability. Email us at <strong className="text-white/80">privacy@daogtechhub.com</strong> to exercise any right.</p>
      </Section>

      <Section title="8. Cookies">
        <p>We use essential cookies (authentication, cart), functional cookies (preferences), and analytics cookies. See our <a href="/legal/cookies" className="text-lilac hover:underline">Cookie Policy</a> for full details.</p>
      </Section>

      <Section title="9. Security">
        <p>We use industry-standard security measures including TLS 1.3 encryption in transit, bcrypt-hashed authentication tokens, row-level security in our database, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
      </Section>

      <Section title="10. Contact">
        <p>Data Controller: DAOG Tech Hub, Lagos, Nigeria.<br />
        Email: <strong className="text-white/80">privacy@daogtechhub.com</strong><br />
        WhatsApp: Available on our website</p>
      </Section>
    </>
  );
}
