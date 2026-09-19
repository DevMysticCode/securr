import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, XCircle } from "lucide-react";
import type { DebugReport } from "../../shared/types";
import { api } from "../lib/api";
import { Skeleton } from "../components/ui";

type S = { status: "loading" } | { status: "done"; report: DebugReport; roundTripMs: number } | { status: "backend-down" };

function Stat({ label, value }: { label: string; value: string | number | undefined }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-navy-500">{label}</p>
      <p className="mt-1 break-all text-lg font-bold">{value ?? "—"}</p>
    </div>
  );
}

export default function DebugApiPage() {
  const [s, setS] = useState<S>({ status: "loading" });
  const run = useCallback(() => {
    setS({ status: "loading" });
    const t0 = performance.now();
    api.debugReport().then(
      (report) => setS({ status: "done", report, roundTripMs: Math.round(performance.now() - t0) }),
      () => setS({ status: "backend-down" }),
    );
  }, []);
  useEffect(run, [run]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API debug</h1>
          <p className="mt-1 text-sm text-navy-500">Live, uncached probe of the upstream provider via our backend. The API key is never shown.</p>
        </div>
        <button onClick={run} className="btn-secondary shrink-0 !py-2"><RefreshCw size={16} /> Re-run</button>
      </div>

      {s.status === "loading" && <div className="mt-8 grid gap-4 sm:grid-cols-2"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div>}

      {s.status === "backend-down" && (
        <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-800">
          <p className="font-semibold">Our backend API is not reachable.</p>
          <p className="mt-1">The browser could not reach <code>/api/debug/health-plans</code>. Is the backend running (<code>npm run dev</code>)?</p>
        </div>
      )}

      {s.status === "done" && (() => {
        const r = s.report;
        return (
          <>
            <div className={`mt-8 flex items-center gap-3 rounded-2xl border p-5 ${r.ok ? "border-brand-200 bg-brand-50 text-brand-700" : "border-red-200 bg-red-50 text-red-800"}`}>
              {r.ok ? <CheckCircle2 /> : <XCircle />}
              <div>
                <p className="font-bold">{r.ok ? "Connected" : "Connection failed"} — {r.provider}</p>
                {!r.ok && r.error && <p className="text-sm">{r.error.diagnosis}</p>}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Stat label="Request timestamp" value={new Date(r.requestedAt).toLocaleString()} />
              <Stat label="Backend → provider time" value={`${r.durationMs} ms`} />
              <Stat label="Browser → backend round trip" value={`${s.roundTripMs} ms`} />
              <Stat label="Plans returned" value={r.planCount} />
              <Stat label="Upstream HTTP status" value={r.httpStatus} />
              <Stat label="Error code" value={r.error?.code} />
            </div>

            <div className="card mt-4 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Upstream request (key redacted)</p>
              <p className="mt-1 break-all font-mono text-sm">GET {r.upstreamUrl}</p>
            </div>

            {r.error?.bodyPreview && (
              <div className="card mt-4 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-navy-500">Upstream response body</p>
                <pre className="mt-1 overflow-x-auto text-xs">{r.error.bodyPreview}</pre>
              </div>
            )}

            {r.raw != null && (
              <details className="card mt-4 p-4">
                <summary className="cursor-pointer text-sm font-semibold">Developer: raw JSON response</summary>
                <pre className="mt-3 max-h-[32rem] overflow-auto rounded-lg bg-navy-900 p-4 text-xs text-navy-100">{JSON.stringify(r.raw, null, 2)}</pre>
              </details>
            )}
          </>
        );
      })()}
    </div>
  );
}
