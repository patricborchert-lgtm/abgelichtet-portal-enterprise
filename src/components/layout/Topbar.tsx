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
      toast.success("Du wurdest ausgeloggt.");
      navigate("/login");
    } catch (error) {
      toast.error(getErrorMessage(error, "Abmelden fehlgeschlagen."));
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(246,244,255,0.96)_100%)] px-6 py-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">abgelichtet.ch</p>
        <p className="text-lg font-semibold text-slate-950">
          {profile?.role === "admin" ? "Admin-Bereich" : "Kundenbereich"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <UserCircle2 className="h-4 w-4 text-[#6E65D8]" />
          <span className="font-medium text-slate-800">{user?.email}</span>
        </div>
        <Button className="border-slate-200 bg-white hover:bg-slate-50" onClick={() => void handleLogout()} variant="outline">
          <LogOut className="h-4 w-4" />
          Ausloggen
        </Button>
      </div>
    </div>
  );
}
