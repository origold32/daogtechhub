// components/loading-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {
  return (
    <>
      <div className="flex flex-wrap gap-2 sm:gap-4 items-center">
        <Skeleton className="h-8 w-20 rounded" />
      </div>

      <div className="flex items-center gap-1 mb-2 w-full">
        <Skeleton className="h-3 w-full rounded-sm" />
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-[#667185]">
        <Skeleton className="h-4 w-32 rounded" />
      </div>
    </>
  );
}
