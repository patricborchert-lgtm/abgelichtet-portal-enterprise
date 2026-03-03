import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { clearImpersonationSession, readImpersonationSession } from "@/lib/storage";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logActivity } from "@/api/activity";
import { getErrorMessage, logDevError } from "@/lib/errors";
import { useAuth } from "@/hooks/useAuth";

export function ImpersonationBanner() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const impersonation = readImpersonationSession();

  if (!impersonation) {
    return null;
  }

  async function restoreAdminSession() {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: impersonation.adminAccessToken,
        refresh_token: impersonation.adminRefreshToken,
      });

      if (error) {
        throw error;
      }

      await logActivity({
        action: "impersonation_stopped",
        entityId: impersonation.clientId,
        entityType: "client",
        metadata: {
          admin_user_id: impersonation.adminUserId,
          client_name: impersonation.clientName,
        },
      });

      clearImpersonationSession();
      await refreshProfile();
      toast.success("Admin-Session wiederhergestellt.");
      navigate(impersonation.returnPath);
    } catch (error) {
      logDevError("Failed to restore admin session", error);
      toast.error(getErrorMessage(error, "Admin-Session konnte nicht wiederhergestellt werden."));
    }
  }

  return (
    <Card className="border-primary/30 bg-primary/5">
      <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 text-sm">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          <span>
            Impersonation aktiv: Sie sehen aktuell den Bereich von <strong>{impersonation.clientName}</strong>.
          </span>
        </div>
        <Button onClick={() => void restoreAdminSession()} size="sm" variant="outline">
          Zurueck zu Admin
        </Button>
      </CardContent>
    </Card>
  );
}
