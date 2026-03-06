import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { FileRequestItem } from "@/components/files/FileRequestItem";
import { PremiumButton } from "@/components/ui/PremiumButton";
import type { ProjectFolderDefinition } from "@/lib/projectFileStructure";
import type { FileRequestStatus, ProjectFileRequest } from "@/components/files/fileRequestTypes";

interface FileRequestListProps {
  folders: ProjectFolderDefinition[];
  isAdmin: boolean;
  isClient: boolean;
  onCreateRequest: (payload: { description: string; folderId: string; title: string }) => void;
  onStatusChange: (requestId: string, status: FileRequestStatus) => void;
  onUploadForRequest: (requestId: string, file: File) => Promise<void>;
  requests: ProjectFileRequest[];
}

export function FileRequestList({
  folders,
  isAdmin,
  isClient,
  onCreateRequest,
  onStatusChange,
  onUploadForRequest,
  requests,
}: FileRequestListProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState(folders[0]?.id ?? "");

  const receivedCount = useMemo(
    () => requests.filter((request) => request.status === "uploaded" || request.status === "approved").length,
    [requests],
  );

  function handleCreateRequest() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || !folderId) {
      return;
    }

    onCreateRequest({
      description: description.trim(),
      folderId,
      title: trimmedTitle,
    });

    setTitle("");
    setDescription("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Benötigte Dateien</p>
          <p className="mt-1 text-sm text-slate-600">{receivedCount} / {requests.length} Dateien erhalten</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
          <FileText className="h-3.5 w-3.5" />
          Upload Requests
        </span>
      </div>

      {isAdmin ? (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm font-semibold text-slate-900">Dateianfrage erstellen</p>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="premium-input"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="z. B. Logo"
              value={title}
            />
            <select className="premium-input" onChange={(event) => setFolderId(event.target.value)} value={folderId}>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>{folder.label}</option>
              ))}
            </select>
          </div>
          <textarea
            className="premium-input min-h-20"
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Kurze Beschreibung für den Kunden"
            value={description}
          />
          <PremiumButton onClick={handleCreateRequest} type="button">Anfrage hinzufügen</PremiumButton>
        </div>
      ) : null}

      {requests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center text-sm text-slate-500">
          Aktuell sind keine Dateianfragen hinterlegt.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const folder = folders.find((entry) => entry.id === request.folderId) ?? folders[0];

            return (
              <FileRequestItem
                folderLabel={folder?.label ?? "Unbekannt"}
                isAdmin={isAdmin}
                isClient={isClient}
                key={request.id}
                onStatusChange={(status) => onStatusChange(request.id, status)}
                onUpload={(file) => onUploadForRequest(request.id, file)}
                request={request}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
