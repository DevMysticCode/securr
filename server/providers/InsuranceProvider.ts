import type { InsuranceCategory, InsurancePlan, Insurer, DebugReport } from "../../shared/types.js";

export type ProviderErrorCode =
  | "UPSTREAM_UNAVAILABLE" | "UPSTREAM_ERROR" | "RATE_LIMITED" | "AUTH_FAILED" | "BAD_RESPONSE" | "NETWORK";

export class ProviderError extends Error {
  constructor(
    public code: ProviderErrorCode,
    message: string,
    public status?: number,
    public bodyPreview?: string,
  ) {
    super(message);
  }
}

/**
 * Anything that can supply insurance catalogue data. Implement this to add
 * DeployitProvider, DirectInsurerProvider, etc. and select it in providers/index.ts.
 * Add methods here (getQuotes, ...) as the platform grows.
 */
export interface InsuranceProvider {
  readonly name: string;
  getPlans(category: InsuranceCategory): Promise<InsurancePlan[]>;
  getInsurers(): Promise<Insurer[]>;
  /** Live, uncached probe used by /debug/api. Must never throw and never leak credentials. */
  diagnose(category: InsuranceCategory): Promise<DebugReport>;
}
