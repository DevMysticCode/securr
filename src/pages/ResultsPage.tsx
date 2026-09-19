import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Pencil, SlidersHorizontal, X } from "lucide-react";
import type { HealthPlan } from "../../shared/types";
import { EmptyState, ErrorState, PlanCardSkeleton } from "../components/ui";
import { inrShort } from "../lib/format";
import { parseRequirements, type Requirements } from "../lib/requirements";
import FilterPanel from "../features/health-comparison/FilterPanel";
import PlanCard from "../features/health-comparison/PlanCard";
import { MAX_COMPARE, usePlans } from "../features/health-comparison/PlansContext";
import {
  applyFilters, availableSorts, deriveFacets, initialFilters, SORT_LABELS, sortPlans, type SortKey,
} from "../features/health-comparison/filtering";

export default function ResultsPage() {
  const { state, reload } = usePlans();
  const [params] = useSearchParams();
  const req = useMemo(() => parseRequirements(params), [params]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-bold tracking-tight">Health Insurance Plans</h1>
      {state.status === "loading" && (
        <>
          <p className="mt-1 text-navy-500">Loading plans…</p>
          <div className="mt-8 space-y-5" role="status" aria-label="Loading plans">
            {[0, 1, 2].map((i) => <PlanCardSkeleton key={i} />)}
          </div>
        </>
      )}
      {state.status === "error" && <div className="mt-10"><ErrorState error={state.error} onRetry={reload} /></div>}
      {state.status === "ready" && (
        state.plans.length === 0
          ? <div className="mt-8"><EmptyState title="No health plans are available right now" hint="The data source returned an empty catalogue. Please try again later." action={<button onClick={reload} className="btn-secondary">Retry</button>} /></div>
          : <ResultsBody plans={state.plans} req={req} />
      )}
    </div>
  );
}

function RequirementsBar({ req }: { req: Requirements }) {
  const chips = [
    req.age != null && `Age ${req.age}`,
    req.members != null && `${req.members} member${req.members > 1 ? "s" : ""}`,
    req.city,
    req.coverage != null && `${inrShort(req.coverage)} cover`,
    req.renewal && (req.renewal === "renewal" ? "Existing policy / renewal" : "New policy"),
  ].filter(Boolean) as string[];
  if (!chips.length) return null;
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {chips.map((c) => <span key={c} className="rounded-full border border-navy-100 bg-navy-50 px-3 py-1 text-xs font-medium text-navy-700">{c}</span>)}
      <Link to="/search" className="inline-flex items-center gap-1 px-1 py-2.5 text-xs font-medium text-brand-700 hover:underline"><Pencil size={12} /> Edit</Link>
    </div>
  );
}

function ResultsBody({ plans, req }: { plans: HealthPlan[]; req: Requirements }) {
  const nav = useNavigate();
  const { compareIds, toggleCompare, clearCompare } = usePlans();
  const facets = useMemo(() => deriveFacets(plans), [plans]);
  const [filters, setFilters] = useState(() => initialFilters(req, facets));
  const [sort, setSort] = useState<SortKey>("recommended");
  const [drawer, setDrawer] = useState(false);

  const sorts = useMemo(() => availableSorts(plans), [plans]);
  const visible = useMemo(() => sortPlans(applyFilters(plans, filters), sort), [plans, filters, sort]);
  const reset = () => setFilters({ insurers: [], types: [] });
  const filtered = visible.length !== plans.length;
  const panel = <FilterPanel facets={facets} filters={filters} onChange={setFilters} onReset={reset} />;

  return (
    <>
      <p className="mt-1 text-navy-500">
        <strong className="text-navy-900">{visible.length} plan{visible.length === 1 ? "" : "s"} available</strong>
        {filtered && ` (of ${plans.length})`} · illustrative ranges, not live quotes
      </p>
      <RequirementsBar req={req} />
      {req.members && req.members > 1 && filters.types.includes("family-floater") && (
        <p className="mt-3 text-xs text-navy-500">Family floater plans are pre-selected for {req.members} members. Adjust under “Plan type”.</p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block"><div className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto p-5">{panel}</div></aside>

        <section className="min-w-0 pb-24">
          <div className="mb-5 flex items-center justify-between gap-3">
            <button onClick={() => setDrawer(true)} className="btn-secondary !py-2 lg:hidden"><SlidersHorizontal size={16} /> Filters</button>
            <label className="ml-auto flex min-w-0 items-center gap-2 whitespace-nowrap text-sm text-navy-500">
              Sort by
              <select className="input !w-auto min-w-0 !py-2" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                {sorts.map((k) => <option key={k} value={k}>{SORT_LABELS[k]}</option>)}
              </select>
            </label>
          </div>

          {visible.length === 0 ? (
            <EmptyState title="No plans match your filters" hint="Try widening the premium range, or clearing the coverage or age filters." action={<button className="btn-secondary" onClick={reset}>Clear all filters</button>} />
          ) : (
            <div className="space-y-5">
              {visible.map((p) => (
                <PlanCard key={p.id} plan={p} selected={compareIds.includes(p.id)} compareFull={compareIds.length >= MAX_COMPARE} onToggle={() => toggleCompare(p.id)} />
              ))}
            </div>
          )}
        </section>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-navy-900/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-white">
            <div className="flex items-center justify-between border-b border-navy-100 px-5 py-4">
              <span className="font-bold">Filters</span>
              <button onClick={() => setDrawer(false)} aria-label="Close filters"><X size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">{panel}</div>
            <div className="border-t border-navy-100 p-4"><button className="btn-primary w-full" onClick={() => setDrawer(false)}>Show {visible.length} plan{visible.length === 1 ? "" : "s"}</button></div>
          </div>
        </div>
      )}

      {compareIds.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-navy-100 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm"><strong>{compareIds.length}</strong> of {MAX_COMPARE} selected{compareIds.length < 2 && <span className="hidden text-navy-500 sm:inline"> — pick at least 2 to compare</span>}</p>
            <div className="flex gap-2">
              <button onClick={clearCompare} className="btn-secondary !py-2">Clear</button>
              <button disabled={compareIds.length < 2} onClick={() => nav(`/compare?ids=${compareIds.map(encodeURIComponent).join(",")}`)} className="btn-primary !py-2">Compare</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
