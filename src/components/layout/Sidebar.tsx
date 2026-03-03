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
  { icon: Users, label: "Clients", to: "/admin/clients" },
  { icon: FolderKanban, label: "Projects", to: "/admin/projects" },
];

const clientNavigation: NavigationItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/client/dashboard" },
  { icon: FolderKanban, label: "Projects", to: "/client/dashboard" },
];

export function Sidebar() {
  const { isAdmin, profile } = useAuth();
  const items = isAdmin ? adminNavigation : clientNavigation;

  return (
    <aside className="border-r border-slate-200 bg-slate-950 text-slate-100 lg:sticky lg:top-0 lg:h-screen">
      <div className="flex h-full flex-col">
        <div className="space-y-3 border-b border-slate-800 px-6 py-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400 text-slate-950">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">abgelichtet Portal</h2>
            <p className="text-sm text-slate-400">{profile ? ROLE_LABELS[profile.role] : "Portal"}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                  isActive ? "bg-slate-100 text-slate-950" : "text-slate-300 hover:bg-slate-900 hover:text-white",
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
