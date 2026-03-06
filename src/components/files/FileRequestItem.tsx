import { CheckCircle2, Clock3, ShieldCheck, XCircle } from "lucide-react";
import type { ComponentType } from "react";
import { ClientUploadDropzone } from "@/components/files/ClientUploadDropzone";
import { cn } from "@/lib/utils";
import type { FileRequestStatus, ProjectFileRequest } from "@/components/files/fileRequestTypes";

interface FileRequestItemProps {
  folderLabel: string;
  isAdmin: boolean;
  isClient: boolean;
  onStatusChange: (status: FileRequestStatus) => void;
  onUpload: (file: File) => Promise<void>;
  request: ProjectFileRequest;
}

function getStatusConfig(status: FileRequestStatus): { icon: ComponentType<{ className?: string }>; label: string; tone: string } {
  switch (status) {
    case "approved":
      return { icon: ShieldCheck, label: "approved", tone: "bg-emerald-100 text-emerald-700" };
    case "rejected":
      return { icon: XCircle, label: "rejected", tone: "bg-rose-100 text-rose-700" };
    case "uploaded":
      return { icon: CheckCircle2, label: "uploaded", tone: "bg-violet-100 text-violet-700" };
    case "pending":
    default:
      return { icon: Clock3, label: "pending", tone: "bg-slate-100 text-slate-700" };
  }
}

export function FileRequestItem({
  folderLabel,
  isAdmin,
  isClient,
  onStatusChange,
  onUpload,
  request,
}: FileRequestItemProps) {
  const status = getStatusConfig(request.status);
  const StatusIcon = status.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{request.title}</p>
          <p className="text-sm text-slate-500">{request.description || "Keine weitere Beschreibung"}</p>
          <p className="text-xs text-slate-400">Ordner: {folderLabel}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium uppercase", status.tone)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {status.label}
        </span>
      </div>

      {isClient && (request.status === "pending" || request.status === "rejected") ? (
        <div className="mt-3">
          <ClientUploadDropzone onUploadFile={onUpload} />
        </div>
      ) : null}

      {isAdmin ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            onClick={() => onStatusChange("pending")}
            type="button"
          >
            pending
          </button>
          <button
            className="rounded-md border border-violet-200 px-2.5 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-50"
            onClick={() => onStatusChange("uploaded")}
            type="button"
          >
            uploaded
          </button>
          <button
            className="rounded-md border border-emerald-200 px-2.5 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-50"
            onClick={() => onStatusChange("approved")}
            type="button"
          >
            approved
          </button>
          <button
            className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-50"
            onClick={() => onStatusChange("rejected")}
            type="button"
          >
            rejected
          </button>
        </div>
      ) : null}
    </div>
  );
}
