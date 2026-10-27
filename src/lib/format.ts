import type { Currency } from "./types";

export function formatMoney(amount: number, currency: Currency = "USD"): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(0)}`;
  }
}

export function formatMoneyCompact(amount: number, currency: Currency = "USD") {
  if (amount >= 1000) {
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(amount);
    } catch {
      return `${currency} ${Math.round(amount / 100) / 10}k`;
    }
  }
  return formatMoney(amount, currency);
}

export function percentRaised(raised: number, goal: number): number {
  if (!goal) return 0;
  return Math.min(100, Math.round((raised / goal) * 100));
}

export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const seconds = Math.max(1, Math.floor((Date.now() - then) / 1000));
  const units: [number, Intl.RelativeTimeFormatUnit][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [7, "day"],
    [4.345, "week"],
    [12, "month"],
    [Number.POSITIVE_INFINITY, "year"],
  ];
  let value = seconds;
  let unit: Intl.RelativeTimeFormatUnit = "second";
  let divisor = 1;
  for (const [step, nextUnit] of units) {
    if (value < step) {
      unit = nextUnit;
      break;
    }
    divisor *= step;
    value = value / step;
    unit = nextUnit;
  }
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  return rtf.format(-Math.floor(value), unit);
}

/** Stable, non-reversible public handle for anonymous users. */
export function anonymousHandle(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 99991;
  }
  const words = ["Quiet", "Kind", "Bright", "Steady", "Warm", "Gentle", "Brave"];
  return `${words[hash % words.length]} ${String(hash).padStart(4, "0")}`;
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
