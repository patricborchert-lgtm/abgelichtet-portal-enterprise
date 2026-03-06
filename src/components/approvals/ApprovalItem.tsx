import { CheckCircle2, Clock3, MessageCircleWarning } from "lucide-react";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { formatDate } from "@/lib/utils";
import type { Approval } from "@/types/app";

interface ApprovalItemProps {
  approval: Approval;
  canRespond: boolean;
  isSubmitting: boolean;
  onApprove: (approval: Approval) => Promise<void>;
  onRequestChanges: (approval: Approval) => void;
}

function getStatusLabel(status: Approval["status"]) {
  switch (status) {
    case "approved":
      return "approved";
    case "changes_requested":
      return "changes requested";
    case "pending":
    default:
      return "pending";
  }
}

function getStatusClass(status: Approval["status"]) {
  switch (status) {
    case "approved":
      return "bg-emerald-100 text-emerald-700";
    case "changes_requested":
      return "bg-amber-100 text-amber-700";
    case "pending":
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function ApprovalItem({
  approval,
  canRespond,
  isSubmitting,
  onApprove,
  onRequestChanges,
}: ApprovalItemProps) {
  const title = approval.step_label ?? "Deliverable";
  const description = approval.request_message || "Freigabe für dieses Deliverable wurde angefragt.";

  return (
    <div className="rounded-xl border border-slate-200 p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          <p className="text-sm text-slate-500">{description}</p>
          <p className="text-xs text-slate-400">Angefragt am {formatDate(approval.created_at)}</p>
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium uppercase ${getStatusClass(approval.status)}`}>
          {approval.status === "approved" ? <CheckCircle2 className="h-3.5 w-3.5" /> : approval.status === "changes_requested" ? <MessageCircleWarning className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
          {getStatusLabel(approval.status)}
        </span>
      </div>

      {approval.status === "pending" && canRespond ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <PremiumButton disabled={isSubmitting} onClick={() => void onApprove(approval)} size="sm" type="button">
            Approve
          </PremiumButton>
          <PremiumButton
            disabled={isSubmitting}
            onClick={() => onRequestChanges(approval)}
            size="sm"
            type="button"
            variant="secondary"
          >
            Request Changes
          </PremiumButton>
        </div>
      ) : null}
    </div>
  );
}
