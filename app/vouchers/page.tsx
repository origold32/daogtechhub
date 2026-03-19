"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Ticket, ArrowLeft, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function VouchersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#1a0b2e" }}>
      <div
        className="border-b border-white/10 px-4 py-4 flex items-center gap-4"
        style={{ background: "rgba(26,11,46,0.95)" }}
      >
        <button onClick={() => router.back()} className="text-muted-lavender hover:text-lilac transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-soft-white font-bold flex items-center gap-2">
          <Ticket className="w-5 h-5 text-lilac" /> Vouchers & Discounts
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-sm"
        >
          <div className="w-24 h-24 rounded-3xl bg-lilac/10 border border-lilac/20 flex items-center justify-center mx-auto mb-6">
            <Ticket className="w-10 h-10 text-lilac" strokeWidth={1.5} />
          </div>
          <h2 className="text-white font-black text-2xl mb-3">Coming Soon</h2>
          <p className="text-white/40 text-sm leading-relaxed mb-8">
            Exclusive vouchers, promo codes, and loyalty rewards are on their way.
            We&apos;re building something great for our customers.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => toast.success("You'll be notified when vouchers launch!")}
              className="w-full bg-lilac text-deep-purple hover:bg-lilac/90 rounded-2xl h-12 font-bold"
            >
              <Bell className="w-4 h-4 mr-2" /> Notify me when it launches
            </Button>
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full border-white/15 text-white/60 hover:bg-white/5 rounded-2xl h-11"
            >
              Back to shopping
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
