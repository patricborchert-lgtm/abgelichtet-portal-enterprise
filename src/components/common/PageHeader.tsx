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
    <div className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Bereich</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">{title}</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-500">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}
