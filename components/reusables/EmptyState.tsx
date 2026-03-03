// components/reusables/EmptyState.tsx

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  message?: string;
  onClear: () => void;
}

export function EmptyState({
  message = "No results found matching your criteria",
  onClear,
}: EmptyStateProps) {
  return (
    <div className="text-center py-16">
      <p className="text-muted-lavender text-lg">{message}</p>
      <Button
        variant="outline"
        onClick={onClear}
        className="mt-4 border-lilac-light text-lilac"
      >
        Clear Filters
      </Button>
    </div>
  );
}
