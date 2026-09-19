import type { DebugReport, InsuranceCategory, InsurersResponse, PlansResponse } from "../../shared/types";

export const UNAVAILABLE_MESSAGE = "Insurance data is temporarily unavailable. Please try again.";

export class ApiFailure extends Error {
  constructor(public code: string, message = UNAVAILABLE_MESSAGE, public status?: number) {
    super(message);
  }
}

/** Browser -> our backend only. No provider URL or key ever appears in frontend code. */
async function get<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new ApiFailure("NETWORK"); // backend unreachable / offline
  }
  let body: any;
  try {
    body = await res.json();
  } catch {
    throw new ApiFailure("BAD_RESPONSE", UNAVAILABLE_MESSAGE, res.status);
  }
  if (!res.ok) throw new ApiFailure(body?.error?.code ?? "UPSTREAM_ERROR", body?.error?.message ?? UNAVAILABLE_MESSAGE, res.status);
  return body as T;
}

export const api = {
  plans: (category: InsuranceCategory) => get<PlansResponse>(`/api/insurance/plans?category=${category}`),
  insurers: () => get<InsurersResponse>("/api/insurance/insurers"),
  debugReport: (category: InsuranceCategory) => get<DebugReport>(`/api/debug/health-plans?category=${category}`),
};
