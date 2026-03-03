import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { isAdmin, loading, session } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner label="Authentifizierung wird geladen..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate replace to="/client/dashboard" />;
  }

  return <Outlet />;
}
