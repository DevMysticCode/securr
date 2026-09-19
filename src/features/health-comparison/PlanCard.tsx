import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import type { HealthPlan } from "../../../shared/types";
import { Badge, InsurerAvatar } from "../../components/ui";
import { inr, inrShort, rangeOf, titleCase } from "../../lib/format";
import { MAX_COMPARE } from "./PlansContext";

function Fact({ label, value }: { label: string; value?: string }) {
  if (!value) return null; // never show a field the API did not return
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-navy-900">{value}</dd>
    </div>
  );
}

export default function PlanCard({ plan, selected, onToggle, compareFull }: {
  plan: HealthPlan; selected: boolean; onToggle: () => void; compareFull: boolean;
}) {
  const premium = rangeOf(plan.premium?.min, plan.premium?.max, inr);
  const age = rangeOf(plan.eligibility?.minAge, plan.eligibility?.maxAge, String);
  const shown = plan.features.slice(0, 4);
  const disabled = !selected && compareFull;

  return (
    <article className={`card p-5 transition hover:shadow-md sm:p-6 ${selected ? "border-brand-500 ring-1 ring-brand-500" : ""}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <InsurerAvatar name={plan.insurerName} />
            <div className="min-w-0">
              <p className="truncate text-sm text-navy-500">{plan.insurerName}</p>
              <h3 className="text-xl font-bold text-navy-900">{plan.name}</h3>
            </div>
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
            <Fact label="Sum insured" value={rangeOf(plan.sumInsured?.min, plan.sumInsured?.max, inrShort)} />
            <Fact label="Hospitals" value={plan.networkHospitals?.count?.toLocaleString("en-IN")} />
            <Fact label="Entry age" value={age && `${age} yrs`} />
            <Fact label="Renewability" value={plan.renewability} />
          </dl>

          {shown.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-2">
              {shown.map((f) => (
                <li key={f} className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                  <Check size={12} /> {f}
                </li>
              ))}
              {plan.features.length > shown.length && <li className="px-1 py-1 text-xs text-navy-500">+{plan.features.length - shown.length} more</li>}
            </ul>
          )}
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-xl bg-navy-50 p-4 lg:w-64 lg:shrink-0">
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              {plan.planType && <Badge tone="brand">{titleCase(plan.planType)}</Badge>}
              {plan.premium?.verified === false && <Badge tone="amber">Indicative</Badge>}
            </div>
            {premium ? (
              <>
                <p className="mt-3 text-xs font-medium uppercase tracking-wide text-navy-500">Illustrative premium</p>
                <p className="text-xl font-bold text-navy-900">{premium}</p>
                {plan.premium?.assumptions && <p className="mt-1 text-xs leading-snug text-navy-500">{plan.premium.assumptions}</p>}
              </>
            ) : (
              <p className="mt-3 text-sm italic text-navy-300">Premium not provided</p>
            )}
          </div>
          <div className="space-y-3">
            <Link to={`/plans/${encodeURIComponent(plan.id)}`} className="btn-primary w-full">View Plan <ArrowRight size={16} /></Link>
            <label className={`flex items-center gap-2 text-sm ${disabled ? "cursor-not-allowed text-navy-300" : "cursor-pointer text-navy-700"}`}>
              <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={selected} disabled={disabled} onChange={onToggle} />
              {disabled ? `Compare (max ${MAX_COMPARE})` : "Add to compare"}
            </label>
          </div>
        </div>
      </div>
    </article>
  );
}
