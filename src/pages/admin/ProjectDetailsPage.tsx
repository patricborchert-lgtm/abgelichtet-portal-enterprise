import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { deleteProjectFile, getProjectFileDownloadUrl, listProjectFiles, uploadProjectFile } from "@/api/files";
import { logActivity } from "@/api/activity";
import { getProjectDetails, listClientOptions, updateProject } from "@/api/projects";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  AlertDialog,
  AlertDialogActionButton,
  AlertDialogCancelButton,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileUploadCard } from "@/components/files/FileUploadCard";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { formatBytes, formatDate } from "@/lib/utils";
import type { ProjectFormValues, ProjectFile } from "@/types/app";

export function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id ?? "";
  const { isAdmin, user } = useAuth();
  const queryClient = useQueryClient();

  const projectQuery = useQuery({
    enabled: Boolean(projectId),
    queryFn: () => getProjectDetails(projectId),
    queryKey: ["project", projectId],
  });

  const filesQuery = useQuery({
    enabled: Boolean(projectId),
    queryFn: () => listProjectFiles(projectId),
    queryKey: ["project-files", projectId],
  });

  const clientOptionsQuery = useQuery({
    enabled: isAdmin,
    queryFn: listClientOptions,
    queryKey: ["client-options"],
  });

  const updateMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => updateProject(projectId, values),
    onSuccess: async (project) => {
      await logActivity({
        action: "project_updated",
        entityId: project.id,
        entityType: "project",
        metadata: {
          status: project.status,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      await queryClient.invalidateQueries({ queryKey: ["projects", "admin"] });
      toast.success("Projekt gespeichert.");
    },
  });

  if (projectQuery.isLoading || filesQuery.isLoading || (isAdmin && clientOptionsQuery.isLoading)) {
    return <LoadingTable />;
  }

  if (projectQuery.isError || filesQuery.isError || (isAdmin && clientOptionsQuery.isError) || !projectQuery.data) {
    return <ErrorState message="Projekt konnte nicht geladen werden." />;
  }

  const project = projectQuery.data.project;
  const files = filesQuery.data ?? [];
  const clientOptions = clientOptionsQuery.data ?? [];

  async function handleSave(values: ProjectFormValues) {
    try {
      await updateMutation.mutateAsync(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Projekt konnte nicht gespeichert werden."));
    }
  }

  async function handleUpload(file: File) {
    if (!user) {
      throw new Error("Keine aktive Session.");
    }

    const uploaded = await uploadProjectFile({
      clientId: project.client_id,
      file,
      projectId,
      userId: user.id,
    });

    await logActivity({
      action: "file_uploaded",
      entityId: uploaded.id,
      entityType: "project_file",
      metadata: {
        filename: uploaded.filename,
        project_id: projectId,
      },
    });

    await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
  }

  async function handleDelete(file: ProjectFile) {
    try {
      await deleteProjectFile(file);
      await logActivity({
        action: "file_deleted",
        entityId: file.id,
        entityType: "project_file",
        metadata: {
          filename: file.filename,
          project_id: projectId,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
      toast.success("Datei geloescht.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Datei konnte nicht geloescht werden."));
    }
  }

  async function handleDownload(file: ProjectFile) {
    try {
      const url = await getProjectFileDownloadUrl(file);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(getErrorMessage(error, "Download konnte nicht gestartet werden."));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader description="Projektinformationen, Status und Dateien verwalten." title={project.title} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {isAdmin ? (
          <ProjectForm
            clientOptions={clientOptions}
            defaultValues={{
              clientId: project.client_id,
              description: project.description ?? "",
              status: project.status,
              title: project.title,
            }}
            isSubmitting={updateMutation.isPending}
            onSubmit={handleSave}
            submitLabel="Projekt speichern"
          />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Projektinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border p-4">
                <span className="text-sm font-medium">Status</span>
                <StatusBadge status={project.status} />
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Client: {project.clients?.name}</p>
                <p>Erstellt: {formatDate(project.created_at)}</p>
                <p>{project.description || "Keine Beschreibung hinterlegt."}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Projekt Snapshot</CardTitle>
            <CardDescription>Wichtige Eckdaten fuer schnelle Einordnung.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border p-4">
              <span className="text-sm font-medium">Status</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Client: {project.clients?.name ?? "Unbekannt"}</p>
              <p>E-Mail: {project.clients?.email ?? "—"}</p>
              <p>Erstellt: {formatDate(project.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? <FileUploadCard onUpload={handleUpload} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Dateien</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <EmptyState description="Zu diesem Projekt wurden noch keine Dateien hochgeladen." title="Keine Dateien" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dateiname</TableHead>
                  <TableHead>Typ</TableHead>
                  <TableHead>Groesse</TableHead>
                  <TableHead>Erstellt</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.filename}</TableCell>
                    <TableCell>{file.mime_type ?? "unbekannt"}</TableCell>
                    <TableCell>{formatBytes(file.size)}</TableCell>
                    <TableCell>{formatDate(file.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => void handleDownload(file)} size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        {isAdmin ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="h-4 w-4" />
                                Loeschen
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Datei loeschen</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Die Datei wird aus Storage und Metadaten-Tabelle entfernt.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancelButton>Abbrechen</AlertDialogCancelButton>
                                <AlertDialogActionButton onClick={() => void handleDelete(file)}>
                                  Loeschen
                                </AlertDialogActionButton>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
