import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label = "Lade Daten..." }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-muted-foreground", className)}>
      <LoaderCircle className="h-4 w-4 animate-spin" />
      <span>{label}</span>
    </div>
  );
}
