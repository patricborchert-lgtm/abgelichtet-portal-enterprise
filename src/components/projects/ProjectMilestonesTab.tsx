import { useState } from "react";
import { CheckCircle2, CircleDot, Clock3, Plus } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Milestone, MilestoneStatus } from "@/types/app";

interface ProjectMilestonesTabProps {
  isAdmin: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  milestones: Milestone[];
  onCreate: (values: { description: string; sortOrder: number; title: string }) => Promise<void>;
  onStatusChange: (milestone: Milestone, status: MilestoneStatus) => Promise<void>;
}

function getMilestoneLabel(status: MilestoneStatus): string {
  switch (status) {
    case "completed":
      return "Abgeschlossen";
    case "in_progress":
      return "In Arbeit";
    case "pending":
    default:
      return "Geplant";
  }
}

function getMilestoneBadgeVariant(status: MilestoneStatus): "default" | "secondary" | "success" {
  switch (status) {
    case "completed":
      return "success";
    case "in_progress":
      return "secondary";
    case "pending":
    default:
      return "default";
  }
}

function getMilestoneIcon(status: MilestoneStatus) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
    case "in_progress":
      return <Clock3 className="h-4 w-4 text-amber-600" />;
    case "pending":
    default:
      return <CircleDot className="h-4 w-4 text-[#8F87F1]" />;
  }
}

function getMilestoneDotClass(status: MilestoneStatus): string {
  switch (status) {
    case "completed":
      return "bg-emerald-500";
    case "in_progress":
      return "bg-violet-500";
    case "pending":
    default:
      return "bg-slate-400";
  }
}

export function ProjectMilestonesTab({
  isAdmin,
  isCreating,
  isUpdating,
  milestones,
  onCreate,
  onStatusChange,
}: ProjectMilestonesTabProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleCreate() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    await onCreate({
      description: description.trim(),
      sortOrder: milestones.length,
      title: trimmedTitle,
    });

    setTitle("");
    setDescription("");
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
      {isAdmin ? (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-slate-950">Meilenstein anlegen</CardTitle>
            <CardDescription>Lege die nächsten Etappen für dieses Projekt fest und halte sie für den Kunden transparent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="milestone-title">Titel</Label>
              <Input id="milestone-title" onChange={(event) => setTitle(event.target.value)} placeholder="z. B. Design-Entwurf" value={title} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestone-description">Beschreibung</Label>
              <Textarea
                id="milestone-description"
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Kurzer Kontext oder Ziel dieses Meilensteins"
                value={description}
              />
            </div>
            <Button className="w-full sm:w-auto" disabled={isCreating || title.trim().length === 0} onClick={() => void handleCreate()}>
              <Plus className="h-4 w-4" />
              Meilenstein speichern
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Meilensteine</CardTitle>
          <CardDescription>Der aktuelle Fortschritt dieses Projekts auf einen Blick.</CardDescription>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <EmptyState description="Für dieses Projekt wurden noch keine Meilensteine definiert." title="Keine Meilensteine" />
          ) : (
            <div className="relative space-y-5 before:absolute before:left-[9px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-slate-200">
              {milestones.map((milestone, index) => (
                <div key={milestone.id} className="relative pl-8">
                  <span className={`absolute left-[2px] top-2 h-4 w-4 rounded-full border-2 border-white shadow-sm ${getMilestoneDotClass(milestone.status)}`} />
                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_18px_rgba(15,23,42,0.04)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {getMilestoneIcon(milestone.status)}
                          <span className="text-sm font-medium text-slate-400">Schritt {index + 1}</span>
                          <Badge variant={getMilestoneBadgeVariant(milestone.status)}>{getMilestoneLabel(milestone.status)}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-950">{milestone.title}</h3>
                        <p className="text-sm leading-6 text-slate-600">{milestone.description || "Keine zusätzliche Beschreibung hinterlegt."}</p>
                      </div>
                      {isAdmin ? (
                        <div className="w-full lg:w-56">
                          <Label className="mb-2 block">Status</Label>
                          <Select
                            disabled={isUpdating}
                            onValueChange={(value) => void onStatusChange(milestone, value as MilestoneStatus)}
                            value={milestone.status}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Status wählen" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Geplant</SelectItem>
                              <SelectItem value="in_progress">In Arbeit</SelectItem>
                              <SelectItem value="completed">Abgeschlossen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ) : null}
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
