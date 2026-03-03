import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card
      className="overflow-hidden border-rose-200 bg-[linear-gradient(180deg,rgba(244,63,94,0.05)_0%,rgba(255,255,255,1)_45%)] shadow-[0_18px_45px_rgba(15,23,42,0.06)]"
      style={{ borderRadius: 16 }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-rose-700">
          <AlertTriangle className="h-5 w-5" />
          Fehler
        </CardTitle>
        <CardDescription className="leading-6 text-slate-600">{message}</CardDescription>
      </CardHeader>
      {onRetry ? (
        <CardContent>
          <Button className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50" onClick={onRetry} variant="outline">
            Erneut versuchen
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
