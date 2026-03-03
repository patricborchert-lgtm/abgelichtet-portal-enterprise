import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  actions?: ReactNode;
  className?: string;
  description: string;
  title: string;
}

export function PageHeader({ actions, className, description, title }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between", className)}>
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
