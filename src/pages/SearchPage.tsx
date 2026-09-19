import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Info } from "lucide-react";
import { toSearchParams, type Requirements } from "../lib/requirements";
import { moneyShort } from "../lib/format";
import { useCategory } from "../features/comparison/CategoryRoute";

export default function SearchPage() {
  const cfg = useCategory();
  const { form } = cfg;
  const nav = useNavigate();
  const [age, setAge] = useState(String(cfg.defaultAge));
  const [members, setMembers] = useState("1");
  const [city, setCity] = useState("");
  const [coverage, setCoverage] = useState(String(form.coverage?.default ?? ""));
  const [renewal, setRenewal] = useState<"new" | "renewal">("new");

  function submit(e: FormEvent) {
    e.preventDefault();
    const req: Requirements = {
      age: +age,
      members: form.members ? +members : undefined,
      city: form.city ? city.trim() || undefined : undefined,
      coverage: form.coverage ? +coverage : undefined,
      renewal: form.renewal ? renewal : undefined,
    };
    nav(`/${cfg.slug}/plans?${toSearchParams(req)}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-brand-700"><cfg.icon size={18} /> {cfg.label} insurance</p>
      <h1 className="text-3xl font-bold tracking-tight">Tell us what you need</h1>
      <p className="mt-2 text-navy-500">{cfg.searchIntro}</p>

      <form onSubmit={submit} className="card mt-8 space-y-6 p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="age" className="label">{form.ageLabel}</label>
            <input id="age" type="number" required min={0} max={100} className="input" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          {form.members && (
            <div>
              <label htmlFor="members" className="label">Number of members</label>
              <select id="members" className="input" value={members} onChange={(e) => setMembers(e.target.value)}>
                {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
          {form.city && (
            <div>
              <label htmlFor="city" className="label">City</label>
              <input id="city" className="input" placeholder="e.g. Mumbai" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          )}
          {form.coverage && (
            <div>
              <label htmlFor="coverage" className="label">{form.coverage.label}</label>
              <select id="coverage" className="input" value={coverage} onChange={(e) => setCoverage(e.target.value)}>
                {form.coverage.choices.map((c) => <option key={c} value={c}>{moneyShort(c, form.coverage!.currency)}</option>)}
              </select>
            </div>
          )}
        </div>

        {form.renewal && (
          <fieldset>
            <legend className="label">{form.renewal.legend}</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {([["new", form.renewal.new], ["renewal", form.renewal.existing]] as const).map(([v, l]) => (
                <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm transition ${renewal === v ? "border-brand-500 bg-brand-50" : "border-navy-200 hover:border-navy-300"}`}>
                  <input type="radio" name="renewal" className="accent-brand-500" checked={renewal === v} onChange={() => setRenewal(v)} /> {l}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <p className="flex gap-2 rounded-xl bg-navy-50 p-3.5 text-xs leading-relaxed text-navy-600">
          <Info size={14} className="mt-0.5 shrink-0" />
          Your answers are used to pre-select filters and are shown as a summary. The demo catalogue does not price by individual details, so results show illustrative ranges, not live quotes.
        </p>

        <button type="submit" className="btn-primary w-full !py-3.5 text-base">Compare {cfg.label} Plans <ArrowRight size={18} /></button>
      </form>
    </div>
  );
}
