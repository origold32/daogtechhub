// components/ui/CookieBanner.tsx — GDPR/NDPR cookie consent
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("daog-cookie-consent");
    if (!consent) setTimeout(() => setVisible(true), 2000);
  }, []);

  function accept() { localStorage.setItem("daog-cookie-consent", "all"); setVisible(false); }
  function decline() { localStorage.setItem("daog-cookie-consent", "essential"); setVisible(false); }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-50"
        >
          <div className="rounded-2xl border border-white/[0.12] bg-[#1a0b2e]/95 backdrop-blur-xl p-4 shadow-2xl shadow-black/50">
            <div className="flex items-start gap-3">
              <Cookie size={18} className="text-lilac shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-semibold mb-1">We use cookies 🍪</p>
                <p className="text-white/45 text-xs leading-relaxed">
                  We use cookies to improve your experience. By continuing, you agree to our{" "}
                  <Link href="/legal/cookies" className="text-lilac hover:underline">Cookie Policy</Link>.
                </p>
                <div className="flex gap-2 mt-3">
                  <button onClick={accept}
                    className="flex-1 h-8 rounded-lg bg-[#d4a5ff] text-[#1a0b2e] text-xs font-bold hover:bg-[#c990ff] transition-all">
                    Accept All
                  </button>
                  <button onClick={decline}
                    className="flex-1 h-8 rounded-lg border border-white/[0.12] text-white/60 text-xs font-medium hover:bg-white/[0.05] transition-all">
                    Essential Only
                  </button>
                </div>
              </div>
              <button onClick={() => setVisible(false)} className="text-white/30 hover:text-white/60 transition-colors shrink-0">
                <X size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
