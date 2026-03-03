import { Outlet } from "react-router-dom";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ImpersonationBanner } from "@/components/common/ImpersonationBanner";

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-100 bg-dashboard-grid">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <Sidebar />
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
