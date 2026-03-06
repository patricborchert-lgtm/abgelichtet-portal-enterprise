import { Inbox } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
  action?: ReactNode;
  description: string;
  title: string;
}

export function EmptyState({ action, description, title }: EmptyStateProps) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(139,92,246,0.04)_0%,rgba(255,255,255,1)_45%)]">
      <CardHeader className="pb-3">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Leerstand</p>
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500">
          <Inbox className="h-5 w-5" />
        </div>
        <CardTitle className="text-xl text-slate-950">{title}</CardTitle>
        <CardDescription className="max-w-xl leading-6 text-slate-500">{description}</CardDescription>
      </CardHeader>
      {action ? <CardContent>{action}</CardContent> : null}
    </Card>
  );
}
