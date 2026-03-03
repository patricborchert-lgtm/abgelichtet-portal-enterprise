import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { establishSessionFromUrl } from "@/lib/auth-links";
import { getErrorMessage, logDevError } from "@/lib/errors";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function handleCallback() {
      try {
        await establishSessionFromUrl();
        const nextPath = searchParams.get("next") ?? "/";
        const isImpersonation = searchParams.get("impersonation") === "1";

        if (isImpersonation) {
          toast.success("Impersonation aktiv.");
        }

        navigate(nextPath, { replace: true });
      } catch (error) {
        logDevError("Auth callback failed", error);
        toast.error(getErrorMessage(error, "Authentifizierung fehlgeschlagen."));
        navigate("/login", { replace: true });
      }
    }

    void handleCallback();
  }, [navigate, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <LoadingSpinner label="Authentifizierung wird abgeschlossen..." />
    </div>
  );
}
