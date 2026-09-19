export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** 500000 -> ₹5 L, 10000000 -> ₹1 Cr */
export function inrShort(n: number) {
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(2)} L`;
  return inr(n);
}

/** Premiums: the India catalogue does not state a premium currency; INR is assumed (see category notes). */
export const PREMIUM_CURRENCY = "INR";

/** Full amount in a currency, e.g. ₹1,00,000 or $50,000. */
export function money(n: number, currency = "INR") {
  if (currency === "INR") return inr(n);
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

/** Compact amount: ₹5 L / ₹1 Cr for INR, otherwise the full localised amount. */
export function moneyShort(n: number, currency = "INR") {
  return currency === "INR" ? inrShort(n) : money(n, currency);
}

export function rangeOf(min: number | undefined, max: number | undefined, f: (n: number) => string) {
  if (min != null && max != null) return min === max ? f(min) : `${f(min)} – ${f(max)}`;
  if (min != null) return `From ${f(min)}`;
  if (max != null) return `Up to ${f(max)}`;
  return undefined;
}

export const titleCase = (s: string) => s.replace(/[-_]/g, " ").replace(/^./, (c) => c.toUpperCase());

export function formatDate(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
