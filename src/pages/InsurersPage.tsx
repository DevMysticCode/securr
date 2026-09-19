import { useState } from "react";
import { CATEGORIES, type InsurancePlan } from "../../shared/types";
import { ErrorState, Skeleton } from "../components/ui";
import { categories } from "../config/categories";
import { ApiFailure } from "../lib/api";
import InsurerInfo from "../features/comparison/InsurerInfo";
import { useCategoryPlans, useInsurers } from "../features/comparison/PlansContext";

export default function InsurersPage() {
  const insurers = useInsurers();
  const [cat, setCat] = useState<string>("all");
  // The insurer directory covers every category, so load every category's products to list them per insurer.
  const states = CATEGORIES.map((c) => useCategoryPlans(c).state); // eslint-disable-line react-hooks/rules-of-hooks
  const plans: InsurancePlan[] = states.flatMap((s) => (s.status === "ready" ? s.plans : []));
  const shown = insurers.insurers.filter((i) => cat === "all" || i.categories.includes(cat));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Insurers</h1>
      <p className="mt-1 text-navy-500">Insurers in the demo catalogue, with the products they offer.</p>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter insurers by category">
        {[{ slug: "all", label: "All" }, ...categories].map((c) => (
          <button key={c.slug} role="tab" aria-selected={cat === c.slug} onClick={() => setCat(c.slug)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${cat === c.slug ? "border-brand-500 bg-brand-50 text-brand-700" : "border-navy-200 text-navy-700 hover:border-navy-300"}`}>
            {c.label}
          </button>
        ))}
      </div>

      {insurers.status === "loading" && <div className="mt-8 grid gap-5 md:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44" />)}</div>}
      {insurers.status === "error" && <div className="mt-10"><ErrorState error={new ApiFailure("UPSTREAM_UNAVAILABLE")} onRetry={insurers.reload} /></div>}
      {insurers.status === "ready" && (
        <>
          <p className="mt-4 text-sm text-navy-500">{shown.length} insurer{shown.length === 1 ? "" : "s"}</p>
          <div className="mt-4 grid gap-5 md:grid-cols-2">
            {shown.map((i) => (
              <div key={i.slug} className="card p-6">
                <InsurerInfo insurer={i} plans={plans.filter((p) => p.insurerSlug === i.slug && (cat === "all" || p.category === cat))} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
