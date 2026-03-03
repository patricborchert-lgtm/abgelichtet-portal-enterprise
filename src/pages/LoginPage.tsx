import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, loading, session, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!loading && session) {
    return <Navigate replace to={isAdmin ? "/admin" : "/client/dashboard"} />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      await signIn(email, password);
      toast.success("Login erfolgreich.");

      const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(nextPath ?? "/");
    } catch (error) {
      toast.error(getErrorMessage(error, "Login fehlgeschlagen."));
    } finally {
      setIsSubmitting(false);
    }
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
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400">abgelichtet.ch</p>
              <h1 className="max-w-md text-4xl font-semibold tracking-tight text-slate-950">
                Dein Kundenportal für Projekte, Freigaben und Dateien.
              </h1>
              <p className="max-w-lg text-sm leading-7 text-slate-600">
                Melde dich an und arbeite in einer klaren, modernen Oberfläche mit direktem Zugriff auf deine Projekte.
              </p>
            </div>
          </div>
          <div className="rounded-2xl border border-[#8F87F1]/15 bg-white/70 p-5">
            <p className="text-sm font-medium text-slate-900">Sicherer Zugang</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Admins und Clients melden sich über denselben geschützten Zugang an.
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
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Login</p>
            <CardTitle className="text-3xl text-slate-950">Willkommen zurück</CardTitle>
            <CardDescription className="leading-6 text-slate-500">
              Sicherer Zugang für Admins und Clients.
            </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label className="text-slate-700" htmlFor="email">
                E-Mail
              </Label>
              <Input
                autoComplete="email"
                className="bg-white/80"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700" htmlFor="password">
                Passwort
              </Label>
              <Input
                autoComplete="current-password"
                className="bg-white/80"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>
            <Button className="w-full bg-[#8F87F1] text-white hover:bg-[#7c74e2]" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Login läuft..." : "Einloggen"}
            </Button>
          </form>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
