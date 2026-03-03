import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Fehler
        </CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {onRetry ? (
        <CardContent>
          <Button onClick={onRetry} variant="outline">
            Erneut versuchen
          </Button>
        </CardContent>
      ) : null}
    </Card>
  );
}
