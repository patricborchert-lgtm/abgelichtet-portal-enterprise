import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  title: string;
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <Card
      className="overflow-hidden border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.05)_0%,rgba(255,255,255,1)_45%)] shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
      style={{ borderRadius: 16 }}
    >
      <CardHeader className="pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Leerstand</p>
        <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
        <CardDescription className="max-w-xl leading-6 text-slate-500">{description}</CardDescription>
      </CardHeader>
      {action ? <CardContent>{action}</CardContent> : null}
    </Card>
  );
}
