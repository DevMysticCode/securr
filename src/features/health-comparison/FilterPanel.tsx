import type { ReactNode } from "react";
import { inr, inrShort, titleCase } from "../../lib/format";
import type { Facets, Filters } from "./filtering";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={title} className="border-b border-navy-100 py-5 first:pt-0 last:border-0 min-w-0">
      <h3 className="mb-3 text-sm font-semibold text-navy-900">{title}</h3>
      {children}
    </div>
  );
}

const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function FilterPanel({ facets, filters, onChange, onReset }: {
  facets: Facets; filters: Filters; onChange: (f: Filters) => void; onReset: () => void;
}) {
  const pb = facets.premiumBounds;
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold">Filters</h2>
        <button onClick={onReset} className="text-sm font-medium text-brand-700 hover:underline">Reset</button>
      </div>

      {facets.types.length > 1 && (
        <Group title="Plan type">
          {facets.types.map(([t, n]) => (
            <label key={t} className="flex cursor-pointer items-center justify-between py-1.5 text-sm">
              <span className="flex items-center gap-2.5">
                <input type="checkbox" className="h-4 w-4 accent-brand-500" checked={filters.types.includes(t)} onChange={() => onChange({ ...filters, types: toggle(filters.types, t) })} />
                {titleCase(t)}
              </span>
              <span className="text-xs text-navy-300">{n}</span>
            </label>
          ))}
        </Group>
      )}

      {pb && pb.min !== pb.max && (
        <Group title="Illustrative premium">
          <input
            type="range" className="w-full accent-brand-500" aria-label="Maximum premium"
            min={pb.min} max={pb.max} step={500} value={filters.maxPremium ?? pb.max}
            onChange={(e) => onChange({ ...filters, maxPremium: +e.target.value >= pb.max ? undefined : +e.target.value })}
          />
          <p className="mt-1 text-sm text-navy-700">Up to <strong>{inr(filters.maxPremium ?? pb.max)}</strong></p>
        </Group>
      )}

      {facets.coverOptions.length > 0 && (
        <Group title="Sum insured offered">
          <select className="input" value={filters.cover ?? ""} onChange={(e) => onChange({ ...filters, cover: e.target.value ? +e.target.value : undefined })}>
            <option value="">Any</option>
            {facets.coverOptions.map((c) => <option key={c} value={c}>{inrShort(c)}</option>)}
            {filters.cover != null && !facets.coverOptions.includes(filters.cover) && <option value={filters.cover}>{inrShort(filters.cover)}</option>}
          </select>
        </Group>
      )}

      {facets.hasAge && (
        <Group title="Entry age">
          <input type="number" min={0} max={100} className="input" placeholder="Any" value={filters.age ?? ""} onChange={(e) => onChange({ ...filters, age: e.target.value ? +e.target.value : undefined })} />
          <p className="mt-1.5 text-xs text-navy-500">Only plans whose age range includes this age.</p>
        </Group>
      )}

      <Group title="Insurer">
        <div>
          {facets.insurers.map(([name, n]) => (
            <label key={name} className="flex cursor-pointer items-center justify-between gap-2 py-1.5 text-sm">
              <span className="flex min-w-0 items-center gap-2.5">
                <input type="checkbox" className="h-4 w-4 shrink-0 accent-brand-500" checked={filters.insurers.includes(name)} onChange={() => onChange({ ...filters, insurers: toggle(filters.insurers, name) })} />
                <span className="truncate">{name}</span>
              </span>
              <span className="text-xs text-navy-300">{n}</span>
            </label>
          ))}
        </div>
      </Group>
    </div>
  );
}
