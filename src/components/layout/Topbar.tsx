import { LogOut, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";

export function Topbar() {
  const navigate = useNavigate();
  const { profile, signOut, user } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
      toast.success("Sie wurden ausgeloggt.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Logout fehlgeschlagen."));
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-white/90 px-6 py-4 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">Enterprise Foundation</p>
        <p className="text-lg font-semibold text-slate-950">
          {profile?.role === "admin" ? "Admin Workspace" : "Client Workspace"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm">
          <UserCircle2 className="h-4 w-4 text-slate-500" />
          <span className="font-medium text-slate-800">{user?.email}</span>
        </div>
        <Button onClick={() => void handleLogout()} variant="outline">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
