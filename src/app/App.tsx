import { BrowserRouter, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import Layout from "./Layout";
import { PlansProvider } from "../features/comparison/PlansContext";
import { CategoryRoute } from "../features/comparison/CategoryRoute";
import LandingPage from "../pages/LandingPage";
import SearchPage from "../pages/SearchPage";
import ResultsPage from "../pages/ResultsPage";
import PlanDetailPage from "../pages/PlanDetailPage";
import ComparePage from "../pages/ComparePage";
import InsurersPage from "../pages/InsurersPage";
import AssistancePage from "../pages/AssistancePage";
import DebugApiPage from "../pages/DebugApiPage";
import { EmptyState } from "../components/ui";

/** Old health-only URLs (/plans, /search, /compare, /plans/:id) now live under /health. */
function LegacyHealthRedirect({ to }: { to: string }) {
  const { search } = useLocation();
  const { id } = useParams();
  return <Navigate to={`/health/${to.replace(":id", id ?? "")}${search}`} replace />;
}

/**
 * Public website routes. Insurance comparison lives at /:category/* (health, term-life, motor, travel).
 * Future areas mount as sibling route trees with their own layouts/auth:
 *   /portal/customer, /portal/partner, /portal/employee, /admin, /crm  (see docs/ARCHITECTURE.md)
 */
export default function App() {
  return (
    <BrowserRouter>
      <PlansProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="insurers" element={<InsurersPage />} />
            <Route path="assistance" element={<AssistancePage />} />
            <Route path="debug/api" element={<DebugApiPage />} />

            <Route path="search" element={<LegacyHealthRedirect to="search" />} />
            <Route path="plans" element={<LegacyHealthRedirect to="plans" />} />
            <Route path="plans/:id" element={<LegacyHealthRedirect to="plans/:id" />} />
            <Route path="compare" element={<LegacyHealthRedirect to="compare" />} />

            <Route path=":category" element={<CategoryRoute />}>
              <Route index element={<Navigate to="search" replace />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="plans" element={<ResultsPage />} />
              <Route path="plans/:id" element={<PlanDetailPage />} />
              <Route path="compare" element={<ComparePage />} />
              <Route path="*" element={<div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Page not found" /></div>} />
            </Route>
            <Route path="*" element={<div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Page not found" /></div>} />
          </Route>
        </Routes>
      </PlansProvider>
    </BrowserRouter>
  );
}
