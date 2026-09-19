import { useRef, type KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, Check, Info } from "lucide-react";
import { brand } from "../config/brand";
import { categories, categoryBySlug } from "../config/categories";
import { Skeleton } from "../components/ui";
import { useCategoryPlans } from "../features/comparison/PlansContext";

/**
 * Landing hero. Visitors choose the product with tabs (no auto-advance); the selection lives in ?type=
 * so a campaign can link straight to e.g. /?type=motor. Health is the default.
 */
export default function HeroTabs() {
  const [params, setParams] = useSearchParams();
  const cfg = categoryBySlug(params.get("type") ?? "") ?? categories[0]!;
  const { state } = useCategoryPlans(cfg.slug);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number, focus = false) => {
    const next = categories[(i + categories.length) % categories.length]!;
    setParams(next.slug === categories[0]!.slug ? {} : { type: next.slug }, { replace: true, preventScrollReset: true });
    if (focus) tabRefs.current[categories.indexOf(next)]?.focus();
  };
  const onKey = (e: KeyboardEvent, i: number) => {
    const move = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: categories.length - 1 }[e.key];
    if (move == null) return;
    e.preventDefault();
    select(move, true);
  };

  const ready = state.status === "ready";
  const insurerCount = ready ? new Set(state.plans.map((p) => p.insurerName)).size : undefined;
  const noun = cfg.label.toLowerCase();

  return (
    <section className="relative overflow-hidden bg-navy-900 text-white">
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 sm:pb-24 sm:pt-8">
        <div role="tablist" aria-label="Insurance type" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
          {categories.map((c, i) => {
            const on = c.slug === cfg.slug;
            return (
              <button
                key={c.slug} ref={(el) => { tabRefs.current[i] = el; }}
                role="tab" id={`hero-tab-${c.slug}`} aria-selected={on} aria-controls="hero-panel" tabIndex={on ? 0 : -1}
                onClick={() => select(i)} onKeyDown={(e) => onKey(e, i)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${on ? "border-brand-500 bg-brand-500 text-white" : "border-white/20 text-navy-100 hover:border-white/50 hover:text-white"}`}
              >
                <c.icon size={16} /> {c.label}
              </button>
            );
          })}
        </div>

        <div id="hero-panel" role="tabpanel" aria-labelledby={`hero-tab-${cfg.slug}`} key={cfg.slug} className="hero-in mt-10 grid gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <p className="mb-4 inline-block rounded-full border border-brand-500/40 bg-brand-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-100">{cfg.hero.eyebrow}</p>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:min-h-[2.5em] lg:text-6xl">{cfg.hero.title}</h1>
            <p className="mt-5 max-w-xl text-lg text-navy-200 sm:min-h-[3.5rem]">{cfg.hero.subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={`/${cfg.slug}/search`} className="btn-primary !px-7 !py-3.5 text-base">{cfg.hero.cta} <ArrowRight size={18} /></Link>
              <Link to="/assistance" className="btn border border-white/25 text-white hover:bg-white/10">Request assistance</Link>
            </div>
            <p className="mt-8 flex max-w-xl gap-2 text-xs leading-relaxed text-navy-300">
              <Info size={14} className="mt-0.5 shrink-0" /> {brand.disclaimer}
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
            <p className="text-sm font-semibold text-brand-100">Currently in the {noun} catalogue</p>
            <div className="mt-2 flex items-end gap-6">
              <div>
                {ready ? <p className="text-5xl font-extrabold">{state.plans.length}</p> : <Skeleton className="h-12 w-16 !bg-white/10" />}
                <p className="mt-1 text-sm text-navy-200">{noun} plans</p>
              </div>
              <div>
                {insurerCount != null ? <p className="text-5xl font-extrabold">{insurerCount}</p> : <Skeleton className="h-12 w-16 !bg-white/10" />}
                <p className="mt-1 text-sm text-navy-200">insurers</p>
              </div>
            </div>
            {state.status === "error" && <p className="mt-3 text-xs text-amber-300">{state.error.message}</p>}
            <ul className="mt-6 min-h-[10.5rem] space-y-2.5 border-t border-white/10 pt-6 text-sm text-navy-100">
              {cfg.hero.highlights.map((h) => <li key={h} className="flex items-center gap-2.5"><Check size={16} className="text-brand-500" /> {h}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
