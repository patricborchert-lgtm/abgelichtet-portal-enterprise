import { Download, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
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
import { LEGACY_PROJECT_FILE_GROUP, PROJECT_FILE_FOLDERS } from "@/lib/constants";
import { getProjectFileGroup } from "@/lib/storage";
import { formatBytes, formatDate } from "@/lib/utils";
import type { Client, ProjectFile, ProjectFileFolderKey, ProjectFormValues } from "@/types/app";
import type { ProjectWithClient } from "@/api/projects";

interface ProjectOverviewTabProps {
  clientOptions: Client[];
  files: ProjectFile[];
  isAdmin: boolean;
  isSaving: boolean;
  onDeleteFile: (file: ProjectFile) => Promise<void>;
  onDownloadFile: (file: ProjectFile) => Promise<void>;
  onSave: (values: ProjectFormValues) => Promise<void>;
  onUploadFile: (file: File, folder: ProjectFileFolderKey) => Promise<void>;
  project: ProjectWithClient;
}

export function ProjectOverviewTab({
  clientOptions,
  files,
  isAdmin,
  isSaving,
  onDeleteFile,
  onDownloadFile,
  onSave,
  onUploadFile,
  project,
}: ProjectOverviewTabProps) {
  const fileGroups = [...PROJECT_FILE_FOLDERS, LEGACY_PROJECT_FILE_GROUP]
    .map((group) => ({
      files: files.filter((file) => getProjectFileGroup(file.storage_path) === group.value),
      label: group.label,
      value: group.value,
    }))
    .filter((group) => group.files.length > 0);

  return (
    <div className="space-y-6">
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
            isSubmitting={isSaving}
            onSubmit={onSave}
            submitLabel="Projekt speichern"
          />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-2xl text-slate-950">Projektinformationen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
                <span className="text-sm font-medium text-slate-600">Status</span>
                <StatusBadge status={project.status} />
              </div>
              <div className="space-y-2 text-sm leading-6 text-slate-600">
                <p>Kunde: {project.clients?.name}</p>
                <p>Erstellt: {formatDate(project.created_at)}</p>
                <p>{project.description || "Keine Beschreibung hinterlegt."}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-2xl text-slate-950">Projekt Snapshot</CardTitle>
            <CardDescription>Wichtige Eckdaten für eine schnelle Einordnung.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <StatusBadge status={project.status} />
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.05)_0%,rgba(255,255,255,1)_45%)] p-4 text-sm text-slate-600">
              <p>Kunde: {project.clients?.name ?? "Unbekannt"}</p>
              <p>E-Mail: {project.clients?.email ?? "—"}</p>
              <p>Erstellt: {formatDate(project.created_at)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {isAdmin ? <FileUploadCard onUpload={onUploadFile} /> : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-slate-950">Dateien</CardTitle>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <EmptyState description="Zu diesem Projekt wurden noch keine Dateien hochgeladen." title="Keine Dateien" />
          ) : (
            <div className="space-y-6">
              {fileGroups.map((group) => (
                <div key={group.value} className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.04)_0%,rgba(255,255,255,1)_55%)] px-4 py-3">
                    <div>
                      <h3 className="text-base font-semibold text-slate-950">{group.label}</h3>
                      <p className="text-sm text-slate-500">{group.files.length} Datei{group.files.length === 1 ? "" : "en"}</p>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Dateiname</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Größe</TableHead>
                        <TableHead>Erstellt</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.files.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">{file.filename}</TableCell>
                          <TableCell>{file.mime_type ?? "unbekannt"}</TableCell>
                          <TableCell>{formatBytes(file.size)}</TableCell>
                          <TableCell>{formatDate(file.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button onClick={() => void onDownloadFile(file)} size="sm" variant="outline">
                                <Download className="h-4 w-4" />
                                Download
                              </Button>
                              {isAdmin ? (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive">
                                      <Trash2 className="h-4 w-4" />
                                      Löschen
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Datei löschen</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Die Datei wird aus Storage und Metadaten-Tabelle entfernt.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancelButton>Abbrechen</AlertDialogCancelButton>
                                      <AlertDialogActionButton onClick={() => void onDeleteFile(file)}>
                                        Löschen
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
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
