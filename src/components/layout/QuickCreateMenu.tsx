import { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Flag, FolderPlus, Plus, Upload, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { listAdminProjects } from "@/api/projects";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface QuickCreateItem {
  icon: React.ComponentType<{ className?: string }>;
  id: "project" | "client" | "upload" | "milestone";
  label: string;
}

const QUICK_CREATE_ITEMS: QuickCreateItem[] = [
  { id: "project", label: "Projekt erstellen", icon: FolderPlus },
  { id: "client", label: "Kunde anlegen", icon: UserPlus },
  { id: "upload", label: "Datei hochladen", icon: Upload },
  { id: "milestone", label: "Meilenstein hinzufügen", icon: Flag },
];

export function QuickCreateMenu() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [projectAction, setProjectAction] = useState<"upload" | "milestone" | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const projectActionLabel = projectAction === "upload" ? "Datei hochladen" : "Meilenstein hinzufügen";

  const projectsQuery = useQuery({
    enabled: projectAction !== null,
    queryFn: listAdminProjects,
    queryKey: ["projects", "admin", "quick-create-menu"],
  });

  useEffect(() => {
    if (!projectAction) {
      return;
    }

    if (!selectedProjectId && projectsQuery.data?.[0]?.id) {
      setSelectedProjectId(projectsQuery.data[0].id);
    }
  }, [projectAction, projectsQuery.data, selectedProjectId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!rootRef.current) {
        return;
      }

      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    window.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleItemClick(itemId: QuickCreateItem["id"]) {
    setOpen(false);

    if (itemId === "project") {
      setIsCreateProjectModalOpen(true);
      return;
    }

    if (itemId === "client") {
      navigate("/admin/clients/new");
      return;
    }

    if (itemId === "upload") {
      setProjectAction("upload");
      return;
    }

    if (itemId === "milestone") {
      setProjectAction("milestone");
    }
  }

  function handleCloseProjectAction() {
    setProjectAction(null);
    setSelectedProjectId("");
  }

  function handleConfirmProjectAction() {
    if (!selectedProjectId || !projectAction) {
      toast.error("Bitte zuerst ein Projekt auswählen.");
      return;
    }

    if (projectAction === "upload") {
      navigate(`/admin/projects/${selectedProjectId}?tab=overview#file-upload`);
      handleCloseProjectAction();
      return;
    }

    navigate(`/admin/projects/${selectedProjectId}?tab=milestones`);
    handleCloseProjectAction();
  }

  return (
    <>
      <div className="relative" ref={rootRef}>
        <button
          aria-expanded={open}
          aria-haspopup="menu"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors duration-200 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          onClick={() => setOpen((current) => !current)}
          type="button"
        >
          <Plus className="h-4 w-4" />
          Neu
        </button>

        <div
          className={cn(
            "absolute right-0 top-12 z-50 w-56 origin-top-right rounded-xl border border-slate-200 bg-white py-2 shadow-lg transition-all duration-200",
            open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
          )}
          role="menu"
        >
          {QUICK_CREATE_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <button
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-slate-700 transition-colors duration-150 hover:bg-slate-50"
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                role="menuitem"
                type="button"
              >
                <Icon className="h-4 w-4 text-slate-500" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <CreateProjectModal
        onOpenChange={setIsCreateProjectModalOpen}
        open={isCreateProjectModalOpen}
      />

      <Dialog onOpenChange={(nextOpen) => !nextOpen && handleCloseProjectAction()} open={projectAction !== null}>
        <DialogContent className="max-w-md rounded-2xl border border-slate-200 bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900">{projectActionLabel}</DialogTitle>
            <DialogDescription>
              Wähle ein Projekt aus, um direkt zum passenden Bereich zu springen.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Projekt</p>
            <Select disabled={projectsQuery.isLoading || projectsQuery.isError} onValueChange={setSelectedProjectId} value={selectedProjectId}>
              <SelectTrigger>
                <SelectValue placeholder={projectsQuery.isLoading ? "Projekte werden geladen..." : "Projekt auswählen"} />
              </SelectTrigger>
              <SelectContent>
                {(projectsQuery.data ?? []).map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {projectsQuery.isError ? <p className="text-sm text-rose-600">Projekte konnten nicht geladen werden.</p> : null}
            {!projectsQuery.isLoading && !projectsQuery.isError && (projectsQuery.data?.length ?? 0) === 0 ? (
              <p className="text-sm text-slate-500">Keine Projekte vorhanden.</p>
            ) : null}
          </div>

          <DialogFooter>
            <PremiumButton onClick={handleCloseProjectAction} type="button" variant="secondary">
              Abbrechen
            </PremiumButton>
            <PremiumButton
              disabled={projectsQuery.isLoading || projectsQuery.isError || !selectedProjectId}
              onClick={handleConfirmProjectAction}
              type="button"
            >
              Öffnen
            </PremiumButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
