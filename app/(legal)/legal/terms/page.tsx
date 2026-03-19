import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Terms of Service",
  description: "DAOG Tech Hub terms and conditions of use.",
  alternates: { canonical: "https://daogtechhub.com/legal/terms" },
};
const S = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>
    <div className="text-white/60 leading-7 space-y-3 text-sm">{children}</div>
  </section>
);
export default function TermsPage() {
  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
      <p className="text-white/40 text-sm mb-10">Last updated: March 2025</p>
      <S title="1. Acceptance">
        <p>By accessing or using daogtechhub.com you agree to be bound by these Terms of Service and all applicable Nigerian laws and regulations. If you disagree, do not use the platform.</p>
      </S>
      <S title="2. Eligibility">
        <p>You must be at least 18 years old to create an account and make purchases. By using this platform, you confirm you meet this age requirement.</p>
      </S>
      <S title="3. Account Responsibility">
        <p>You are responsible for maintaining the confidentiality of your account credentials. You accept responsibility for all activities that occur under your account. Notify us immediately at <strong className="text-white/80">support@daogtechhub.com</strong> if you suspect unauthorised access.</p>
      </S>
      <S title="4. Products & Listings">
        <p>DAOG Tech Hub acts as a marketplace. Product descriptions, images, and specifications are provided in good faith. We make every effort to ensure accuracy but cannot guarantee completeness. Prices are in Nigerian Naira (₦) and subject to change without notice.</p>
        <p>All products are subject to availability. In the event of unavailability after order placement, we will contact you to arrange a refund or alternative.</p>
      </S>
      <S title="5. Orders & Payments">
        <p>Orders are confirmed upon successful payment processing via Paystack. You will receive an email confirmation with your order details. DAOG Tech Hub reserves the right to cancel orders suspected of fraud.</p>
      </S>
      <S title="6. Delivery">
        <p>Delivery times are estimates. We are not liable for delays caused by logistics partners, weather, or other factors beyond our control. Risk of loss passes to you upon delivery to the specified address.</p>
      </S>
      <S title="7. Prohibited Uses">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Reselling products obtained from this platform without authorisation</li>
          <li>Using automated bots or scrapers</li>
          <li>Submitting fraudulent orders or false information</li>
          <li>Harassing staff or other users</li>
          <li>Circumventing any security measures</li>
        </ul>
      </S>
      <S title="8. Intellectual Property">
        <p>All content on this platform — including logos, text, images, and software — is the property of DAOG Tech Hub and protected by Nigerian copyright law. You may not reproduce or redistribute content without express written permission.</p>
      </S>
      <S title="9. Limitation of Liability">
        <p>To the maximum extent permitted by law, DAOG Tech Hub is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. Our total liability shall not exceed the amount paid for the relevant order.</p>
      </S>
      <S title="10. Governing Law">
        <p>These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State.</p>
      </S>
      <S title="11. Changes to Terms">
        <p>We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance. We will notify registered users by email of material changes.</p>
      </S>
      <S title="12. Contact">
        <p>Email: <strong className="text-white/80">support@daogtechhub.com</strong> · Lagos, Nigeria</p>
      </S>
    </>
  );
}
