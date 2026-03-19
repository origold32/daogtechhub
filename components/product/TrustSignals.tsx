// components/product/TrustSignals.tsx
// Reusable trust signal bars: reviews, badges, guarantees.
"use client";

import { Shield, Truck, RotateCcw, Star, CheckCircle2, BadgeCheck, Lock, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Guarantee bar ─────────────────────────────────────────────────────────────
export function GuaranteeBar({ className }: { className?: string }) {
  const items = [
    { icon: Shield,      label: "Verified Products",      desc: "All items inspected" },
    { icon: Truck,       label: "Fast Delivery",          desc: "Lagos same-day available" },
    { icon: RotateCcw,   label: "Easy Returns",           desc: "7-day return policy" },
    { icon: Lock,        label: "Secure Checkout",        desc: "256-bit SSL encryption" },
  ];
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
          <div className="w-8 h-8 rounded-lg bg-lilac/15 flex items-center justify-center shrink-0 mt-0.5">
            <item.icon size={14} className="text-lilac" />
          </div>
          <div>
            <p className="text-white/80 text-xs font-semibold leading-tight">{item.label}</p>
            <p className="text-white/35 text-[10px] mt-0.5">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Star rating display ──────────────────────────────────────────────────────
export function StarRating({ rating, count, className }: { rating: number; count?: number; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={12}
            className={n <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-white/20 fill-white/20"}
          />
        ))}
      </div>
      <span className="text-yellow-400 text-xs font-semibold">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-white/30 text-xs">({count} reviews)</span>}
    </div>
  );
}

// ── Review card ───────────────────────────────────────────────────────────────
interface Review {
  name: string; rating: number; comment: string; date: string; verified?: boolean;
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.07] space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-white/80 text-sm font-semibold">{review.name}</span>
            {review.verified && (
              <span className="flex items-center gap-0.5 text-[10px] text-green-400">
                <BadgeCheck size={11} />Verified
              </span>
            )}
          </div>
          <StarRating rating={review.rating} className="mt-0.5" />
        </div>
        <span className="text-white/25 text-[10px] shrink-0">{review.date}</span>
      </div>
      <p className="text-white/55 text-sm leading-relaxed">{review.comment}</p>
    </div>
  );
}

// ── Reviews section ───────────────────────────────────────────────────────────
// Sample reviews (in production, fetch from Supabase reviews table)
const SAMPLE_REVIEWS: Review[] = [
  { name: "Chukwuemeka A.", rating: 5, comment: "Absolutely love the product! Fast delivery and exactly as described. Will definitely buy again from DAOG.", date: "Feb 2025", verified: true },
  { name: "Fatima B.",      rating: 4, comment: "Good quality, packaging was great. Delivery took 2 days to Abuja which was reasonable.", date: "Jan 2025", verified: true },
  { name: "Taiwo O.",       rating: 5, comment: "Best marketplace in Nigeria for genuine products. No wahala, everything clean.", date: "Jan 2025", verified: true },
];

export function ReviewsSection({ productId, className }: { productId?: string; className?: string }) {
  const avgRating = SAMPLE_REVIEWS.reduce((s, r) => s + r.rating, 0) / SAMPLE_REVIEWS.length;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-base">Customer Reviews</h3>
        <div className="flex items-center gap-2">
          <StarRating rating={avgRating} count={SAMPLE_REVIEWS.length} />
        </div>
      </div>

      {/* Rating breakdown */}
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-white">{avgRating.toFixed(1)}</p>
          <StarRating rating={avgRating} className="justify-center mt-1" />
          <p className="text-white/30 text-xs mt-1">{SAMPLE_REVIEWS.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {[5,4,3,2,1].map((star) => {
            const count = SAMPLE_REVIEWS.filter((r) => Math.round(r.rating) === star).length;
            const pct = (count / SAMPLE_REVIEWS.length) * 100;
            return (
              <div key={star} className="flex items-center gap-2 text-xs text-white/40">
                <span className="w-4 text-right">{star}</span>
                <Star size={9} className="text-yellow-400 fill-yellow-400 shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-yellow-400/70 transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-6 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        {SAMPLE_REVIEWS.map((r, i) => <ReviewCard key={i} review={r} />)}
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/5 border border-green-500/15">
        <ThumbsUp size={14} className="text-green-400 shrink-0" />
        <p className="text-green-400/80 text-xs">96% of customers recommend DAOG Tech Hub to friends and family.</p>
      </div>
    </div>
  );
}

// ── Verified seller badge ─────────────────────────────────────────────────────
export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20", className)}>
      <CheckCircle2 size={12} className="text-blue-400" />
      <span className="text-blue-400 text-xs font-medium">Verified Seller</span>
    </div>
  );
}
