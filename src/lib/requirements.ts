/** The user's search requirements, kept in the URL so results pages are shareable. */
export interface Requirements {
  age?: number;
  members?: number;
  city?: string;
  coverage?: number;
  renewal?: "new" | "renewal";
}

const posInt = (v: string | null) => {
  const n = v ? parseInt(v, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseRequirements(p: URLSearchParams): Requirements {
  const renewal = p.get("renewal");
  return {
    age: posInt(p.get("age")),
    members: posInt(p.get("members")),
    city: p.get("city")?.trim() || undefined,
    coverage: posInt(p.get("coverage")),
    renewal: renewal === "new" || renewal === "renewal" ? renewal : undefined,
  };
}

export function toSearchParams(r: Requirements) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(r)) if (v != null && v !== "") p.set(k, String(v));
  return p;
}

export const COVERAGE_CHOICES = [300000, 500000, 1000000, 1500000, 2000000, 2500000, 5000000, 10000000];
