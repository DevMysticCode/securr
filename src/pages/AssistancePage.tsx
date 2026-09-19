import { useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { CATEGORIES, type InsuranceCategory } from "../../shared/types";
import { useCategoryPlans } from "../features/comparison/PlansContext";

/** Names the plan the visitor came from. Only mounted when a plan is given, so no extra data is loaded otherwise. */
function PlanNote({ category, id }: { category: InsuranceCategory; id: string }) {
  const { state } = useCategoryPlans(category);
  const plan = state.status === "ready" ? state.plans.find((p) => p.id === id) : undefined;
  return plan ? <>Regarding <strong>{plan.name}</strong> by {plan.insurerName}.</> : <>An adviser can help you verify plan details before you decide.</>;
}

/** Placeholder for the future CRM lead capture. In this demo nothing is stored or sent. */
export default function AssistancePage() {
  const [params] = useSearchParams();
  const planId = params.get("plan");
  const cat = CATEGORIES.find((c) => c === params.get("category"));
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <CheckCircle2 size={48} className="mx-auto text-brand-500" />
        <h1 className="mt-4 text-2xl font-bold">Thanks — this is a demo</h1>
        <p className="mt-2 text-navy-500">In the live product an adviser would contact you. In this demo, your details were not stored or sent anywhere.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight">Request assistance</h1>
      <p className="mt-2 text-navy-500">{planId && cat ? <PlanNote category={cat} id={planId} /> : "An adviser can help you verify plan details before you decide."}</p>
      <form className="card mt-8 space-y-5 p-6 sm:p-8" onSubmit={(e: FormEvent) => { e.preventDefault(); setDone(true); }}>
        <div><label htmlFor="n" className="label">Full name</label><input id="n" required className="input" /></div>
        <div><label htmlFor="p" className="label">Phone</label><input id="p" type="tel" required className="input" /></div>
        <div><label htmlFor="e" className="label">Email <span className="font-normal text-navy-300">(optional)</span></label><input id="e" type="email" className="input" /></div>
        <button className="btn-primary w-full">Request a call back</button>
        <p className="text-center text-xs text-navy-500">Demo form — no data is sent or stored.</p>
      </form>
    </div>
  );
}
