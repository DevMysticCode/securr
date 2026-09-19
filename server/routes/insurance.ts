import { Router, type Request, type Response } from "express";
import type { InsuranceProvider } from "../providers/InsuranceProvider.js";
import { badCategory, insurersPayload, parseCategory, plansPayload, toErrorResponse } from "../handlers.js";
import { TtlCache } from "../cache.js";
import type { InsuranceCategory, InsurersResponse, PlansResponse } from "../../shared/types.js";

function sendError(res: Response, e: unknown) {
  const { status, body } = toErrorResponse(e);
  res.status(status).json(body);
}

export function insuranceRouter(provider: InsuranceProvider, ttlMs: number) {
  const r = Router();
  const plansCache = new Map<InsuranceCategory, TtlCache<PlansResponse>>();
  const insurersCache = new TtlCache<InsurersResponse>(ttlMs);

  /** Serves a cached payload (marking it as cached) or loads a fresh one. Errors are never cached. */
  async function cached<T extends { meta: { cached: boolean; fetchedAt: string; durationMs: number } }>(cache: TtlCache<T>, load: () => Promise<T>): Promise<T> {
    const hit = cache.get();
    if (hit) return { ...hit.value, meta: { ...hit.value.meta, cached: true, durationMs: 0 } };
    const fresh = await load();
    cache.set(fresh);
    return fresh;
  }

  async function plans(category: InsuranceCategory, res: Response) {
    try {
      if (!plansCache.has(category)) plansCache.set(category, new TtlCache<PlansResponse>(ttlMs));
      res.json(await cached(plansCache.get(category)!, () => plansPayload(provider, category)));
    } catch (e) { sendError(res, e); }
  }

  // Generic endpoint plus the original health-specific alias.
  r.get("/insurance/plans", (req: Request, res) => {
    const category = parseCategory(String(req.query.category ?? ""));
    if (!category) { const b = badCategory(); return void res.status(b.status).json(b.body); }
    return plans(category, res);
  });
  r.get("/insurance/health-plans", (_req, res) => plans("health", res));

  r.get("/insurance/insurers", async (_req, res) => {
    try { res.json(await cached(insurersCache, () => insurersPayload(provider))); } catch (e) { sendError(res, e); }
  });

  r.get("/debug/health-plans", async (req, res) => {
    const category = parseCategory(String(req.query.category ?? "health"));
    if (!category) { const b = badCategory(); return void res.status(b.status).json(b.body); }
    res.json(await provider.diagnose(category));
  });

  return r;
}
