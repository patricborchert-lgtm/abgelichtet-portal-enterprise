import { useState } from "react";
import { MessageSquarePlus, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
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
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
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

      <Card className="border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Timeline</CardTitle>
          <CardDescription>Alle wichtigen Schritte und Rückmeldungen rund um dieses Projekt.</CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <EmptyState description="Für dieses Projekt gibt es noch keine Timeline-Einträge." title="Noch keine Einträge" />
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.04)_0%,rgba(255,255,255,1)_38%)] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                >
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
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
