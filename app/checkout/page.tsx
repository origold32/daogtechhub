"use client";

import { useState } from "react";
import AuthGuard from "@/components/providers/AuthGuard";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Building2, Phone, Check, Lock, ShieldCheck,
  ChevronRight, ChevronLeft, MapPin, User, Mail, Tag,
  AlertCircle, Loader2, ExternalLink,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/formatCurrency";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

type Step = 1 | 2 | 3;

const PAYMENT_METHODS = [
  { id: "paystack", label: "Pay with Paystack",   icon: CreditCard, desc: "Card, bank transfer, USSD — powered by Paystack" },
  { id: "transfer", label: "Manual Bank Transfer", icon: Building2,  desc: "Pay directly to our bank account" },
  { id: "ussd",     label: "USSD / Mobile Money",  icon: Phone,      desc: "*737#, *822#, *966# etc." },
];

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="block text-[11px] text-white/40 font-medium tracking-widest uppercase">{label}</label>
    {children}
    {error && <p className="text-[11px] text-red-400">{error}</p>}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) => (
  <input
    {...props}
    className={cn(
      "w-full h-11 px-3 rounded-xl border bg-white/[0.04] text-sm text-white placeholder-white/20 outline-none transition-all",
      props.error ? "border-red-500/50" : "border-white/[0.08] focus:border-white/25 focus:bg-white/[0.06]",
      props.className
    )}
  />
);

