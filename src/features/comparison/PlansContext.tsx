import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CATEGORIES, type InsuranceCategory, type InsurancePlan, type Insurer, type ProviderMeta } from "../../../shared/types";
import { api, ApiFailure } from "../../lib/api";

export type PlansState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: ApiFailure }
  | { status: "ready"; plans: InsurancePlan[]; meta: ProviderMeta };

export const MAX_COMPARE = 3;

type Rec<T> = Record<InsuranceCategory, T>;
const each = <T,>(v: () => T) => Object.fromEntries(CATEGORIES.map((c) => [c, v()])) as Rec<T>;

interface Ctx {
  states: Rec<PlansState>;
  load: (c: InsuranceCategory, force?: boolean) => void;
  compare: Rec<string[]>;
  toggleCompare: (c: InsuranceCategory, id: string) => void;
  clearCompare: (c: InsuranceCategory) => void;
}

const PlansCtx = createContext<Ctx | null>(null);

/** Holds catalogue data per category (loaded lazily, once) and the compare selection per category. */
export function PlansProvider({ children }: { children: ReactNode }) {
  const [states, setStates] = useState<Rec<PlansState>>(() => each<PlansState>(() => ({ status: "idle" })));
  const [compare, setCompare] = useState<Rec<string[]>>(() => each<string[]>(() => []));
  const inFlight = useRef(new Set<InsuranceCategory>());
  const loaded = useRef(new Set<InsuranceCategory>());

  const set = (c: InsuranceCategory, s: PlansState) => setStates((all) => ({ ...all, [c]: s }));

  const load = useCallback((c: InsuranceCategory, force = false) => {
    if (inFlight.current.has(c) || (!force && loaded.current.has(c))) return;
    inFlight.current.add(c);
    loaded.current.delete(c);
    set(c, { status: "loading" });
    api.plans(c).then(
      (r) => { loaded.current.add(c); set(c, { status: "ready", plans: r.plans, meta: r.meta }); },
      (e) => set(c, { status: "error", error: e instanceof ApiFailure ? e : new ApiFailure("NETWORK") }),
    ).finally(() => inFlight.current.delete(c));
  }, []);

  const value = useMemo<Ctx>(() => ({
    states, load, compare,
    toggleCompare: (c, id) => setCompare((all) => {
      const ids = all[c];
      return { ...all, [c]: ids.includes(id) ? ids.filter((x) => x !== id) : ids.length >= MAX_COMPARE ? ids : [...ids, id] };
    }),
    clearCompare: (c) => setCompare((all) => ({ ...all, [c]: [] })),
  }), [states, load, compare]);

  return <PlansCtx.Provider value={value}>{children}</PlansCtx.Provider>;
}

/** Loads (once) and returns one category's plans plus its compare selection. */
export function useCategoryPlans(category: InsuranceCategory) {
  const c = useContext(PlansCtx);
  if (!c) throw new Error("useCategoryPlans must be used inside PlansProvider");
  useEffect(() => c.load(category), [category]); // eslint-disable-line react-hooks/exhaustive-deps
  return {
    state: c.states[category],
    reload: () => c.load(category, true),
    compareIds: c.compare[category],
    toggleCompare: (id: string) => c.toggleCompare(category, id),
    clearCompare: () => c.clearCompare(category),
  };
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
