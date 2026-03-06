import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const LABELS: Record<string, string> = {
  admin: "Admin",
  auth: "Anmeldung",
  callback: "Weiterleitung",
  client: "Kundenbereich",
  clients: "Kunden",
  dashboard: "Dashboard",
  new: "Neu",
  project: "Projekt",
  projects: "Projekte",
  "set-password": "Passwort setzen",
};

export function Breadcrumbs() {
  const location = useLocation();
  const parts = location.pathname.split("/").filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/70 bg-white/85 px-4 py-3 text-sm shadow-sm"
    >
      <Link
        className="rounded-full bg-violet-50 px-3 py-1 font-medium text-violet-700 transition-colors duration-200 hover:bg-violet-100"
        to="/"
      >
        Start
      </Link>
      {parts.map((part, index) => {
        const path = `/${parts.slice(0, index + 1).join("/")}`;
        const label = LABELS[part] ?? part;
        const isLast = index === parts.length - 1;

        return (
          <span className="flex items-center gap-2" key={path}>
            <ChevronRight className="h-4 w-4 text-slate-300" />
            {isLast ? (
              <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-900">{label}</span>
            ) : (
              <Link className="rounded-full px-2.5 py-1 text-slate-500 transition-colors duration-200 hover:bg-slate-100 hover:text-slate-900" to={path}>
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
