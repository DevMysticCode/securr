import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, LayoutList, LifeBuoy, Scale } from "lucide-react";
import { categories, type CategoryConfig } from "../config/categories";
import { useCategoryPlans } from "../features/comparison/PlansContext";
import { Skeleton } from "../components/ui";
import HeroTabs from "./HeroTabs";

const pillars = [
  { icon: Scale, title: "Compare multiple insurers", text: "See plans from different insurers side by side instead of visiting each website." },
  { icon: LayoutList, title: "Explore coverage options", text: "Browse sum insured ranges, plan types and network hospital counts in one view." },
  { icon: BookOpen, title: "Understand benefits", text: "Read the highlighted features each insurer lists for its plan, with the source." },
  { icon: LifeBuoy, title: "Request assistance", text: "Talk to an adviser who can help you verify details before you decide." },
];

function CategoryTile({ cfg }: { cfg: CategoryConfig }) {
  const { state } = useCategoryPlans(cfg.slug);
  return (
    <Link to={`/${cfg.slug}/search`} className="card group flex flex-col p-6 transition hover:border-brand-500 hover:shadow-md">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><cfg.icon size={22} /></div>
      <h3 className="font-semibold">{cfg.label} insurance</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-navy-500">{cfg.blurb}</p>
      <div className="mt-4 flex items-center justify-between text-sm font-semibold text-brand-700">
        {state.status === "ready" ? `${state.plans.length} plans` : state.status === "error" ? "Compare" : <Skeleton className="h-5 w-16" />}
        <ArrowRight size={16} className="transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}

export default function LandingPage() {
  return (
    <>
      <HeroTabs />

      <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Compare more than health cover</h2>
          <p className="mt-3 text-navy-500">Explore term life, motor and travel insurance from the same catalogue.</p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => <CategoryTile key={c.slug} cfg={c} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">Everything you need to shortlist with confidence</h2>
          <p className="mt-3 text-navy-500">A clear, side-by-side view of plans, built to help you ask better questions.</p>
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
          <Link to="/health/search" className="btn-primary shrink-0 !px-7">Compare Health Plans <ArrowRight size={16} /></Link>
        </div>
      </section>
    </>
  );
}
