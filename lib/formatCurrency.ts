// lib/formatCurrency.ts

export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case "USD":
      return "$";
    case "NGN":
      return "₦";
    default:
      return currency;
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatAmount(amount: number | undefined): string {
  return (
    amount?.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) || "0"
  );
}
