"use client";

import { useState, RefObject } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface NavLink {
  label: string;
  ref: RefObject<HTMLElement | null>;
}

interface NavigationProps {
  links: NavLink[];
}

export function Navigation({ links }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (ref: RefObject<HTMLElement | null>) => {
    setMobileOpen(false);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-12 py-5 flex items-center justify-between bg-gradient-to-b from-[#1A0B2E]/80 to-transparent backdrop-blur-sm">
        <div className="text-2xl font-heading font-bold text-lilac tracking-wider hidden">
          DAOG
        </div>

        <Image src="/images/logo.png" alt="DAOG" width={50} height={50} />

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-8">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.ref)}
              className="nav-link"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-lilac p-2"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[#1A0B2E]/95 backdrop-blur-lg lg:hidden flex flex-col items-center justify-center gap-8"
          >
            {links.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => scrollTo(link.ref)}
                className="text-2xl font-heading font-bold text-soft-white hover:text-lilac transition-colors"
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
