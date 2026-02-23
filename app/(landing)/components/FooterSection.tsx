"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";

export default function FooterSection() {
  const footerRef = useRef<HTMLDivElement>(null);
  const footerInView = useInView(footerRef, { once: false, amount: 0.5 });

  const footerLinks = [
    { label: "Gadgets", href: "/gadgets" },
    { label: "Jerseys", href: "/jerseys" },
    { label: "Cars", href: "/cars" },
    { label: "Real Estate", href: "/realestate" },
  ];

  return (
    <motion.footer
      ref={footerRef}
      initial={{ y: 16, opacity: 0 }}
      animate={footerInView ? { y: 0, opacity: 1 } : { y: 16, opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="py-10 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-lilac">DAOG TECH HUB</span>
          </div>

          {/* Links */}
          <div className="flex gap-6 text-muted-lavender">
            {footerLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-lilac transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-muted-lavender text-sm text-center md:text-right">
            &copy; 2026 DAOG Tech Hub Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}
