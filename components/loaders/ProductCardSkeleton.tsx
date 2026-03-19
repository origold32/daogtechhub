// Fast shimmer skeleton — replaces slow loaders on category pages
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/5 bg-white/3 animate-pulse">
      <div className="aspect-square bg-white/5" />
      <div className="p-3 space-y-2">
        <div className="flex gap-1.5">
          <div className="h-4 w-16 rounded-full bg-white/8" />
          <div className="h-4 w-12 rounded-full bg-white/5" />
        </div>
        <div className="h-4 w-3/4 rounded bg-white/8" />
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-2/3 rounded bg-white/5" />
        <div className="flex gap-1 pt-1">
          <div className="h-5 w-14 rounded-lg bg-white/5" />
          <div className="h-5 w-14 rounded-lg bg-white/5" />
        </div>
        <div className="flex justify-between items-center pt-1">
          <div className="h-6 w-24 rounded bg-white/10" />
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 rounded-full bg-white/5" />)}
          </div>
        </div>
        <div className="h-9 w-full rounded-xl bg-white/8 mt-1" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl bg-white/5" />
          <div className="flex gap-2">
            {[1,2,3,4].map(i => <div key={i} className="w-16 h-16 rounded-xl bg-white/5" />)}
          </div>
        </div>
        {/* Info */}
        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-white/5" />
          <div className="h-8 w-3/4 rounded bg-white/8" />
          <div className="h-4 w-32 rounded bg-white/5" />
          <div className="h-10 w-40 rounded bg-white/10" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-white/5" />
            <div className="h-3 w-5/6 rounded bg-white/5" />
            <div className="h-3 w-4/6 rounded bg-white/5" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[1,2,3,4].map(i => <div key={i} className="h-14 rounded-xl bg-white/5" />)}
          </div>
          <div className="h-12 w-full rounded-2xl bg-white/8" />
          <div className="h-10 w-full rounded-2xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}
