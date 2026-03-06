import { useState } from "react";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDate } from "@/lib/utils";
import type { TimelineEvent } from "@/types/app";

interface ProjectTimelineTabProps {
  events: TimelineEvent[];
  isSubmitting: boolean;
  onSubmit: (message: string) => Promise<void>;
}

function getEventVariant(eventType: TimelineEvent["event_type"]): "default" | "secondary" | "success" | "outline" {
  switch (eventType) {
    case "approval_requested":
      return "secondary";
    case "approved":
      return "success";
    case "changes_requested":
      return "outline";
    case "milestone":
      return "default";
    default:
      return "default";
  }
}

function getEventLabel(eventType: TimelineEvent["event_type"]): string {
  switch (eventType) {
    case "approval_requested":
      return "Abnahme angefragt";
    case "approved":
      return "Abgenommen";
    case "changes_requested":
      return "Änderungen angefordert";
    case "milestone":
      return "Meilenstein";
    case "update":
      return "Update";
    case "comment":
    default:
      return "Kommentar";
  }
}

function getEventDotClass(eventType: TimelineEvent["event_type"]): string {
  switch (eventType) {
    case "approved":
      return "bg-emerald-500";
    case "approval_requested":
      return "bg-violet-500";
    case "changes_requested":
      return "bg-rose-500";
    case "milestone":
      return "bg-amber-500";
    case "update":
      return "bg-slate-500";
    case "comment":
    default:
      return "bg-slate-400";
  }
}

export function ProjectTimelineTab({ events, isSubmitting, onSubmit }: ProjectTimelineTabProps) {
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    await onSubmit(trimmedMessage);
    setMessage("");
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Neues Update</CardTitle>
          <CardDescription>Teile wichtige Projektstände, Feedback oder kurze Rückfragen direkt in der Timeline.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeline-message">Dein Update</Label>
            <Textarea
              id="timeline-message"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Was gibt es Neues in diesem Projekt?"
              value={message}
            />
          </div>
          <Button className="w-full sm:w-auto" disabled={isSubmitting || message.trim().length === 0} onClick={() => void handleSubmit()}>
            <MessageSquarePlus className="h-4 w-4" />
            Update posten
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Timeline</CardTitle>
          <CardDescription>Alle wichtigen Schritte und Rückmeldungen rund um dieses Projekt.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState description="Für dieses Projekt gibt es noch keine Timeline-Einträge." title="Noch keine Einträge" />
          ) : (
            <div className="relative space-y-5 before:absolute before:left-[7px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
              {events.map((event) => (
                <div key={event.id} className="relative pl-7">
                  <span
                    className={cn(
                      "absolute left-0 top-2 z-10 h-4 w-4 rounded-full border-2 border-white shadow-sm",
                      getEventDotClass(event.event_type),
                    )}
                  />
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={getEventVariant(event.event_type)}>{getEventLabel(event.event_type)}</Badge>
                          <span className="text-sm font-medium text-slate-900">{event.author_label}</span>
                        </div>
                        <p className="text-sm leading-6 text-slate-600">{event.message}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Sparkles className="h-4 w-4" />
                        <span>{formatDate(event.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
