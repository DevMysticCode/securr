import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, ShieldCheck, X } from "lucide-react";
import { brand } from "../config/brand";
import { categories } from "../config/categories";

const nav = [
  ...categories.map((c) => ({ to: `/${c.slug}/search`, prefix: `/${c.slug}`, label: c.label })),
  { to: "/insurers", prefix: "/insurers", label: "Insurers" },
  { to: "/assistance", prefix: "/assistance", label: "Get assistance" },
];

/** Public website shell. Portals (customer/partner/employee/admin) will get their own layouts alongside this. */
export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  const active = (prefix: string) => pathname === prefix || pathname.startsWith(prefix + "/");

  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-navy-900 px-4 py-2 text-center text-xs font-medium tracking-wide text-brand-100">
        <span className="mr-2 rounded bg-brand-500 px-1.5 py-0.5 text-[10px] font-bold text-white">DEMO</span>
        {brand.demoBanner.replace(/^DEMO — /, "")}
      </div>

      <header className="sticky top-0 z-30 border-b border-navy-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5" aria-label={`${brand.fullName} home`}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-brand-500"><ShieldCheck size={20} /></span>
            <span className="leading-tight">
              <span className="block text-base font-bold text-navy-900">{brand.name}</span>
              <span className="block text-[11px] font-medium uppercase tracking-wider text-navy-500">{brand.tagline}</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${active(n.prefix) ? "bg-brand-50 text-brand-700" : "text-navy-700 hover:bg-navy-50"}`}>{n.label}</NavLink>
            ))}
            <Link to="/health/search" className="btn-primary ml-3 hidden whitespace-nowrap !py-2 xl:inline-flex">Compare Health Plans</Link>
          </nav>

          <button className="rounded-lg p-2 text-navy-800 hover:bg-navy-50 lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-navy-100 bg-white px-4 py-3 lg:hidden" aria-label="Mobile">
            {nav.map((n) => <NavLink key={n.to} to={n.to} className={`block rounded-lg px-3 py-3 text-sm font-medium hover:bg-navy-50 ${active(n.prefix) ? "text-brand-700" : "text-navy-800"}`}>{n.label}</NavLink>)}
            <Link to="/health/search" className="btn-primary mt-2 w-full">Compare Health Plans</Link>
          </nav>
        )}
      </header>

      <main className="flex-1"><Outlet /></main>

      <footer className="bg-navy-900 text-navy-200">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="flex flex-col justify-between gap-6 md:flex-row">
            <div>
              <p className="text-lg font-bold text-white">{brand.fullName}</p>
              <p className="mt-1 text-sm text-navy-300">Insurance comparison — demo build.</p>
            </div>
            <div className="flex flex-wrap gap-x-8 text-sm">
              {categories.map((c) => <Link key={c.slug} to={`/${c.slug}/search`} className="py-2.5 hover:text-white">{c.label}</Link>)}
              <Link to="/insurers" className="py-2.5 hover:text-white">Insurers</Link>
              <Link to="/debug/api" className="py-2.5 hover:text-white">API status</Link>
            </div>
          </div>
          <p className="mt-8 border-t border-navy-700 pt-6 text-xs leading-relaxed text-navy-300">
            {brand.disclaimer} Premiums are illustrative ranges from the {brand.dataSourceName} and are not live quotes.
          </p>
        </div>
      </footer>
    </div>
  );
}
