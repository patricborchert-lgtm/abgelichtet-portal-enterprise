import { Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ViewClientButtonProps {
  projectId: string;
}

export function ViewClientButton({ projectId }: ViewClientButtonProps) {
  const navigate = useNavigate();

  return (
    <button
      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      onClick={() => navigate(`/client/projects/${projectId}`)}
      type="button"
    >
      <Monitor className="h-4 w-4" />
      View Client Portal
    </button>
  );
}
