import { ProductDetailSkeleton } from "@/components/loaders/ProductCardSkeleton";

export default function Loading() {
  return (
    <div className="min-h-screen" style={{ background: "#1a0b2e" }}>
      <div className="fixed top-0 left-0 right-0 h-[calc(36px+56px)] bg-[#1a0b2e]/95 border-b border-white/10 z-[100]" />
      <main className="pt-[calc(36px+56px+24px)]">
        <ProductDetailSkeleton />
      </main>
    </div>
  );
}
