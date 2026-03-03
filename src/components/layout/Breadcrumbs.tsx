import { ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const LABELS: Record<string, string> = {
  admin: "Admin",
  auth: "Auth",
  callback: "Callback",
  client: "Client",
  clients: "Clients",
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
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Link className="font-medium text-slate-700 transition hover:text-slate-950" to="/">
        Start
      </Link>
      {parts.map((part, index) => {
        const path = `/${parts.slice(0, index + 1).join("/")}`;
        const label = LABELS[part] ?? part;
        const isLast = index === parts.length - 1;

        return (
          <span className="flex items-center gap-2" key={path}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-slate-950">{label}</span>
            ) : (
              <Link className="transition hover:text-slate-950" to={path}>
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
