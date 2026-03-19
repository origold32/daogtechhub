"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { Shield, FileText, Cookie, RotateCcw } from "lucide-react";

export default function FooterSection() {
  const footerRef = useRef<HTMLDivElement>(null);
  const footerInView = useInView(footerRef, { once: false, amount: 0.3 });

  const shopLinks = [
    { label: "Gadgets",     href: "/gadgets" },
    { label: "Jerseys",     href: "/jerseys" },
    { label: "Cars",        href: "/cars" },
    { label: "Real Estate", href: "/realestate" },
  ];

  const legalLinks = [
    { label: "Privacy Policy",     href: "/legal/privacy", icon: Shield },
    { label: "Terms of Service",   href: "/legal/terms",   icon: FileText },
    { label: "Cookie Policy",      href: "/legal/cookies", icon: Cookie },
    { label: "Refund Policy",      href: "/legal/refund",  icon: RotateCcw },
  ];

  return (
    <motion.footer
      ref={footerRef}
      initial={{ y: 16, opacity: 0 }}
      animate={footerInView ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-12 px-6 lg:px-8 border-t border-white/[0.06]"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <span className="text-xl font-bold text-lilac tracking-wide">DAOG TECH HUB</span>
            <p className="text-white/35 text-sm leading-relaxed max-w-xs">
              Nigeria&apos;s #1 premium marketplace for gadgets, jerseys, cars and real estate. Trusted by thousands of Nigerians.
            </p>
          </div>

          {/* Shop */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Shop</p>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/40 hover:text-lilac text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Legal</p>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="flex items-center gap-1.5 text-white/40 hover:text-lilac text-sm transition-colors group">
                    <link.icon size={11} className="shrink-0 group-hover:text-lilac" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/[0.06]">
          <p className="text-white/25 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} DAOG Tech Hub Ltd. All rights reserved. · Lagos, Nigeria 🇳🇬
          </p>
          <div className="flex items-center gap-4 text-white/25 text-xs">
            <span>🔒 SSL Secured</span>
            <span>💳 Paystack Verified</span>
            <span>✅ NDPR Compliant</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
