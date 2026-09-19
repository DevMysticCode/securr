import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, SearchX, TriangleAlert, WifiOff } from "lucide-react";
import { ApiFailure } from "../lib/api";

export function Badge({ children, tone = "navy" }: { children: ReactNode; tone?: "navy" | "brand" | "amber" }) {
  const tones = {
    navy: "bg-navy-50 text-navy-700 border-navy-100",
    brand: "bg-brand-50 text-brand-700 border-brand-100",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
  };
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-navy-100 ${className}`} />;
}

export function PlanCardSkeleton() {
  return (
    <div className="card p-5 sm:p-6" aria-hidden>
      <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-7 w-64 max-w-full" />
          <div className="grid grid-cols-2 gap-4 pt-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
          </div>
          <div className="flex gap-2 pt-2"><Skeleton className="h-6 w-32 rounded-full" /><Skeleton className="h-6 w-28 rounded-full" /></div>
        </div>
        <Skeleton className="h-28 w-full lg:w-56" />
      </div>
    </div>
  );
}

export function ErrorState({ error, onRetry }: { error: ApiFailure; onRetry: () => void }) {
  const Icon = error.code === "NETWORK" ? WifiOff : TriangleAlert;
  return (
    <div role="alert" className="card mx-auto max-w-xl p-8 text-center sm:p-10">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600"><Icon size={24} /></div>
      <h2 className="text-lg font-semibold">{error.message}</h2>
      <p className="mt-2 text-sm text-navy-500">
        {error.code === "RATE_LIMITED" ? "The demo data source has reached its daily request limit. " : ""}
        No placeholder data is shown in its place.
      </p>
      <p className="mt-1 text-xs text-navy-300">Reference: {error.code}{error.status ? ` · HTTP ${error.status}` : ""}</p>
      <button onClick={onRetry} className="btn-primary mt-6"><RefreshCw size={16} /> Retry</button>
    </div>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="card p-10 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-navy-50 text-navy-500"><SearchX size={24} /></div>
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint && <p className="mx-auto mt-2 max-w-md text-sm text-navy-500">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function NotProvided({ children = "Not provided by the data source" }: { children?: ReactNode }) {
  return <span className="text-sm italic text-navy-300">{children}</span>;
}

export function InsurerAvatar({ name, logoUrl, size = 44 }: { name: string; logoUrl?: string; size?: number }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("");
  // A logo is rendered only when the provider itself supplies one; otherwise a neutral monogram.
  return logoUrl ? (
    <img src={logoUrl} alt={`${name} logo`} style={{ width: size, height: size }} className="rounded-xl border border-navy-100 object-contain p-1" />
  ) : (
    <div style={{ width: size, height: size }} className="flex shrink-0 items-center justify-center rounded-xl bg-navy-50 text-sm font-bold text-navy-600" aria-hidden>{initials}</div>
  );
}

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return <Link to={to} className="text-sm font-medium text-brand-700 hover:underline">← {children}</Link>;
}
