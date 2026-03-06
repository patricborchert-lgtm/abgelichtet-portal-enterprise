import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/common/EmptyState";
import { FileBrowser } from "@/components/files/FileBrowser";
import { FileRequestList } from "@/components/files/FileRequestList";
import type { FileRequestStatus, ProjectFileRequest } from "@/components/files/fileRequestTypes";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { getDefaultFileRequests, getProjectFoldersForService } from "@/lib/projectFileStructure";
import { formatDate } from "@/lib/utils";
import type { ProjectWithClient } from "@/api/projects";
import type { Client, ProjectFile, ProjectFileFolderKey, ProjectFormValues } from "@/types/app";

interface ProjectOverviewTabProps {
  clientOptions: Client[];
  files: ProjectFile[];
  isAdmin: boolean;
  isSaving: boolean;
  onDeleteFile: (file: ProjectFile) => Promise<void>;
  onDownloadFile: (file: ProjectFile) => Promise<void>;
  onSave: (values: ProjectFormValues) => Promise<void>;
  onUploadFile: (file: File, folder: ProjectFileFolderKey, subfolder?: string) => Promise<void>;
  project: ProjectWithClient;
}

function createRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
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
  const isClient = !isAdmin;
  const folders = useMemo(() => getProjectFoldersForService(project.service_type), [project.service_type]);
  const requestsStorageKey = `project-file-requests:${project.id}`;
  const [fileRequests, setFileRequests] = useState<ProjectFileRequest[]>([]);
  const [hasInitializedRequests, setHasInitializedRequests] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(requestsStorageKey);

    if (raw) {
      try {
        const parsed = JSON.parse(raw) as ProjectFileRequest[];
        setFileRequests(parsed);
        setHasInitializedRequests(true);
        return;
      } catch {
        window.localStorage.removeItem(requestsStorageKey);
      }
    }

    const defaults = getDefaultFileRequests(project.service_type).map((entry) => ({
      createdAt: new Date().toISOString(),
      description: entry.description,
      folderId: entry.folderId,
      id: createRequestId(),
      status: "pending" as const,
      title: entry.title,
      uploadedAt: null,
    }));

    setFileRequests(defaults);
    setHasInitializedRequests(true);
  }, [project.service_type, requestsStorageKey]);

  useEffect(() => {
    if (!hasInitializedRequests) {
      return;
    }

    window.localStorage.setItem(requestsStorageKey, JSON.stringify(fileRequests));
  }, [fileRequests, hasInitializedRequests, requestsStorageKey]);

  function handleCreateRequest(payload: { description: string; folderId: string; title: string }) {
    setFileRequests((current) => [
      {
        createdAt: new Date().toISOString(),
        description: payload.description,
        folderId: payload.folderId,
        id: createRequestId(),
        status: "pending",
        title: payload.title,
        uploadedAt: null,
      },
      ...current,
    ]);
  }

  function handleRequestStatusChange(requestId: string, status: FileRequestStatus) {
    setFileRequests((current) =>
      current.map((request) =>
        request.id === requestId
          ? {
              ...request,
              status,
              uploadedAt: status === "uploaded" || status === "approved" ? request.uploadedAt ?? new Date().toISOString() : request.uploadedAt,
            }
          : request,
      ),
    );
  }

  async function handleUploadForRequest(requestId: string, file: File) {
    const request = fileRequests.find((entry) => entry.id === requestId);

    if (!request) {
      return;
    }

    const folder = folders.find((entry) => entry.id === request.folderId) ?? folders[0];

    if (!folder) {
      return;
    }

    await onUploadFile(file, folder.storageFolder, folder.id);

    setFileRequests((current) =>
      current.map((entry) =>
        entry.id === requestId
          ? {
              ...entry,
              status: "uploaded",
              uploadedAt: new Date().toISOString(),
            }
          : entry,
      ),
    );
  }

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

      <Card className="overflow-hidden" id="file-upload">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-slate-950">Datei Workspace</CardTitle>
          <CardDescription>Strukturierte Projektordner für Admins und Kunden mit klaren Upload-Bereichen.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileBrowser
            files={files}
            isAdmin={isAdmin}
            onDeleteFile={onDeleteFile}
            onDownloadFile={onDownloadFile}
            onUploadFile={onUploadFile}
            project={project}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl text-slate-950">Benötigte Dateien</CardTitle>
          <CardDescription>Admins erstellen Dateianfragen, Kunden laden zielgerichtet die fehlenden Unterlagen hoch.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileRequestList
            folders={folders}
            isAdmin={isAdmin}
            isClient={isClient}
            onCreateRequest={handleCreateRequest}
            onStatusChange={handleRequestStatusChange}
            onUploadForRequest={handleUploadForRequest}
            requests={fileRequests}
          />
        </CardContent>
      </Card>

      {!isAdmin && files.length === 0 ? (
        <EmptyState description="Sobald Dateien angefordert oder hochgeladen wurden, erscheinen sie im Datei Workspace." title="Noch keine Dateien" />
      ) : null}
    </div>
  );
}