function CheckoutPageInner() {
  const router = useRouter();
  const { items, getTotalPrice, getTotalItems, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [step,        setStep]        = useState<Step>(1);
  const [payMethod,   setPayMethod]   = useState("paystack");
  const [loading,     setLoading]     = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discount,    setDiscount]    = useState<{ discountAmount: number; code: string; description: string } | null>(null);
  const [discountLoading, setDiscountLoading] = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: user?.firstName ?? "", lastName: user?.lastName  ?? "",
    email: user?.email ?? "", phone: user?.phone ?? "",
    address: "", city: "", state: "Lagos",
  });

  const subtotal    = getTotalPrice();
  const discountAmt = discount?.discountAmount ?? 0;
  const delivery    = subtotal >= 100000 ? 0 : 5000;
  const total       = subtotal - discountAmt + delivery;

  if (getTotalItems() === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#1a0b2e" }}>
        <div className="text-center space-y-3">
          <p className="text-white text-xl font-bold">Your cart is empty</p>
          <Link href="/" className="text-lilac hover:underline text-sm">Continue shopping →</Link>
        </div>
      </div>
    );
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.email.trim())     e.email = "Required";
    if (!form.phone.trim())     e.phone = "Required";
    if (!form.address.trim())   e.address = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function applyDiscount() {
    if (!discountCode.trim()) return;
    setDiscountLoading(true);
    try {
      const res = await fetch("/api/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, cartTotal: subtotal }),
      });
      const json = await res.json();
      if (json.success) { setDiscount(json.data); toast.success(json.message); }
      else { toast.error(json.error); }
    } catch { toast.error("Failed to apply code"); }
    finally { setDiscountLoading(false); }
  }

  async function createOrder(): Promise<string | null> {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({
          productId: i.id, productCategory: i.category, productName: i.name,
          productImage: i.image, unitPrice: i.price, quantity: i.quantity,
        })),
        paymentMethod: payMethod,
        notes: `Delivery: ${form.address}, ${form.city}, ${form.state}. Phone: ${form.phone}.${discount ? ` Discount: ${discount.code}` : ""}`,
      }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error ?? "Order creation failed");
    return json.data?.id ?? null;
  }

  async function handlePay() {
    if (!validate()) { setStep(1); return; }
    setLoading(true);
    try {
      const orderId = await createOrder();
      if (!orderId) throw new Error("No order ID returned");

      if (payMethod === "paystack") {
        // Initialize Paystack transaction
        const res = await fetch("/api/payment/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            amount: total,
            email: form.email,
            orderId,
            items: items.map((i) => ({ name: i.name, qty: i.quantity, price: i.price })),
            deliveryNote: `${form.address}, ${form.city}, ${form.state}`,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error ?? "Payment init failed");
        // Redirect to Paystack hosted page
        window.location.href = json.data.authorizationUrl;
        return;
      }

      // Manual payment methods — show success with order reference
      clearCart();
      setStep(3);
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  const stepLabels = ["Delivery", "Payment", "Confirm"];

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6" style={{ background: "#1a0b2e" }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="text-white/40 hover:text-white text-sm transition-colors">← Continue Shopping</Link>
          <div className="flex items-center gap-1">
            <Lock size={12} className="text-green-400" />
            <span className="text-green-400 text-xs">Secure Checkout</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {stepLabels.map((label, i) => {
            const s = (i + 1) as Step;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all", step > s ? "bg-green-500 text-white" : step === s ? "bg-lilac text-[#1a0b2e]" : "bg-white/[0.08] text-white/30")}>
                  {step > s ? <Check size={12} /> : s}
                </div>
                <span className={cn("text-xs font-medium transition-colors", step >= s ? "text-white/70" : "text-white/25")}>{label}</span>
                {i < stepLabels.length - 1 && <div className="w-6 h-px bg-white/[0.1]" />}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ── Step 1: Delivery ── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-white font-bold text-lg">Delivery Details</h2>
              <div className="grid grid-cols-2 gap-3">
                <Field label="First Name" error={errors.firstName}>
                  <Input placeholder="John" value={form.firstName} error={!!errors.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
                </Field>
                <Field label="Last Name">
                  <Input placeholder="Doe" value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
                </Field>
              </div>
              <Field label="Email Address" error={errors.email}>
                <Input type="email" placeholder="you@example.com" value={form.email} error={!!errors.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
              </Field>
              <Field label="Phone Number" error={errors.phone}>
                <Input type="tel" placeholder="+234 800 000 0000" value={form.phone} error={!!errors.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </Field>
              <Field label="Delivery Address" error={errors.address}>
                <Input placeholder="12 Example Street, Lekki" value={form.address} error={!!errors.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City">
                  <Input placeholder="Lagos" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
                </Field>
                <Field label="State">
                  <select value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                    className="w-full h-11 px-3 rounded-xl border border-white/[0.08] bg-white/[0.04] text-sm text-white outline-none focus:border-white/25 transition-all">
                    {["Lagos","Abuja","Kano","Port Harcourt","Ibadan","Enugu","Kaduna","Benin City","Other"].map((s) => (
                      <option key={s} value={s} className="bg-[#1a0b2e]">{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Discount code */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
                  <Input className="pl-8" placeholder="Discount code (e.g. WELCOME10)" value={discountCode} onChange={(e) => setDiscountCode(e.target.value.toUpperCase())} />
                </div>
                <button onClick={applyDiscount} disabled={discountLoading || !discountCode}
                  className="h-11 px-4 rounded-xl bg-white/[0.07] border border-white/[0.1] text-white/70 text-sm font-medium hover:bg-white/[0.12] disabled:opacity-40 transition-all flex items-center gap-1.5">
                  {discountLoading ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                </button>
              </div>
              {discount && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                  <Check size={13} className="text-green-400 shrink-0" />
                  <span className="text-green-400 text-xs">{discount.code}: {discount.description} — saving {formatCurrency(discount.discountAmount)}</span>
                </div>
              )}

              <button onClick={() => { if (validate()) setStep(2); }}
                className="w-full h-12 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm hover:bg-[#c990ff] transition-all flex items-center justify-center gap-2">
                Continue to Payment <ChevronRight size={16} />
              </button>
            </motion.div>
          )}

          {/* ── Step 2: Payment ── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
              <h2 className="text-white font-bold text-lg">Payment Method</h2>

              <div className="space-y-2">
                {PAYMENT_METHODS.map((m) => (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    className={cn("w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all", payMethod === m.id ? "border-lilac/60 bg-lilac/10" : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06]")}>
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", payMethod === m.id ? "bg-lilac/20" : "bg-white/[0.06]")}>
                      <m.icon size={18} className={payMethod === m.id ? "text-lilac" : "text-white/40"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white/90 text-sm font-semibold">{m.label}</p>
                      <p className="text-white/35 text-xs mt-0.5">{m.desc}</p>
                    </div>
                    <div className={cn("w-4 h-4 rounded-full border-2 shrink-0 transition-all flex items-center justify-center", payMethod === m.id ? "border-lilac bg-lilac" : "border-white/20")}>
                      {payMethod === m.id && <div className="w-2 h-2 rounded-full bg-[#1a0b2e]" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Order summary */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 space-y-2">
                <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-3">Order Summary</p>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs text-white/50">
                    <span className="truncate">{item.name} × {item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-white/[0.06] pt-2 mt-2 space-y-1">
                  <div className="flex justify-between text-xs text-white/50"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  {discountAmt > 0 && <div className="flex justify-between text-xs text-green-400"><span>Discount ({discount?.code})</span><span>-{formatCurrency(discountAmt)}</span></div>}
                  <div className="flex justify-between text-xs text-white/50"><span>Delivery</span><span>{delivery === 0 ? "Free" : formatCurrency(delivery)}</span></div>
                  <div className="flex justify-between text-sm font-bold text-white pt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/30">
                <ShieldCheck size={13} className="text-green-400 shrink-0" />
                <span>Your payment is encrypted and processed securely via Paystack (PCI-DSS compliant).</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="h-12 px-5 rounded-xl border border-white/[0.1] text-white/60 text-sm hover:bg-white/[0.05] transition-all flex items-center gap-1">
                  <ChevronLeft size={15} /> Back
                </button>
                <button onClick={handlePay} disabled={loading}
                  className="flex-1 h-12 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm hover:bg-[#c990ff] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <><Lock size={14} /> Pay {formatCurrency(total)}</>}
                  {!loading && payMethod === "paystack" && <ExternalLink size={12} className="ml-1 opacity-50" />}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Success (manual payment only) ── */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8">
              <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
                <Check size={36} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-white font-bold text-xl">Order Placed!</h2>
                <p className="text-white/45 text-sm mt-2">We&apos;ve received your order and will contact you via WhatsApp to confirm delivery.</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Link href="/orders" className="h-11 px-6 rounded-xl bg-[#d4a5ff] text-[#1a0b2e] font-bold text-sm flex items-center hover:bg-[#c990ff] transition-all">View Orders</Link>
                <Link href="/" className="h-11 px-6 rounded-xl border border-white/[0.12] text-white/60 text-sm font-medium flex items-center hover:bg-white/[0.05] transition-all">Home</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <AuthGuard>
      <CheckoutPageInner />
    </AuthGuard>
  );
}
