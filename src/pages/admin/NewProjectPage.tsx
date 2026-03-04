import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { logActivity } from "@/api/activity";
import { sendProjectEmail } from "@/api/emails";
import { createProject, listClientOptions } from "@/api/projects";
import { createProjectMilestoneTemplate } from "@/api/project-workspace";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getErrorMessage } from "@/lib/errors";
import type { ActivityPayload, ProjectFormValues } from "@/types/app";

export function NewProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  const clientsQuery = useQuery({
    queryKey: ["client-options"],
    queryFn: listClientOptions,
  });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", "admin"],
      });
    },
  });

  if (clientsQuery.isLoading) {
    return <LoadingTable />;
  }

  if (clientsQuery.isError) {
    return (
      <ErrorState
        message="Kundenliste konnte nicht geladen werden."
        onRetry={() => void clientsQuery.refetch()}
      />
    );
  }

  async function handleSubmit(values: ProjectFormValues) {
    try {
      const project = await mutation.mutateAsync(values);

      logActivitySafely({
        action: "project_created",
        entityId: project.id,
        entityType: "project",
        metadata: {
          client_id: project.client_id,
          status: project.status,
        },
      });
      sendProjectEmailSafely(project.id, "project_created");

      if (values.templateKey) {
        try {
          const milestones = await createProjectMilestoneTemplate(project.id, values.templateKey);
          logActivitySafely({
            action: "milestone_template_created",
            entityId: project.id,
            entityType: "project",
            metadata: {
              milestone_count: milestones.length,
              template_key: values.templateKey,
            },
          });
        } catch (error) {
          toast.warning(getErrorMessage(error, "Das Projekt wurde erstellt, aber die Standard-Meilensteine konnten nicht angelegt werden."));
        }
      }

      toast.success("Projekt erstellt.");
      navigate(`/admin/projects/${project.id}`);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Projekt konnte nicht erstellt werden.")
      );
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        description="Lege ein neues Projekt mit Kundenzuordnung in einer klaren, strukturierten Oberfläche an."
        title="Neues Projekt"
      />
      <ProjectForm
        clientOptions={clientsQuery.data}
        isSubmitting={mutation.isPending}
        onSubmit={handleSubmit}
        showTemplateSelector
        submitLabel="Projekt erstellen"
      />
    </div>
  );
}
