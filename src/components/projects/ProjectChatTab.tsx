import { useState } from "react";
import { MessageCircleMore, SendHorizontal } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import type { ProjectMessage } from "@/types/app";

interface ProjectChatTabProps {
  isSubmitting: boolean;
  messages: ProjectMessage[];
  onSubmit: (message: string) => Promise<void>;
}

export function ProjectChatTab({ isSubmitting, messages, onSubmit }: ProjectChatTabProps) {
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
          <CardTitle className="text-2xl text-slate-950">Neue Nachricht</CardTitle>
          <CardDescription>Stelle Rückfragen oder gib dem Kunden ein kurzes Update direkt im Projekt-Chat.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chat-message">Nachricht</Label>
            <Textarea
              id="chat-message"
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Schreibe deine Nachricht..."
              value={message}
            />
          </div>
          <Button className="w-full sm:w-auto" disabled={isSubmitting || message.trim().length === 0} onClick={() => void handleSubmit()}>
            <SendHorizontal className="h-4 w-4" />
            Nachricht senden
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Chat</CardTitle>
          <CardDescription>Alle projektbezogenen Nachrichten zwischen Admin und Kunde an einem Ort.</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <EmptyState description="Für dieses Projekt wurden noch keine Nachrichten ausgetauscht." title="Noch keine Nachrichten" />
          ) : (
            <div className="space-y-4">
              {messages.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.04)_0%,rgba(255,255,255,1)_38%)] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageCircleMore className="h-4 w-4 text-[#8F87F1]" />
                        <span className="text-sm font-medium text-slate-900">{entry.author_label}</span>
                      </div>
                      <p className="text-sm leading-6 text-slate-600">{entry.body}</p>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(entry.created_at)}</span>
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
