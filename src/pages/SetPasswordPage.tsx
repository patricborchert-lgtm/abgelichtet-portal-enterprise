import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
        toast.error(
          getErrorMessage(
            error,
            "Invite-Link ist ungueltig oder abgelaufen."
          )
        );
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
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      await supabase.auth.signOut();
      toast.success("Passwort erfolgreich gesetzt.");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Passwort konnte nicht gesetzt werden.")
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(143,135,241,0.14),transparent_28%),linear-gradient(180deg,#f7f5ff_0%,#f8fafc_60%,#eef2ff_100%)]">
        <LoadingSpinner label="Invite wird vorbereitet..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(143,135,241,0.18),transparent_28%),linear-gradient(180deg,#f7f5ff_0%,#f8fafc_58%,#eef2ff_100%)] p-6">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="hidden rounded-[24px] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.78)_0%,rgba(246,244,255,0.92)_100%)] p-10 shadow-[0_24px_60px_rgba(15,23,42,0.10)] lg:flex lg:flex-col lg:justify-between">
          <div className="space-y-6">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8F87F1]/12 text-[#6E65D8]">
              <span className="text-2xl font-semibold">a</span>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">Aktivierung</p>
              <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-950">
                Richte dein Passwort ein und aktiviere dein Portal.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-slate-600">
                Nach dem Setzen deines Passworts kannst du dich direkt sicher in dein Kundenportal einloggen.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#8F87F1]/15 bg-white/70 p-5">
            <p className="text-sm font-medium text-slate-900">Einmaliger Schritt</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Verwende ein sicheres Passwort mit mindestens acht Zeichen.
            </p>
          </div>
        </div>

        <Card
          className="w-full border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(246,244,255,0.96)_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
          style={{ borderRadius: 24 }}
        >
          <div
            className="h-1.5 w-full"
            style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
          />
          <CardHeader className="space-y-3 pb-3">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Passwort setzen</p>
            <CardTitle className="text-3xl text-slate-950">Portal-Zugang aktivieren</CardTitle>
            <CardDescription className="leading-6 text-slate-500">
              Richte jetzt dein Passwort ein und schließe die Aktivierung ab.
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-slate-700" htmlFor="password">
                Neues Passwort
              </Label>
              <Input
                className="bg-white/80"
                id="password"
                type="password"
                value={password}
                required
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700" htmlFor="confirm-password">
                Passwort bestätigen
              </Label>
              <Input
                className="bg-white/80"
                id="confirm-password"
                type="password"
                value={confirmPassword}
                required
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-[#8F87F1] text-white hover:bg-[#7c74e2]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Speichere..." : "Passwort speichern"}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
