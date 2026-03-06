import { Download, Eye, File, FileImage, FileVideo, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { formatDate } from "@/lib/utils";
import type { ProjectFile } from "@/types/app";

type ApprovalStatus = "pending" | "approved" | "changes_requested";

interface FileApprovalStatus {
  label: string;
  status: ApprovalStatus;
}

interface FileGridProps {
  approvalStatusByFileId?: Record<string, FileApprovalStatus>;
  files: ProjectFile[];
  isAdmin: boolean;
  onDelete: (file: ProjectFile) => Promise<void>;
  onDownload: (file: ProjectFile) => Promise<void>;
  onPreview: (file: ProjectFile) => Promise<void>;
}

function resolveFileIcon(mimeType: string | null) {
  if (!mimeType) {
    return File;
  }

  if (mimeType.startsWith("image/")) {
    return FileImage;
  }

  if (mimeType.startsWith("video/")) {
    return FileVideo;
  }

  return File;
}

export function FileGrid({ approvalStatusByFileId, files, isAdmin, onDelete, onDownload, onPreview }: FileGridProps) {
  if (files.length === 0) {
    return <EmptyState description="In diesem Ordner liegen aktuell keine Dateien." title="Ordner leer" />;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {files.map((file) => {
        const Icon = resolveFileIcon(file.mime_type);
        const approvalStatus = approvalStatusByFileId?.[file.id];
        const approvalStateLabel =
          approvalStatus?.status === "approved"
            ? "Approved"
            : approvalStatus?.status === "changes_requested"
              ? "Changes requested"
              : "Waiting for approval";
        const approvalStateClass =
          approvalStatus?.status === "approved"
            ? "bg-emerald-100 text-emerald-700"
            : approvalStatus?.status === "changes_requested"
              ? "bg-amber-100 text-amber-700"
              : "bg-slate-100 text-slate-700";

        return (
          <div key={file.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900" title={file.filename}>{file.filename}</p>
                <p className="mt-1 text-xs text-slate-500">{formatDate(file.created_at)}</p>
                {approvalStatus ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${approvalStateClass}`}>
                      {approvalStateLabel}
                    </span>
                    <span className="truncate text-[11px] text-slate-500">{approvalStatus.label}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                onClick={() => void onPreview(file)}
                type="button"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
              <button
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                onClick={() => void onDownload(file)}
                type="button"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </button>
              {isAdmin ? (
                <button
                  className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  onClick={() => void onDelete(file)}
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Löschen
                </button>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
