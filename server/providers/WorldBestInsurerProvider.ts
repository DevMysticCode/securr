import type { InsuranceCategory, InsurancePlan, Insurer, DebugReport } from "../../shared/types.js";
import { ProviderError, type InsuranceProvider } from "./InsuranceProvider.js";

const KNOWN_KEYS = new Set([
  "id", "productName", "insurerName", "insurerSlug", "category", "subCategory", "countryCode",
  "premiumRange", "sumInsured", "eligibility", "claimSettlement", "networkHospitals",
  "renewability", "confidenceScore", "lastVerified", "specialFeatures", "sourceUrl",
]);

type Raw = Record<string, any>;

export class WorldBestInsurerProvider implements InsuranceProvider {
  readonly name = "World Best Insurer (demo API)";

  constructor(
    private apiKey: string,
    private baseUrl = "https://worldbestinsurer.com/api/v1",
    private timeoutMs = 15000,
  ) {}

  // Trailing slash avoids the upstream 308 redirect.
  private url(path: string, params: Record<string, string>, redact = false) {
    const u = new URL(`${this.baseUrl.replace(/\/$/, "")}/${path}/`);
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
    u.searchParams.set("apiKey", redact ? "***" : this.apiKey);
    return u.toString();
  }

  private async fetchJson(path: string, params: Record<string, string>): Promise<{ json: any; status: number }> {
    let res: Response;
    try {
      res = await fetch(this.url(path, params), {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (e: any) {
      const timedOut = e?.name === "TimeoutError" || e?.name === "AbortError";
      const cause = e?.cause?.code ?? e?.cause?.message ?? e?.message;
      throw new ProviderError("NETWORK", timedOut ? `Timed out after ${this.timeoutMs}ms` : `Network error: ${cause}`);
    }
    const text = await res.text();
    if (!res.ok) {
      const code = res.status === 429 ? "RATE_LIMITED" : res.status === 401 || res.status === 403 ? "AUTH_FAILED"
        : res.status >= 500 ? "UPSTREAM_UNAVAILABLE" : "UPSTREAM_ERROR";
      throw new ProviderError(code, `Upstream returned HTTP ${res.status}`, res.status, text.slice(0, 500));
    }
    try {
      return { json: JSON.parse(text), status: res.status };
    } catch {
      throw new ProviderError("BAD_RESPONSE", "Upstream returned non-JSON content", res.status, text.slice(0, 500));
    }
  }

  private async fetchProducts(category: InsuranceCategory) {
    const r = await this.fetchJson("products", { country: "in", category, limit: "200" });
    if (!Array.isArray(r.json?.products)) throw new ProviderError("BAD_RESPONSE", "Response has no products array", r.status);
    return r;
  }

  async getPlans(category: InsuranceCategory): Promise<InsurancePlan[]> {
    return (await this.fetchProducts(category)).json.products.map(normalizePlan);
  }

  async getInsurers(): Promise<Insurer[]> {
    const r = await this.fetchJson("insurers", { country: "in", limit: "200" });
    if (!Array.isArray(r.json?.insurers)) throw new ProviderError("BAD_RESPONSE", "Response has no insurers array", r.status);
    return (r.json.insurers as Raw[]).map(normalizeInsurer);
  }

  async diagnose(category: InsuranceCategory): Promise<DebugReport> {
    const requestedAt = new Date().toISOString();
    const t0 = performance.now();
    const base = {
      provider: this.name, requestedAt, category,
      upstreamUrl: this.url("products", { country: "in", category, limit: "200" }, true),
    };
    try {
      const r = await this.fetchProducts(category);
      return { ...base, ok: true, durationMs: Math.round(performance.now() - t0), httpStatus: r.status, planCount: r.json.products.length, raw: r.json };
    } catch (e) {
      const err = e instanceof ProviderError ? e : new ProviderError("NETWORK", String(e));
      return {
        ...base, ok: false, durationMs: Math.round(performance.now() - t0), httpStatus: err.status,
        error: { code: err.code, message: err.message, diagnosis: diagnosisFor(err), bodyPreview: err.bodyPreview },
      };
    }
  }
}

function diagnosisFor(e: ProviderError): string {
  switch (e.code) {
    case "NETWORK":
      if (/ENOTFOUND|EAI_AGAIN/.test(e.message)) return "DNS failure: the host name could not be resolved.";
      if (/ECONNREFUSED|ECONNRESET|ETIMEDOUT|Timed out/.test(e.message)) return "Network problem: connection refused, reset or timed out.";
      return "Network error reaching the provider.";
    case "AUTH_FAILED": return "The API key was rejected (HTTP 401/403). Check WORLD_BEST_INSURER_API_KEY.";
    case "RATE_LIMITED": return "Rate limit reached (demo key allows 100 requests/day). Wait and retry.";
    case "UPSTREAM_UNAVAILABLE": return "The provider returned a 5xx error; it is down or failing.";
    case "UPSTREAM_ERROR": return "The provider rejected the request (4xx). Check the URL and query parameters.";
    case "BAD_RESPONSE": return "The provider responded but the body was not the expected JSON shape.";
    default: return "Unknown error.";
  }
}

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v : undefined);

function normalizePlan(p: Raw): InsurancePlan {
  const additional: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) if (!KNOWN_KEYS.has(k) && v != null) additional[k] = v;
  return {
    id: String(p.id),
    category: p.category,
    name: str(p.productName) ?? String(p.id),
    insurerName: str(p.insurerName) ?? "Unknown insurer",
    insurerSlug: str(p.insurerSlug),
    planType: str(p.subCategory),
    premium: p.premiumRange && {
      min: num(p.premiumRange.illustrativeMin), max: num(p.premiumRange.illustrativeMax),
      assumptions: str(p.premiumRange.assumptions), verified: p.premiumRange.isVerified,
    },
    sumInsured: p.sumInsured && {
      min: num(p.sumInsured.min), max: num(p.sumInsured.max), currency: str(p.sumInsured.currency),
      options: Array.isArray(p.sumInsured.options) ? p.sumInsured.options.filter((n: unknown) => typeof n === "number") : undefined,
    },
    eligibility: p.eligibility && {
      minAge: num(p.eligibility.minAge), maxAge: num(p.eligibility.maxAge), renewableUpTo: str(p.eligibility.renewableUpTo),
    },
    claimSettlement: p.claimSettlement ?? undefined,
    networkHospitals: p.networkHospitals ? { count: num(p.networkHospitals.count), source: str(p.networkHospitals.source) } : undefined,
    renewability: str(p.renewability),
    features: Array.isArray(p.specialFeatures) ? p.specialFeatures.filter((f: unknown) => typeof f === "string") : [],
    dataQuality: { confidence: str(p.confidenceScore), lastVerified: str(p.lastVerified) },
    sourceUrl: str(p.sourceUrl),
    additional,
  };
}

function normalizeInsurer(i: Raw): Insurer {
  const csr = i.claimSettlementRatio;
  return {
    slug: String(i.slug), name: str(i.name) ?? String(i.slug), shortName: str(i.shortName), type: str(i.type),
    categories: Array.isArray(i.categories) ? i.categories.filter((c: unknown) => typeof c === "string") : [],
    headquarters: str(i.headquarters), established: num(i.established),
    claimSettlementRatio: csr && num(csr.value) != null ? { value: csr.value, year: str(csr.year), verified: csr.verified } : undefined,
    networkHospitals: num(i.networkHospitals),
    logoUrl: str(i.logoUrl ?? i.logo), description: str(i.description),
  };
}
