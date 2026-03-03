import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createProject, listClientOptions } from "@/api/projects";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getErrorMessage } from "@/lib/errors";
import type { ProjectFormValues } from "@/types/app";

export function NewProjectPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const clientsQuery = useQuery({
    queryKey: ["client-options"],
    queryFn: listClientOptions,
  });

  const mutation = useMutation({
    mutationFn: createProject,
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({
        queryKey: ["projects", "admin"],
      });

      toast.success("Projekt erstellt.");
      navigate(`/admin/projects/${project.id}`);
    },
  });

  if (clientsQuery.isLoading) {
    return <LoadingTable />;
  }

  if (clientsQuery.isError) {
    return (
      <ErrorState
        message="Client-Liste konnte nicht geladen werden."
        onRetry={() => void clientsQuery.refetch()}
      />
    );
  }

  async function handleSubmit(values: ProjectFormValues) {
    try {
      await mutation.mutateAsync(values);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Projekt konnte nicht erstellt werden.")
      );
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        description="Ein neues Projekt mit Client-Zuordnung anlegen."
        title="Neues Projekt"
      />
      <ProjectForm
        clientOptions={clientsQuery.data}
        isSubmitting={mutation.isPending}
        onSubmit={handleSubmit}
        submitLabel="Projekt erstellen"
      />
    </div>
  );
}