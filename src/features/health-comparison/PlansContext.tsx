import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { HealthPlan, Insurer, ProviderMeta } from "../../../shared/types";
import { api, ApiFailure } from "../../lib/api";

type State =
  | { status: "loading" }
  | { status: "error"; error: ApiFailure }
  | { status: "ready"; plans: HealthPlan[]; meta: ProviderMeta };

export const MAX_COMPARE = 3;

interface Ctx {
  state: State;
  reload: () => void;
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
}

const PlansCtx = createContext<Ctx | null>(null);

export function PlansProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    api.healthPlans().then(
      (r) => setState({ status: "ready", plans: r.plans, meta: r.meta }),
      (e) => setState({ status: "error", error: e instanceof ApiFailure ? e : new ApiFailure("NETWORK") }),
    );
  }, []);

  useEffect(reload, [reload]);

  const value = useMemo<Ctx>(
    () => ({
      state, reload, compareIds,
      toggleCompare: (id) => setCompareIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= MAX_COMPARE ? ids : [...ids, id])),
      clearCompare: () => setCompareIds([]),
    }),
    [state, reload, compareIds],
  );
  return <PlansCtx.Provider value={value}>{children}</PlansCtx.Provider>;
}

export function usePlans() {
  const c = useContext(PlansCtx);
  if (!c) throw new Error("usePlans must be used inside PlansProvider");
  return c;
}

/** Insurer directory from the provider; fetched on demand and memoised for the session. */
let insurersPromise: Promise<Insurer[]> | undefined;
export function useInsurers() {
  const [s, setS] = useState<{ status: "loading" | "error" | "ready"; insurers: Insurer[] }>({ status: "loading", insurers: [] });
  const load = useCallback(() => {
    setS({ status: "loading", insurers: [] });
    insurersPromise ??= api.insurers().then((r) => r.insurers);
    insurersPromise.then(
      (insurers) => setS({ status: "ready", insurers }),
      () => { insurersPromise = undefined; setS({ status: "error", insurers: [] }); },
    );
  }, []);
  useEffect(load, [load]);
  return { ...s, reload: load };
}
