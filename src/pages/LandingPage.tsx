import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Check, Info, LayoutList, LifeBuoy, Scale } from "lucide-react";
import { brand } from "../config/brand";
import { usePlans } from "../features/health-comparison/PlansContext";
import { Skeleton } from "../components/ui";

const pillars = [
  { icon: Scale, title: "Compare multiple insurers", text: "See plans from different insurers side by side instead of visiting each website." },
  { icon: LayoutList, title: "Explore coverage options", text: "Browse sum insured ranges, plan types and network hospital counts in one view." },
  { icon: BookOpen, title: "Understand benefits", text: "Read the highlighted features each insurer lists for its plan, with the source." },
  { icon: LifeBuoy, title: "Request assistance", text: "Talk to an adviser who can help you verify details before you decide." },
];

const comparable = ["Illustrative premium range", "Sum insured options", "Network hospitals", "Entry age & renewability", "Plan highlights"];

export default function LandingPage() {
  const { state } = usePlans();
  const insurerCount = state.status === "ready" ? new Set(state.plans.map((p) => p.insurerName)).size : undefined;

  return (
    <>
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 inline-block rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-100">Health insurance marketplace</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">Compare Health Insurance Plans</h1>
            <p className="mt-5 max-w-xl text-lg text-navy-200">Explore health insurance plans from multiple insurers in one place.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/search" className="btn-primary !px-7 !py-3.5 text-base">Compare Health Plans <ArrowRight size={18} /></Link>
              <Link to="/assistance" className="btn border border-white/25 text-white hover:bg-white/10">Request assistance</Link>
            </div>
            <p className="mt-8 flex max-w-xl gap-2 text-xs leading-relaxed text-navy-300">
              <Info size={14} className="mt-0.5 shrink-0" /> {brand.disclaimer}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
            <p className="text-sm font-semibold text-brand-100">Currently in the catalogue</p>
            <div className="mt-2 flex items-end gap-6">
              <div>
                {state.status === "ready" ? <p className="text-5xl font-extrabold">{state.plans.length}</p> : <Skeleton className="h-12 w-16 !bg-white/10" />}
                <p className="mt-1 text-sm text-navy-200">health plans</p>
              </div>
              <div>
                {insurerCount != null ? <p className="text-5xl font-extrabold">{insurerCount}</p> : <Skeleton className="h-12 w-16 !bg-white/10" />}
                <p className="mt-1 text-sm text-navy-200">insurers</p>
              </div>
            </div>
            {state.status === "error" && <p className="mt-3 text-xs text-amber-300">{state.error.message}</p>}
            <ul className="mt-6 space-y-2.5 border-t border-white/10 pt-6 text-sm text-navy-100">
              {comparable.map((c) => <li key={c} className="flex items-center gap-2.5"><Check size={16} className="text-brand-500" /> {c}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to shortlist with confidence</h2>
          <p className="mt-3 text-navy-500">A clear, side-by-side view of health plans, built to help you ask better questions.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6 transition hover:shadow-md">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon size={22} /></div>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-500">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-brand-50 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="text-2xl font-bold">Ready to see the plans?</h2>
            <p className="mt-1 text-navy-600">Tell us a little about who needs cover and compare in seconds.</p>
          </div>
          <Link to="/search" className="btn-primary shrink-0 !px-7">Compare Health Plans <ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  );
}
