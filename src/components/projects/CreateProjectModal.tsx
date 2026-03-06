import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logActivity } from "@/api/activity";
import { sendProjectEmail } from "@/api/emails";
import { createProject, listClientOptions } from "@/api/projects";
import { createProjectMilestonesForService } from "@/api/project-workspace";
import { MilestonePreview } from "@/components/projects/MilestonePreview";
import { ServiceSelector } from "@/components/projects/ServiceSelector";
import { PremiumButton } from "@/components/ui/PremiumButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getErrorMessage } from "@/lib/errors";
import { PROJECT_TEMPLATES, getProjectTemplateById, type ProjectTemplateId } from "@/lib/projectTemplates";
import type { ActivityPayload, ProjectFormValues } from "@/types/app";

interface CreateProjectModalProps {
  defaultClientId?: string;
  onCreated?: (projectId: string) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const DEFAULT_SERVICE = PROJECT_TEMPLATES[0].id;

export function CreateProjectModal({ defaultClientId, onCreated, onOpenChange, open }: CreateProjectModalProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clientsQuery = useQuery({
    enabled: open,
    queryFn: listClientOptions,
    queryKey: ["client-options", "create-project-modal"],
  });

  const [clientId, setClientId] = useState(defaultClientId ?? "");
  const [serviceId, setServiceId] = useState<ProjectTemplateId>(DEFAULT_SERVICE);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setClientId(defaultClientId ?? "");
    setServiceId(DEFAULT_SERVICE);
    setTitle("");
    setDescription("");
  }, [defaultClientId, open]);

  const selectedService = useMemo(
    () => getProjectTemplateById(serviceId) ?? PROJECT_TEMPLATES[0],
    [serviceId],
  );

  const createMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => createProject(values),
    onSuccess: async (project, values) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["projects"] }),
        queryClient.invalidateQueries({ queryKey: ["projects", "admin"] }),
        queryClient.invalidateQueries({ queryKey: ["client", values.clientId] }),
      ]);

      logActivitySafely({
        action: "project_created",
        entityId: project.id,
        entityType: "project",
        metadata: {
          client_id: project.client_id,
          service_type: project.service_type,
          status: project.status,
        },
      });

      sendProjectEmailSafely(project.id, "project_created");
    },
  });

  function logActivitySafely(payload: ActivityPayload): void {
    void (async () => {
      try {
        await logActivity(payload);
      } catch {
        // Logging must never block business flows.
      }
    })();
  }

  function sendProjectEmailSafely(projectId: string, type: "project_created"): void {
    void (async () => {
      try {
        await sendProjectEmail({ projectId, type });
      } catch {
        // Email delivery must never block business flows.
      }
    })();
  }

  async function handleCreateProject() {
    if (!clientId) {
      toast.error("Bitte zuerst einen Kunden auswählen.");
      return;
    }

    try {
      const project = await createMutation.mutateAsync({
        clientId,
        description: description.trim(),
        serviceType: selectedService.id,
        status: "planned",
        title: title.trim() || selectedService.placeholderTitle,
      });

      try {
        const milestones = await createProjectMilestonesForService(project.id, selectedService.id);
        logActivitySafely({
          action: "milestone_template_created",
          entityId: project.id,
          entityType: "project",
          metadata: {
            milestone_count: milestones.length,
            service_type: selectedService.id,
          },
        });
      } catch (error) {
        toast.warning(getErrorMessage(error, "Das Projekt wurde erstellt, aber die Standard-Meilensteine konnten nicht angelegt werden."));
      }

      toast.success("Projekt erstellt.");
      onOpenChange(false);
      onCreated?.(project.id);
      navigate(`/admin/projects/${project.id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Projekt konnte nicht erstellt werden."));
    }
  }

  const isCreating = createMutation.isPending;
  const isClientSelectionDisabled = isCreating || clientsQuery.isLoading;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="flex max-h-[calc(100vh-2.5rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_18px_45px_rgba(15,23,42,0.10)] sm:max-h-[calc(100vh-4rem)]">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">Projekt erstellen</DialogTitle>
          <DialogDescription className="mt-1 text-sm text-slate-500">
            Erstelle ein neues Projekt als strukturierten Entwurf mit passender Service-Vorlage.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Kunde</Label>
              <Select onValueChange={setClientId} value={clientId}>
                <SelectTrigger disabled={isClientSelectionDisabled}>
                  <SelectValue placeholder={clientsQuery.isLoading ? "Kunden werden geladen..." : "Kunden wählen"} />
                </SelectTrigger>
                <SelectContent>
                  {(clientsQuery.data ?? []).map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-title">Projektname</Label>
              <Input
                disabled={isCreating}
                id="project-title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder={selectedService.placeholderTitle}
                value={title}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Service</p>
            <ServiceSelector
              disabled={isCreating}
              onSelect={setServiceId}
              selectedId={serviceId}
              services={PROJECT_TEMPLATES}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Beschreibung</Label>
            <Textarea
              disabled={isCreating}
              id="project-description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Kurzer Kontext, Ziel und Scope für dieses Projekt"
              rows={4}
              value={description}
            />
          </div>

          <MilestonePreview milestones={selectedService.defaultMilestones} />
          {clientsQuery.isError ? (
            <p className="text-sm text-rose-600">Kundenliste konnte nicht geladen werden.</p>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <PremiumButton disabled={isCreating} onClick={() => onOpenChange(false)} type="button" variant="secondary">
            Abbrechen
          </PremiumButton>
          <PremiumButton
            disabled={isCreating || clientsQuery.isLoading || clientsQuery.isError}
            onClick={() => void handleCreateProject()}
            type="button"
          >
            {isCreating ? "Wird erstellt..." : "Projekt erstellen"}
          </PremiumButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
