import { Router, type Response } from "express";
import type { InsuranceProvider } from "../providers/InsuranceProvider.js";
import { toErrorResponse } from "../handlers.js";
import { TtlCache } from "../cache.js";
import type { HealthPlansResponse, InsurersResponse } from "../../shared/types.js";

function sendError(res: Response, e: unknown) {
  const { status, body } = toErrorResponse(e);
  res.status(status).json(body);
}

export function insuranceRouter(provider: InsuranceProvider, ttlMs: number) {
  const r = Router();
  const plansCache = new TtlCache<HealthPlansResponse["plans"]>(ttlMs);
  const insurersCache = new TtlCache<InsurersResponse["insurers"]>(ttlMs);

  async function cached<T>(cache: TtlCache<T[]>, load: () => Promise<T[]>) {
    const hit = cache.get();
    if (hit) {
      return { items: hit.value, meta: { provider: provider.name, fetchedAt: new Date(hit.storedAt).toISOString(), durationMs: 0, cached: true } };
    }
    const t0 = performance.now();
    const items = await load();
    cache.set(items);
    return { items, meta: { provider: provider.name, fetchedAt: new Date().toISOString(), durationMs: Math.round(performance.now() - t0), cached: false } };
  }

  r.get("/insurance/health-plans", async (_req, res) => {
    try {
      const { items, meta } = await cached(plansCache, () => provider.getHealthPlans());
      res.json({ plans: items, total: items.length, meta } satisfies HealthPlansResponse);
    } catch (e) { sendError(res, e); }
  });

  r.get("/insurance/insurers", async (_req, res) => {
    try {
      const { items, meta } = await cached(insurersCache, () => provider.getHealthInsurers());
      res.json({ insurers: items, total: items.length, meta } satisfies InsurersResponse);
    } catch (e) { sendError(res, e); }
  });

  r.get("/debug/health-plans", async (_req, res) => res.json(await provider.diagnose()));

  return r;
}
