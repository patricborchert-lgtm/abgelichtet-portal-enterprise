import { Outlet, useLocation } from "react-router-dom";
import { ClientViewBanner } from "@/components/client/ClientViewBanner";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Topbar } from "@/components/layout/Topbar";

export function ClientLayout() {
  const location = useLocation();
  const showPreviewBanner = location.pathname.startsWith("/client/projects/");

  return (
    <div className="min-h-screen">
      <main className="flex-1 p-6 lg:p-8 xl:p-10">
        <div className="mx-auto w-full max-w-[1480px] space-y-8">
          <Topbar />
          {showPreviewBanner ? <ClientViewBanner /> : null}
          <Breadcrumbs />
          <Outlet />
        </div>
      </main>
    </div>
  );
}
