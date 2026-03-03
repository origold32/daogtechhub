// components/ui/ResultsCount.tsx

interface ResultsCountProps {
  count: number;
  label?: string;
}

export function ResultsCount({ count, label = "result" }: ResultsCountProps) {
  return (
    <p className="text-muted-lavender">
      Showing {count} {label}
      {count !== 1 ? "s" : ""}
    </p>
  );
}
