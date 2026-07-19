import dayjs from "dayjs";

export const EXCHANGE_RATES = [
  { from: "USD", to: "TRY", rate: 36.31 },
  { from: "EUR", to: "TRY", rate: 39.73 },
  { from: "EUR", to: "USD", rate: 1.09 },
  { from: "USD", to: "JPY", rate: 143.50 },
];

export const getExchangeRate = (from: string, to: string): number => {
  if (from === to) return 1;
  
  // Direct match
  const direct = EXCHANGE_RATES.find(r => r.from === from && r.to === to);
  if (direct) return direct.rate;
  
  // Inverse match
  const inverse = EXCHANGE_RATES.find(r => r.from === to && r.to === from);
  if (inverse) return 1 / inverse.rate;

  // Cross conversion via USD if possible (since USD is the base)
  if (from !== "USD" && to !== "USD") {
    const fromToUSD = getExchangeRate(from, "USD");
    const USDToTo = getExchangeRate("USD", to);
    return fromToUSD * USDToTo;
  }

  return 1; // Fallback
};

export const convertAmount = (amount: number, from: string, to: string): number => {
  return amount * getExchangeRate(from, to);
};

export const formatCurrency = (value: number, currency = "USD"): string => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return value.toFixed(2);
  }
};

export const formatSubscriptionDateTime = (value?: string): string => {
  if (!value) return "Not provided";
  const parsedDate = dayjs(value);
  return parsedDate.isValid() ? parsedDate.format("MM/DD/YYYY") : "Not provided";
};

export const formatStatusLabel = (value?: string): string => {
  if (!value) return "Unknown";
  return value.charAt(0).toUpperCase() + value.slice(1);
};