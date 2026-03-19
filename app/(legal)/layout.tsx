import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: true, follow: true },
};

const LEGAL_LINKS = [
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms",   label: "Terms of Service" },
  { href: "/legal/cookies", label: "Cookie Policy" },
  { href: "/legal/refund",  label: "Refund Policy" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      {/* Top nav */}
      <header className="border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
            ← Back to DAOG Tech Hub
          </Link>
          <nav className="hidden sm:flex items-center gap-4">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.href} href={l.href}
                className="text-white/40 hover:text-lilac text-xs transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {children}
      </main>

      <footer className="border-t border-white/[0.06] px-6 py-6 text-center">
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} DAOG Tech Hub. All rights reserved.
          {" · "}
          {LEGAL_LINKS.map((l, i) => (
            <span key={l.href}>
              <Link href={l.href} className="hover:text-lilac transition-colors">{l.label}</Link>
              {i < LEGAL_LINKS.length - 1 && " · "}
            </span>
          ))}
        </p>
      </footer>
    </div>
  );
}
