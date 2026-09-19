import type { InsuranceProvider } from "./providers/InsuranceProvider.js";
import { ProviderError } from "./providers/InsuranceProvider.js";
import { createProvider } from "./providers/index.js";
import { CATEGORIES, type ApiErrorBody, type InsuranceCategory, type PlansResponse, type InsurersResponse } from "../shared/types.js";

export const UNAVAILABLE = "Insurance data is temporarily unavailable. Please try again.";

export const parseCategory = (v: string | null | undefined): InsuranceCategory | undefined =>
  (CATEGORIES as readonly string[]).includes(v ?? "") ? (v as InsuranceCategory) : undefined;

/** Maps any failure to a safe client response; details are logged server-side only. */
export function toErrorResponse(e: unknown) {
  const err = e instanceof ProviderError ? e : new ProviderError("NETWORK", String(e));
  console.error(`[provider] ${err.code}: ${err.message}`);
  const body: ApiErrorBody = { error: { code: err.code, message: UNAVAILABLE } };
  return { status: err.code === "RATE_LIMITED" ? 429 : 502, body };
}

export const badCategory = () => ({
  status: 400,
  body: { error: { code: "INTERNAL", message: `Unknown category. Use one of: ${CATEGORIES.join(", ")}` } },
});

const meta = (provider: InsuranceProvider, t0: number) => ({
  provider: provider.name, fetchedAt: new Date().toISOString(), durationMs: Math.round(performance.now() - t0), cached: false,
});

export async function plansPayload(provider: InsuranceProvider, category: InsuranceCategory): Promise<PlansResponse> {
  const t0 = performance.now();
  const plans = await provider.getPlans(category);
  return { category, plans, total: plans.length, meta: meta(provider, t0) };
}

export async function insurersPayload(provider: InsuranceProvider): Promise<InsurersResponse> {
  const t0 = performance.now();
  const insurers = await provider.getInsurers();
  return { insurers, total: insurers.length, meta: meta(provider, t0) };
}

/**
 * Serverless (Vercel) entry. Successes are cached at the edge (6h) to protect the demo key's
 * 100 requests/day quota; the catalogue is static reference data. Errors are never cached.
 */
export async function serverlessJson(load: (p: InsuranceProvider) => Promise<unknown>, cache: boolean): Promise<Response> {
  try {
    const body = await load(createProvider());
    return Response.json(body, {
      headers: { "Cache-Control": cache ? "public, s-maxage=21600, stale-while-revalidate=86400" : "no-store" },
    });
  } catch (e) {
    const { status, body } = toErrorResponse(e);
    return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  }
}

/** Runs a category-scoped serverless handler, validating ?category= (defaults to `fallback`). */
export function serverlessCategory(req: Request, fallback: InsuranceCategory | undefined, run: (p: InsuranceProvider, c: InsuranceCategory) => Promise<unknown>, cache: boolean) {
  const raw = new URL(req.url).searchParams.get("category");
  const category = raw ? parseCategory(raw) : fallback;
  if (!category) {
    const { status, body } = badCategory();
    return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  }
  return serverlessJson((p) => run(p, category), cache);
}
