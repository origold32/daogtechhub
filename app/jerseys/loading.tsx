import { ProductGridSkeleton } from "@/components/loaders/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      {/* Nav skeleton */}
      <div className="fixed top-0 left-0 right-0 h-[calc(36px+56px)] bg-[#1a0b2e]/95 border-b border-white/10 z-[100] animate-pulse" />
      <main className="pt-[calc(36px+56px+24px)] pb-16 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header skeleton */}
          <div className="mb-8 mt-4 space-y-2">
            <div className="h-3 w-32 rounded-full bg-white/5 animate-pulse" />
            <div className="h-10 w-48 rounded-lg bg-white/8 animate-pulse" />
            <div className="h-4 w-64 rounded bg-white/5 animate-pulse" />
          </div>
          {/* Filter bar skeleton */}
          <div className="flex gap-3 mb-6">
            <div className="h-10 flex-1 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse" />
            <div className="h-10 w-32 rounded-xl bg-white/5 animate-pulse" />
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </main>
    </div>
  );
}
