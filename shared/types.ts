/**
 * Provider-neutral domain model shared by backend and frontend.
 * Every field is optional unless the source always supplies it: we never fabricate values.
 */
export interface HealthPlan {
  id: string;
  name: string;
  insurerName: string;
  insurerSlug?: string;
  planType?: string; // e.g. "individual", "family-floater"
  premium?: { min?: number; max?: number; assumptions?: string; verified?: boolean };
  sumInsured?: { min?: number; max?: number; options?: number[] };
  eligibility?: { minAge?: number; maxAge?: number; renewableUpTo?: string };
  claimSettlement?: unknown; // passed through as-is when present
  networkHospitals?: { count?: number; source?: string };
  renewability?: string;
  features: string[];
  dataQuality?: { confidence?: string; lastVerified?: string };
  sourceUrl?: string;
  /** Fields the provider returned that we do not model explicitly, so nothing is lost. */
  additional: Record<string, unknown>;
}

export interface Insurer {
  slug: string;
  name: string;
  shortName?: string;
  type?: string;
  headquarters?: string;
  established?: number;
  claimSettlementRatio?: { value?: number | null; year?: string; verified?: boolean };
  networkHospitals?: number;
  logoUrl?: string; // only ever set if the provider supplies one
  description?: string; // only ever set if the provider supplies one
}

export interface ProviderMeta {
  provider: string;
  fetchedAt: string;
  durationMs: number;
  cached: boolean;
}

export interface HealthPlansResponse { plans: HealthPlan[]; total: number; meta: ProviderMeta }
export interface InsurersResponse { insurers: Insurer[]; total: number; meta: ProviderMeta }

export interface ApiErrorBody {
  error: {
    code: "UPSTREAM_UNAVAILABLE" | "UPSTREAM_ERROR" | "RATE_LIMITED" | "AUTH_FAILED" | "BAD_RESPONSE" | "NETWORK" | "INTERNAL";
    message: string;
  };
}

export interface DebugReport {
  ok: boolean;
  provider: string;
  requestedAt: string;
  durationMs: number;
  upstreamUrl: string; // API key redacted
  httpStatus?: number;
  planCount?: number;
  error?: { code: string; message: string; diagnosis: string; bodyPreview?: string };
  raw?: unknown;
}
