import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from "./Layout";
import { PlansProvider } from "../features/health-comparison/PlansContext";
import LandingPage from "../pages/LandingPage";
import SearchPage from "../pages/SearchPage";
import ResultsPage from "../pages/ResultsPage";
import PlanDetailPage from "../pages/PlanDetailPage";
import ComparePage from "../pages/ComparePage";
import InsurersPage from "../pages/InsurersPage";
import AssistancePage from "../pages/AssistancePage";
import DebugApiPage from "../pages/DebugApiPage";
import { EmptyState } from "../components/ui";

/**
 * Public website routes. Future areas mount as sibling route trees with their own layouts/auth:
 *   /portal/customer, /portal/partner, /portal/employee, /admin, /crm  (see docs/ARCHITECTURE.md)
 */
export default function App() {
  return (
    <BrowserRouter>
      <PlansProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<LandingPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="plans" element={<ResultsPage />} />
            <Route path="plans/:id" element={<PlanDetailPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="insurers" element={<InsurersPage />} />
            <Route path="assistance" element={<AssistancePage />} />
            <Route path="debug/api" element={<DebugApiPage />} />
            <Route path="*" element={<div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Page not found" /></div>} />
          </Route>
        </Routes>
      </PlansProvider>
    </BrowserRouter>
  );
}
