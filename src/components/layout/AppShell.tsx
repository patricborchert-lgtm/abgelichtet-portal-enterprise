import { FolderKanban, LayoutDashboard, Users } from "lucide-react";
import { Outlet } from "react-router-dom";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { PremiumSidebar } from "@/components/layout/PremiumSidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ImpersonationBanner } from "@/components/common/ImpersonationBanner";

export function AppShell() {
  return (
    <div className="min-h-screen">
      <PremiumSidebar
        items={[
          { label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" />, href: "/admin" },
          { label: "Kunden", icon: <Users className="h-5 w-5" />, href: "/admin/clients" },
          { label: "Projekte", icon: <FolderKanban className="h-5 w-5" />, href: "/admin/projects" },
        ]}
      />

      <div className="ml-64 flex min-h-screen flex-col">
        <main className="flex-1 p-6 lg:p-8 xl:p-10">
          <div className="mx-auto w-full max-w-[1480px] space-y-8">
            <Topbar />
            <ImpersonationBanner />
            <Breadcrumbs />
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
