import type { ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ExternalLink } from "lucide-react";
import type { InsurancePlan } from "../../shared/types";
import { BackLink, Badge, EmptyState, ErrorState, InsurerAvatar, NotProvided, Skeleton } from "../components/ui";
import { titleCase } from "../lib/format";
import { coverageFields, eligibilityFields, overviewFields, sourceFields, type FieldDef } from "../lib/planFields";
import InsurerInfo from "../features/comparison/InsurerInfo";
import { useCategory } from "../features/comparison/CategoryRoute";
import { useInsurers, useCategoryPlans } from "../features/comparison/PlansContext";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card p-6 sm:p-8">
      <h2 className="mb-5 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Fields({ fields, plan }: { fields: FieldDef[]; plan: InsurancePlan }) {
  const rows = fields.map((f) => [f.label, f.value(plan)] as const).filter(([, v]) => v);
  if (!rows.length) return <NotProvided />;
  return (
    <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
      {rows.map(([k, v]) => <div key={k}><dt className="text-xs font-medium uppercase tracking-wide text-navy-500">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>)}
    </dl>
  );
}

export default function PlanDetailPage() {
  const { id } = useParams();
  const cfg = useCategory();
  const { state, reload, compareIds, toggleCompare } = useCategoryPlans(cfg.slug);
  const insurers = useInsurers();

  if (state.status === "loading" || state.status === "idle") return <div className="mx-auto max-w-4xl space-y-4 px-4 py-10"><Skeleton className="h-10 w-72" /><Skeleton className="h-48" /><Skeleton className="h-48" /></div>;
  if (state.status === "error") return <div className="px-4 py-16"><ErrorState error={state.error} onRetry={reload} /></div>;

  const plan = state.plans.find((p) => p.id === id);
  if (!plan) return <div className="mx-auto max-w-2xl px-4 py-16"><EmptyState title="Plan not found" hint="This plan is not in the current catalogue." action={<Link to={`/${cfg.slug}/plans`} className="btn-secondary">Back to plans</Link>} /></div>;

  const insurer = insurers.insurers.find((i) => i.slug === plan.insurerSlug);
  const insurerPlans = state.plans.filter((p) => p.insurerName === plan.insurerName);
  const extra = Object.entries(plan.additional);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
      <BackLink to={`/${cfg.slug}/plans`}>All {cfg.label.toLowerCase()} plans</BackLink>

      <header className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <InsurerAvatar name={plan.insurerName} size={56} />
          <div>
            <p className="text-sm text-navy-500">{plan.insurerName}</p>
            <h1 className="text-3xl font-bold tracking-tight">{plan.name}</h1>
            <div className="mt-2 flex gap-1.5">
              {plan.planType && <Badge tone="brand">{titleCase(plan.planType)}</Badge>}
              {plan.premium?.verified === false && <Badge tone="amber">Indicative premium</Badge>}
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => toggleCompare(plan.id)} className="btn-secondary" disabled={!compareIds.includes(plan.id) && compareIds.length >= 3}>
            {compareIds.includes(plan.id) ? "Remove from compare" : "Add to compare"}
          </button>
          <Link to={`/assistance?category=${plan.category}&plan=${encodeURIComponent(plan.id)}`} className="btn-primary">Request assistance</Link>
        </div>
      </header>

      <div className="mt-8 space-y-6">
        <Section title="Overview"><Fields fields={overviewFields} plan={plan} /></Section>
        <Section title="Coverage"><Fields fields={coverageFields} plan={plan} /></Section>

        <Section title="Benefits">
          {plan.features.length ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {plan.features.map((f) => <li key={f} className="flex items-start gap-2.5 text-sm"><Check size={16} className="mt-0.5 shrink-0 text-brand-600" /> {f}</li>)}
            </ul>
          ) : <NotProvided />}
          <p className="mt-4 text-xs text-navy-500">Highlights as listed by the data source; not a complete policy wording.</p>
        </Section>

        <Section title="Eligibility"><Fields fields={eligibilityFields} plan={plan} /></Section>
        <Section title="Waiting period"><NotProvided /></Section>
        <Section title="Exclusions"><NotProvided /></Section>

        <Section title="Insurer information">
          {insurers.status === "loading" && <Skeleton className="h-24" />}
          {insurers.status === "error" && <p className="text-sm text-navy-500">Insurer details are temporarily unavailable. <button className="font-medium text-brand-700 underline" onClick={insurers.reload}>Retry</button></p>}
          {insurers.status === "ready" && (insurer
            ? <InsurerInfo insurer={insurer} plans={insurerPlans} currentPlanId={plan.id} />
            : <><p className="font-semibold">{plan.insurerName}</p><div className="mt-2"><NotProvided>No further insurer details provided</NotProvided></div></>)}
        </Section>

        <Section title="Data source">
          <Fields fields={sourceFields} plan={plan} />
          {extra.length > 0 && (
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              {extra.map(([k, v]) => <div key={k}><dt className="text-xs font-medium uppercase tracking-wide text-navy-500">{titleCase(k.replace(/([A-Z])/g, " $1").toLowerCase())}</dt><dd className="mt-0.5 break-words text-sm font-semibold">{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd></div>)}
            </dl>
          )}
          {plan.sourceUrl && <a href={plan.sourceUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 py-2.5 text-sm font-medium text-brand-700 hover:underline">Insurer’s product page <ExternalLink size={14} /></a>}
          <p className="mt-4 rounded-xl bg-navy-50 p-3.5 text-xs leading-relaxed text-navy-600">Demo data. Premiums are illustrative and not a live quote. Verify all details with the insurer before making a decision.</p>
        </Section>
      </div>
    </div>
  );
}
