import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logActivity } from "@/api/activity";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { establishSessionFromUrl } from "@/lib/auth-links";
import { getErrorMessage, logDevError } from "@/lib/errors";

export function SetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        await establishSessionFromUrl();
      } catch (error) {
        logDevError("Invite session bootstrap failed", error);
        toast.error(getErrorMessage(error, "Invite-Link ist ungueltig oder abgelaufen."));
      } finally {
        setIsReady(true);
      }
    }

    void bootstrap();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      toast.error("Das Passwort muss mindestens 8 Zeichen lang sein.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Die Passwoerter stimmen nicht ueberein.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error, data } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      await logActivity({
          action: "password_set",
          entityId: data.user?.id ?? null,
          entityType: "user",
          metadata: {},
       });

      await supabase.auth.signOut();
      toast.success("Passwort erfolgreich gesetzt.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getErrorMessage(error, "Passwort konnte nicht gesetzt werden."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <LoadingSpinner label="Invite wird vorbereitet..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Passwort setzen</CardTitle>
          <CardDescription>Aktivieren Sie jetzt Ihren Portal-Zugang.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">Neues Passwort</Label>
              <Input
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Passwort bestaetigen</Label>
              <Input
                id="confirm-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </div>
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Speichere..." : "Passwort speichern"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
