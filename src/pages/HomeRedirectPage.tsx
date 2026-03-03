import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";

export function HomeRedirectPage() {
  const { isAdmin, loading, session } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner label="Portal wird geladen..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  return <Navigate replace to={isAdmin ? "/admin" : "/client/dashboard"} />;
}
