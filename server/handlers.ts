import type { InsuranceProvider } from "./providers/InsuranceProvider.js";
import { ProviderError } from "./providers/InsuranceProvider.js";
import { createProvider } from "./providers/index.js";
import type { ApiErrorBody, HealthPlansResponse, InsurersResponse } from "../shared/types.js";

export const UNAVAILABLE = "Insurance data is temporarily unavailable. Please try again.";

/** Maps any failure to a safe client response; details are logged server-side only. */
export function toErrorResponse(e: unknown) {
  const err = e instanceof ProviderError ? e : new ProviderError("NETWORK", String(e));
  console.error(`[provider] ${err.code}: ${err.message}`);
  const body: ApiErrorBody = { error: { code: err.code, message: UNAVAILABLE } };
  return { status: err.code === "RATE_LIMITED" ? 429 : 502, body };
}

const meta = (provider: InsuranceProvider, t0: number) => ({
  provider: provider.name, fetchedAt: new Date().toISOString(), durationMs: Math.round(performance.now() - t0), cached: false,
});

export async function plansPayload(provider: InsuranceProvider): Promise<HealthPlansResponse> {
  const t0 = performance.now();
  const plans = await provider.getHealthPlans();
  return { plans, total: plans.length, meta: meta(provider, t0) };
}

export async function insurersPayload(provider: InsuranceProvider): Promise<InsurersResponse> {
  const t0 = performance.now();
  const insurers = await provider.getHealthInsurers();
  return { insurers, total: insurers.length, meta: meta(provider, t0) };
}

/** Serverless (Vercel) entry: successes are cached at the edge to protect the demo key's daily quota. */
export async function serverlessJson(load: (p: InsuranceProvider) => Promise<unknown>, cache: boolean): Promise<Response> {
  try {
    const body = await load(createProvider());
    return Response.json(body, {
      headers: { "Cache-Control": cache ? "public, s-maxage=600, stale-while-revalidate=60" : "no-store" },
    });
  } catch (e) {
    const { status, body } = toErrorResponse(e);
    return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  }
}
