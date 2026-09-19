import { Link } from "react-router-dom";
import type { InsurancePlan, Insurer } from "../../../shared/types";
import { InsurerAvatar } from "../../components/ui";
import { titleCase } from "../../lib/format";

/** Insurer facts exactly as the provider returns them; missing fields simply don't render. */
export default function InsurerInfo({ insurer, plans, currentPlanId }: { insurer: Insurer; plans: InsurancePlan[]; currentPlanId?: string }) {
  const facts: [string, string | undefined][] = [
    ["Type", insurer.type ? titleCase(insurer.type) : undefined],
    ["Headquarters", insurer.headquarters],
    ["Established", insurer.established?.toString()],
    ["Network hospitals", insurer.networkHospitals?.toLocaleString("en-IN")],
    ["Claim settlement ratio", insurer.claimSettlementRatio?.value != null ? `${insurer.claimSettlementRatio.value}%${insurer.claimSettlementRatio.year ? ` (${insurer.claimSettlementRatio.year})` : ""}` : undefined],
  ];
  const others = plans.filter((p) => p.id !== currentPlanId);
  return (
    <div>
      <div className="flex items-center gap-3">
        <InsurerAvatar name={insurer.shortName ?? insurer.name} logoUrl={insurer.logoUrl} />
        <div>
          <h3 className="font-semibold">{insurer.name}</h3>
          {insurer.shortName && insurer.shortName !== insurer.name && <p className="text-xs text-navy-500">{insurer.shortName}</p>}
        </div>
      </div>
      {insurer.description && <p className="mt-3 text-sm text-navy-600">{insurer.description}</p>}
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {facts.filter(([, v]) => v).map(([k, v]) => (
          <div key={k}><dt className="text-xs font-medium uppercase tracking-wide text-navy-500">{k}</dt><dd className="mt-0.5 text-sm font-semibold">{v}</dd></div>
        ))}
      </dl>
      {others.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{currentPlanId ? "Other products from this insurer" : "Products"}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {others.map((p) => <li key={p.id}><Link to={`/${p.category}/plans/${encodeURIComponent(p.id)}`} className="rounded-full border border-navy-100 px-3 py-1 text-xs font-medium text-navy-700 hover:border-brand-500 hover:text-brand-700">{p.name}{!currentPlanId && <span className="text-navy-300"> · {titleCase(p.category)}</span>}</Link></li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
