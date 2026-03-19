// app/payment/callback/page.tsx
// Paystack redirects here after payment. Extracts reference, verifies server-side, shows receipt.
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Loader2, Download,
  Receipt, ArrowRight, ShoppingBag,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ReceiptData {
  reference: string;
  amount: number;
  status: string;
  channel: string;
  paidAt: string;
  orderId: string | null;
  receiptNumber: string | null;
  customerEmail: string | null;
}

function CallbackContent() {
  const params               = useSearchParams();
  const { clearCart }        = useCartStore();
  const [phase, setPhase]    = useState<"loading" | "success" | "failed">("loading");
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [errMsg, setErrMsg]  = useState("");

  useEffect(() => {
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) {
      setPhase("failed");
      setErrMsg("No payment reference found. Contact support if you were charged.");
      return;
    }

    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ reference }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setReceipt(json.data);
          setPhase("success");
          clearCart();
        } else {
          setPhase("failed");
          setErrMsg(json.error ?? "Payment verification failed.");
        }
      })
      .catch(() => {
        setPhase("failed");
        setErrMsg("Network error — please contact support with your reference.");
      });
  }, [params, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#1a0b2e" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        {/* ── Loading ────────────────────────────────────────────────────── */}
        {phase === "loading" && (
          <div className="text-center space-y-4">
            <Loader2 className="w-16 h-16 text-lilac animate-spin mx-auto" />
            <h2 className="text-white font-bold text-xl">Verifying your payment…</h2>
            <p className="text-white/40 text-sm">Please wait — do not close this page.</p>
          </div>
        )}

        {/* ── Success + Receipt ──────────────────────────────────────────── */}
        {phase === "success" && receipt && (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-3">
              <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" strokeWidth={1.5} />
              <div>
                <h1 className="text-2xl font-black text-white">Payment Successful! 🎉</h1>
                <p className="text-white/50 text-sm mt-1">
                  Your order is confirmed. A receipt has been sent to{" "}
                  {receipt.customerEmail
                    ? <span className="text-white/70">{receipt.customerEmail}</span>
                    : "your email"}.
                </p>
              </div>
            </div>

            {/* Receipt card */}
            <div className="rounded-2xl border border-white/15 bg-white/[0.04] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/10 bg-white/[0.03]">
                <Receipt size={15} className="text-[#d4a5ff]" />
                <span className="text-white/70 text-xs font-semibold uppercase tracking-widest">Receipt</span>
              </div>
              <div className="px-5 py-4 space-y-3 text-sm">
                {[
                  ["Receipt No.",    receipt.receiptNumber ?? "—"],
                  ["Reference",      receipt.reference],
                  ["Amount Paid",    formatCurrency(receipt.amount)],
                  ["Payment Method", receipt.channel?.toUpperCase() ?? "Paystack"],
                  ["Date",           receipt.paidAt ? new Date(receipt.paidAt).toLocaleString("en-NG") : "—"],
                  ["Status",         "✓ Paid"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <span className="text-white/40 shrink-0">{label}</span>
                    <span className={`text-right font-medium ${value === "✓ Paid" ? "text-green-400" : "text-white/80"} font-mono text-xs`}>
                      {value}
                    </span>
                  </div>
                ))}
                {receipt.orderId && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-white/40 shrink-0">Order ID</span>
                    <span className="text-white/80 font-mono text-xs text-right">
                      #{receipt.orderId.slice(0, 8).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/orders" className="flex-1">
                <Button className="w-full bg-[#d4a5ff] text-[#1a0b2e] hover:bg-[#c990ff] rounded-xl h-11 font-bold">
                  <ShoppingBag size={14} className="mr-2" /> View Orders
                </Button>
              </Link>
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full border-white/15 text-white/60 hover:bg-white/5 rounded-xl h-11">
                  Keep Shopping <ArrowRight size={14} className="ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Failed ────────────────────────────────────────────────────── */}
        {phase === "failed" && (
          <div className="text-center space-y-6">
            <XCircle className="w-20 h-20 text-red-400 mx-auto" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
              <p className="text-white/50 mt-2 text-sm leading-relaxed">
                {errMsg || "Something went wrong with your payment. You have not been charged."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/checkout">
                <Button className="w-full bg-[#d4a5ff] text-[#1a0b2e] hover:bg-[#c990ff] rounded-xl h-11 font-bold">
                  Try Again
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full border-white/15 text-white/60 hover:bg-white/5 rounded-xl h-11">
                  Go Home
                </Button>
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0b2e" }}>
        <Loader2 className="w-10 h-10 text-lilac animate-spin" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
