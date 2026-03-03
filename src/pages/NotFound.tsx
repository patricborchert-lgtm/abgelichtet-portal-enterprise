import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(143,135,241,0.18),transparent_28%),linear-gradient(180deg,#f7f5ff_0%,#f8fafc_58%,#eef2ff_100%)] p-6">
      <Card
        className="w-full max-w-lg overflow-hidden border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(246,244,255,0.96)_100%)] shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
        style={{ borderRadius: 24 }}
      >
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
        />
        <CardHeader className="space-y-3 pb-3">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">404</p>
          <CardTitle className="text-3xl text-slate-950">Seite nicht gefunden</CardTitle>
          <CardDescription className="leading-6 text-slate-500">
            Diese Route existiert nicht oder wurde verschoben.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="bg-[#8F87F1] text-white hover:bg-[#7c74e2]">
            <Link to="/">Zur Startseite</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
