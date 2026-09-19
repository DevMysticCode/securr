import { createContext, useContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import { EmptyState } from "../../components/ui";
import { categoryBySlug, type CategoryConfig } from "../../config/categories";

const CategoryCtx = createContext<CategoryConfig | null>(null);

/** Layout route for /:category/*. Unknown categories get a friendly not-found instead of a broken page. */
export function CategoryRoute() {
  const cfg = categoryBySlug(useParams().category);
  if (!cfg) return <div className="mx-auto max-w-xl px-4 py-20"><EmptyState title="Page not found" /></div>;
  return <CategoryCtx.Provider value={cfg}><Outlet /></CategoryCtx.Provider>;
}

export function useCategory() {
  const c = useContext(CategoryCtx);
  if (!c) throw new Error("useCategory must be used inside CategoryRoute");
  return c;
}
