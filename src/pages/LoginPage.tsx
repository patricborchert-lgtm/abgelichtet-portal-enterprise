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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.18),_transparent_30%),linear-gradient(180deg,_#e2e8f0_0%,_#f8fafc_60%)] p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Login</CardTitle>
          <CardDescription>Sicherer Zugang fuer Admins und Clients.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <Input
                autoComplete="email"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Passwort</Label>
              <Input
                autoComplete="current-password"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </div>
            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? "Login laeuft..." : "Einloggen"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
