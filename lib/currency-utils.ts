export const CURRENCY_OPTIONS = {
  INR: {
    code: "INR",
    name: "Indian Rupees",
    symbol: "₹",
    locale: "en-IN",
  },
  USD: {
    code: "USD",
    name: "US Dollar",
    symbol: "$",
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    locale: "en-EU",
  },
  JPY: {
    code: "JPY",
    name: "Japanese Yen",
    symbol: "¥",
    locale: "ja-JP",
  },
  CNY: {
    code: "CNY",
    name: "Chinese Yuan",
    symbol: "¥",
    locale: "zh-CN",
  },
}

export type CurrencyCode = keyof typeof CURRENCY_OPTIONS

export function getCurrencySymbol(currencyCode: string): string {
  const currency = CURRENCY_OPTIONS[currencyCode as CurrencyCode]
  return currency?.symbol || "₹"
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode)
  return `${symbol}${amount.toFixed(2)}`
}

export function formatCurrencyShort(amount: number, currencyCode: string): string {
  const symbol = getCurrencySymbol(currencyCode)
  if (amount >= 1000000) {
    return `${symbol}${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `${symbol}${(amount / 1000).toFixed(1)}K`
  }
  return `${symbol}${amount.toFixed(2)}`
}
