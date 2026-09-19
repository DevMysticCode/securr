import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { BackLink, EmptyState, ErrorState, InsurerAvatar, Skeleton } from "../components/ui";
import { allCompareFields } from "../lib/planFields";
import { useCategory } from "../features/comparison/CategoryRoute";
import { useCategoryPlans } from "../features/comparison/PlansContext";

export default function ComparePage() {
  const cfg = useCategory();
  const { state, reload, clearCompare, toggleCompare } = useCategoryPlans(cfg.slug);
  const [params] = useSearchParams();
  const nav = useNavigate();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);

  if (state.status === "loading" || state.status === "idle") return <div className="mx-auto max-w-5xl space-y-4 px-4 py-10"><Skeleton className="h-10 w-64" /><Skeleton className="h-96" /></div>;
  if (state.status === "error") return <div className="px-4 py-16"><ErrorState error={state.error} onRetry={reload} /></div>;

  const plans = ids.map((id) => state.plans.find((p) => p.id === id)).filter((p) => !!p);
  if (plans.length < 2) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState title="Select at least 2 plans to compare" hint="Choose 2–3 plans on the results page using “Add to compare”." action={<Link to={`/${cfg.slug}/plans`} className="btn-primary">Browse plans</Link>} />
      </div>
    );
  }

  // Rows appear only if at least one selected plan has the value.
  const rows = allCompareFields.map((f) => ({ f, vals: plans.map((p) => f.value(p)) })).filter((r) => r.vals.some(Boolean));
  const featureRow = plans.some((p) => p.features.length > 0);

  const remove = (id: string) => {
    const rest = ids.filter((x) => x !== id);
    toggleCompare(id);
    nav(rest.length ? `/${cfg.slug}/compare?ids=${rest.map(encodeURIComponent).join(",")}` : `/${cfg.slug}/plans`, { replace: true });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <BackLink to={`/${cfg.slug}/plans`}>Back to plans</BackLink>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compare plans</h1>
          <p className="mt-1 text-sm text-navy-500">Only fields supplied by the data source are shown. Illustrative, not live quotes. Premiums in INR.</p>
        </div>
        <button onClick={() => { clearCompare(); nav(`/${cfg.slug}/plans`); }} className="shrink-0 whitespace-nowrap py-2.5 pl-3 text-sm font-medium text-brand-700 hover:underline">Clear all</button>
      </div>

      <p className="mt-4 text-xs text-navy-500 sm:hidden">Swipe sideways to see every plan →</p>
      <div className="card mt-2 overflow-x-auto sm:mt-6">
        <table className="w-full min-w-[600px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-navy-100 align-top">
              <th className="sticky left-0 w-28 bg-white p-3 text-xs sm:w-40 sm:p-4 font-semibold uppercase tracking-wide text-navy-500">Feature</th>
              {plans.map((p) => (
                <th key={p!.id} className="p-4 font-normal">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <InsurerAvatar name={p!.insurerName} size={36} />
                      <div>
                        <p className="text-xs text-navy-500">{p!.insurerName}</p>
                        <Link to={`/${cfg.slug}/plans/${encodeURIComponent(p!.id)}`} className="text-base font-bold text-navy-900 hover:text-brand-700">{p!.name}</Link>
                      </div>
                    </div>
                    <button onClick={() => remove(p!.id)} aria-label={`Remove ${p!.name}`} className="-m-1 rounded p-2.5 text-navy-300 hover:bg-navy-50 hover:text-navy-700"><X size={16} /></button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.filter((r) => r.f.key !== "insurer").map(({ f, vals }) => (
              <tr key={f.key} className="border-b border-navy-50 align-top last:border-0">
                <th scope="row" className="sticky left-0 bg-white p-3 text-[11px] font-semibold uppercase tracking-wide text-navy-500 sm:p-4 sm:text-xs">{f.label}</th>
                {vals.map((v, i) => <td key={i} className="p-4 font-medium">{v ?? <span className="text-xs italic text-navy-300">Not provided</span>}</td>)}
              </tr>
            ))}
            {featureRow && (
              <tr className="align-top">
                <th scope="row" className="sticky left-0 bg-white p-3 text-[11px] font-semibold uppercase tracking-wide text-navy-500 sm:p-4 sm:text-xs">Highlights</th>
                {plans.map((p) => (
                  <td key={p!.id} className="p-4">
                    {p!.features.length ? <ul className="list-inside list-disc space-y-1 marker:text-brand-500">{p!.features.map((f) => <li key={f}>{f}</li>)}</ul> : <span className="text-xs italic text-navy-300">Not provided</span>}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
