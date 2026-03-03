import type { FallbackProps } from "react-error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AppErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Unerwarteter Fehler</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={resetErrorBoundary}>Erneut laden</Button>
        </CardContent>
      </Card>
    </div>
  );
}
