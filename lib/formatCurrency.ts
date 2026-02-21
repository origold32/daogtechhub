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

export function formatAmount(amount: number | undefined): string {
  return (
    amount?.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }) || "0"
  );
}
