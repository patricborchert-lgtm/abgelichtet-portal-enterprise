import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { listClientOptions } from "@/api/projects";
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
import { PROJECT_TEMPLATES, getProjectTemplateById, type ProjectTemplateId } from "@/lib/projectTemplates";

export interface CreateProjectDraftPayload {
  clientId: string;
  description: string;
  milestones: string[];
  serviceId: ProjectTemplateId;
  title: string;
}

interface CreateProjectModalProps {
  defaultClientId?: string;
  onCreate?: (payload: CreateProjectDraftPayload) => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const DEFAULT_SERVICE = PROJECT_TEMPLATES[0].id;

export function CreateProjectModal({ defaultClientId, onCreate, onOpenChange, open }: CreateProjectModalProps) {
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

  function handleCreateDraft() {
    if (!clientId) {
      toast.error("Bitte zuerst einen Kunden auswählen.");
      return;
    }

    const payload: CreateProjectDraftPayload = {
      clientId,
      description: description.trim(),
      milestones: selectedService.defaultMilestones,
      serviceId: selectedService.id,
      title: title.trim() || selectedService.placeholderTitle,
    };

    onCreate?.(payload);
    onOpenChange(false);
  }

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
                <SelectTrigger disabled={clientsQuery.isLoading}>
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
                id="project-title"
                onChange={(event) => setTitle(event.target.value)}
                placeholder={selectedService.placeholderTitle}
                value={title}
              />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Service</p>
            <ServiceSelector onSelect={setServiceId} selectedId={serviceId} services={PROJECT_TEMPLATES} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project-description">Beschreibung</Label>
            <Textarea
              id="project-description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Kurzer Kontext, Ziel und Scope für dieses Projekt"
              rows={4}
              value={description}
            />
          </div>

          <MilestonePreview milestones={selectedService.defaultMilestones} />
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-6 py-4">
          <PremiumButton onClick={() => onOpenChange(false)} type="button" variant="secondary">
            Abbrechen
          </PremiumButton>
          <PremiumButton onClick={handleCreateDraft} type="button">
            Projekt erstellen
          </PremiumButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
