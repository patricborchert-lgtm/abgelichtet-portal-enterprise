import { Outlet } from "react-router-dom";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PremiumSidebar, DashboardIcon } from "@/components/layout/PremiumSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ImpersonationBanner } from "@/components/common/ImpersonationBanner";

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-100 bg-dashboard-grid">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        
        <PremiumSidebar
          items={[
            { label: "Dashboard", icon: <DashboardIcon />, href: "/admin", active: true },
            { label: "Kunden", icon: <DashboardIcon />, href: "/admin/clients" },
            { label: "Projekte", icon: <DashboardIcon />, href: "/admin/projects" }
          ]}
        />

        <div className="flex min-h-screen flex-col">
          <main className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
            <Topbar />
            <ImpersonationBanner />
            <Breadcrumbs />
            <Outlet />
          </main>
        </div>

      </div>
    </div>
  );
}