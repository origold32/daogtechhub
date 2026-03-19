// app/checkout/verify/page.tsx
// Paystack redirects here after payment with ?reference=...
// We verify server-side and show the result.
"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Link from "next/link";

function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const reference = params.get("reference") || params.get("trxref");
    if (!reference) { setStatus("failed"); setMessage("No payment reference found."); return; }

    fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setStatus("success");
          setOrderId(json.data?.orderId ?? null);
          clearCart();
        } else {
          setStatus("failed");
          setMessage(json.error ?? "Payment verification failed.");
        }
      })
      .catch(() => { setStatus("failed"); setMessage("Network error — please contact support."); });
  }, [params, clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#1a0b2e" }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full text-center space-y-6"
      >
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-lilac animate-spin mx-auto" />
            <p className="text-white font-semibold text-lg">Verifying your payment…</p>
            <p className="text-white/40 text-sm">Please wait, do not close this page.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle2 className="w-20 h-20 text-green-400 mx-auto" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-bold text-white">Payment Successful! 🎉</h1>
              <p className="text-white/50 mt-2 text-sm">
                Your order has been confirmed. We&apos;ll contact you with delivery details.
              </p>
              {orderId && (
                <p className="text-white/30 text-xs mt-2">Order ID: <span className="font-mono text-lilac">{orderId}</span></p>
              )}
            </div>
            <div className="flex gap-3">
              <Link href="/orders" className="flex-1 h-11 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm flex items-center justify-center hover:bg-[#c990ff] transition-all">
                View Orders
              </Link>
              <Link href="/" className="flex-1 h-11 rounded-xl border border-white/[0.12] text-white/70 text-sm font-medium flex items-center justify-center hover:bg-white/[0.05] transition-all">
                Continue Shopping
              </Link>
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle className="w-20 h-20 text-red-400 mx-auto" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl font-bold text-white">Payment Failed</h1>
              <p className="text-white/50 mt-2 text-sm">{message || "Something went wrong with your payment."}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.push("/checkout")}
                className="flex-1 h-11 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm hover:bg-[#c990ff] transition-all">
                Try Again
              </button>
              <Link href="/" className="flex-1 h-11 rounded-xl border border-white/[0.12] text-white/70 text-sm font-medium flex items-center justify-center hover:bg-white/[0.05] transition-all">
                Go Home
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0b2e" }}>
        <Loader2 className="w-10 h-10 text-lilac animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
