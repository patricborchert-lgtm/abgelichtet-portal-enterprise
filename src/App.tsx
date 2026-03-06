import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import { AppErrorFallback } from "@/components/common/AppErrorFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppShell } from "@/components/layout/AppShell";
import { ClientLayout } from "@/components/layout/ClientLayout";
import { useAuth } from "@/hooks/useAuth";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { ClientDetailsPage } from "@/pages/admin/ClientDetailsPage";
import { ClientsPage } from "@/pages/admin/ClientsPage";
import { NewClientPage } from "@/pages/admin/NewClientPage";
import { NewProjectPage } from "@/pages/admin/NewProjectPage";
import { ProjectDetailsPage } from "@/pages/admin/ProjectDetailsPage";
import { ProjectsPage } from "@/pages/admin/ProjectsPage";
import { AuthCallbackPage } from "@/pages/AuthCallbackPage";
import { ClientDashboardPage } from "@/pages/client/ClientDashboardPage";
import { HomeRedirectPage } from "@/pages/HomeRedirectPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFound";
import { SetPasswordPage } from "@/pages/SetPasswordPage";

function AdminProjectRoute() {
  return <ProjectDetailsPage />;
}

function ClientProjectRoute() {
  const { isAdmin } = useAuth();

  return <ProjectDetailsPage forceClientView={isAdmin} />;
}

function LegacyProjectRoute() {
  const { id } = useParams();
  const { isAdmin } = useAuth();

  if (!id) {
    return <Navigate replace to={isAdmin ? "/admin" : "/client/dashboard"} />;
  }

  return <Navigate replace to={isAdmin ? `/admin/projects/${id}` : `/client/projects/${id}`} />;
}

export default function App() {
  return (
    <ErrorBoundary FallbackComponent={AppErrorFallback}>
      <BrowserRouter>
        <Routes>
          <Route element={<HomeRedirectPage />} path="/" />
          <Route element={<LoginPage />} path="/login" />
          <Route element={<SetPasswordPage />} path="/set-password" />
          <Route element={<AuthCallbackPage />} path="/auth/callback" />

          <Route element={<ProtectedRoute />}>
            <Route element={<ClientLayout />}>
              <Route element={<Navigate replace to="/client/dashboard" />} path="/client" />
              <Route element={<ClientDashboardPage />} path="/client/dashboard" />
              <Route element={<ClientProjectRoute />} path="/client/projects/:id" />
              <Route element={<LegacyProjectRoute />} path="/project/:id" />
            </Route>
          </Route>

          <Route element={<ProtectedRoute requireAdmin />}>
            <Route element={<AppShell />}>
              <Route element={<AdminDashboardPage />} path="/admin" />
              <Route element={<ClientsPage />} path="/admin/clients" />
              <Route element={<NewClientPage />} path="/admin/clients/new" />
              <Route element={<ClientDetailsPage />} path="/admin/clients/:id" />
              <Route element={<ProjectsPage />} path="/admin/projects" />
              <Route element={<NewProjectPage />} path="/admin/projects/new" />
              <Route element={<AdminProjectRoute />} path="/admin/projects/:id" />
            </Route>
          </Route>

          <Route element={<NotFoundPage />} path="/not-found" />
          <Route element={<Navigate replace to="/not-found" />} path="*" />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
