import { FolderKanban, LayoutDashboard, Shield, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavigationItem {
  icon: typeof LayoutDashboard;
  label: string;
  to: string;
}

const adminNavigation: NavigationItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/admin" },
  { icon: Users, label: "Kunden", to: "/admin/clients" },
  { icon: FolderKanban, label: "Projekte", to: "/admin/projects" },
];

const clientNavigation: NavigationItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/client/dashboard" },
  { icon: FolderKanban, label: "Projekte", to: "/client/dashboard" },
];

export function Sidebar() {
  const { isAdmin, profile } = useAuth();
  const items = isAdmin ? adminNavigation : clientNavigation;

  return (
    <aside className="border-r border-white/50 bg-[linear-gradient(180deg,#ffffff_0%,#f6f4ff_100%)] text-slate-800 lg:sticky lg:top-0 lg:h-screen">
      <div className="flex h-full flex-col">
        <div className="space-y-3 border-b border-slate-200 px-6 py-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#8F87F1]/15 text-[#6E65D8]">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">abgelichtet Portal</h2>
            <p className="text-sm text-slate-500">{profile ? ROLE_LABELS[profile.role] : "Portal"}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                  isActive
                    ? "bg-[#8F87F1]/12 text-[#6E65D8] shadow-[0_10px_24px_rgba(143,135,241,0.10)]"
                    : "text-slate-600 hover:bg-white hover:text-slate-950",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
