import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  label?: string;
}

export function LoadingSpinner({ className, label = "Lade Daten..." }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center gap-3 text-sm text-slate-500", className)}>
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#8F87F1]/10">
        <LoaderCircle className="h-4 w-4 animate-spin text-[#6E65D8]" />
      </div>
      <span>{label}</span>
    </div>
  );
}
