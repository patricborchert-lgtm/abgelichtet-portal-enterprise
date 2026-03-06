import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-lg overflow-hidden border-rose-200/70 bg-[linear-gradient(180deg,rgba(244,63,94,0.05)_0%,rgba(255,255,255,1)_45%)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-rose-700">Unerwarteter Fehler</CardTitle>
          <CardDescription className="leading-6 text-slate-600">{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={resetErrorBoundary}>
            Erneut laden
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
