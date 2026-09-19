import type { InsurancePlan } from "../../../shared/types";
import type { Requirements } from "../../lib/requirements";

export interface Filters {
  insurers: string[];
  types: string[];
  maxPremium?: number; // keep plans whose illustrative minimum premium <= this
  cover?: number; // plan can offer this sum insured
  age?: number; // applicant must fall inside the plan's entry-age range
}

/** Facets are derived from the data, so a filter only exists if the API supplied the underlying field. */
export function deriveFacets(plans: InsurancePlan[]) {
  const count = (vals: (string | undefined)[]) => {
    const m = new Map<string, number>();
    vals.forEach((v) => v && m.set(v, (m.get(v) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  };
  const premiums = plans.map((p) => p.premium?.min).filter((n): n is number => n != null);
  const coverOptions = [...new Set(plans.flatMap((p) => p.sumInsured?.options ?? []))].sort((a, b) => a - b);
  return {
    insurers: count(plans.map((p) => p.insurerName)),
    types: count(plans.map((p) => p.planType)),
    premiumBounds: premiums.length ? { min: Math.min(...premiums), max: Math.max(...premiums) } : undefined,
    coverOptions,
    hasAge: plans.some((p) => p.eligibility?.minAge != null || p.eligibility?.maxAge != null),
  };
}
export type Facets = ReturnType<typeof deriveFacets>;

export function initialFilters(req: Requirements, facets: Facets): Filters {
  return {
    insurers: [],
    types: req.members && req.members > 1 && facets.types.some(([t]) => t === "family-floater") ? ["family-floater"] : [],
    cover: req.coverage,
    age: req.age,
  };
}

export function applyFilters(plans: InsurancePlan[], f: Filters) {
  return plans.filter((p) => {
    if (f.insurers.length && !f.insurers.includes(p.insurerName)) return false;
    if (f.types.length && !(p.planType && f.types.includes(p.planType))) return false;
    if (f.maxPremium != null && !(p.premium?.min != null && p.premium.min <= f.maxPremium)) return false;
    if (f.cover != null) {
      const s = p.sumInsured;
      if (!s || s.min == null || s.max == null || f.cover < s.min || f.cover > s.max) return false;
    }
    if (f.age != null) {
      const e = p.eligibility;
      if ((e?.minAge != null && f.age < e.minAge) || (e?.maxAge != null && f.age > e.maxAge)) return false;
    }
    return true;
  });
}

export type SortKey = "recommended" | "premium-asc" | "premium-desc" | "coverage" | "insurer";

export const SORT_LABELS: Record<SortKey, string> = {
  recommended: "Default order",
  "premium-asc": "Premium: Low to High",
  "premium-desc": "Premium: High to Low",
  coverage: "Coverage: Highest first",
  insurer: "Insurer (A–Z)",
};

/** Returns only the sort options the data can actually support. */
export function availableSorts(plans: InsurancePlan[]): SortKey[] {
  const keys: SortKey[] = ["recommended"];
  if (plans.some((p) => p.premium?.min != null)) keys.push("premium-asc", "premium-desc");
  if (plans.some((p) => p.sumInsured?.max != null)) keys.push("coverage");
  keys.push("insurer");
  return keys;
}

export function sortPlans(plans: InsurancePlan[], key: SortKey) {
  if (key === "recommended") return plans;
  const byNum = (get: (p: InsurancePlan) => number | undefined, dir: 1 | -1) => (a: InsurancePlan, b: InsurancePlan) => {
    const x = get(a), y = get(b);
    if (x == null && y == null) return 0;
    if (x == null) return 1; // missing values always last
    if (y == null) return -1;
    return (x - y) * dir;
  };
  const sorted = [...plans];
  switch (key) {
    case "premium-asc": return sorted.sort(byNum((p) => p.premium?.min, 1));
    case "premium-desc": return sorted.sort(byNum((p) => p.premium?.min, -1));
    case "coverage": return sorted.sort(byNum((p) => p.sumInsured?.max, -1));
    case "insurer": return sorted.sort((a, b) => a.insurerName.localeCompare(b.insurerName) || a.name.localeCompare(b.name));
  }
}
