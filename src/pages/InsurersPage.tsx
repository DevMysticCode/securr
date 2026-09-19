import { ErrorState, Skeleton } from "../components/ui";
import { ApiFailure } from "../lib/api";
import InsurerInfo from "../features/health-comparison/InsurerInfo";
import { useInsurers, usePlans } from "../features/health-comparison/PlansContext";

export default function InsurersPage() {
  const insurers = useInsurers();
  const { state } = usePlans();
  const plans = state.status === "ready" ? state.plans : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Health insurers</h1>
      <p className="mt-1 text-navy-500">Insurers in the demo catalogue that offer health plans.</p>

      {insurers.status === "loading" && <div className="mt-8 grid gap-5 md:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-44" />)}</div>}
      {insurers.status === "error" && <div className="mt-10"><ErrorState error={new ApiFailure("UPSTREAM_UNAVAILABLE")} onRetry={insurers.reload} /></div>}
      {insurers.status === "ready" && (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {insurers.insurers.map((i) => (
            <div key={i.slug} className="card p-6">
              <InsurerInfo insurer={i} plans={plans.filter((p) => p.insurerSlug === i.slug)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
