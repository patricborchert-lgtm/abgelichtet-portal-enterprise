import { Eye } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ClientViewBanner() {
  const navigate = useNavigate();
  const params = useParams();
  const { isAdmin } = useAuth();

  if (!isAdmin || !params.id) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 p-3">
      <div className="flex items-center gap-2 text-sm font-medium text-violet-900">
        <Eye className="h-4 w-4" />
        Viewing Client Portal
      </div>
      <button
        className="rounded-lg border border-violet-300 bg-white px-3 py-1.5 text-sm font-medium text-violet-800 transition-colors hover:bg-violet-100"
        onClick={() => navigate(`/admin/projects/${params.id}`)}
        type="button"
      >
        Return to Admin
      </button>
    </div>
  );
}
