import { useState } from "react";
import { ApprovalDialog } from "@/components/approvals/ApprovalDialog";
import { ApprovalItem } from "@/components/approvals/ApprovalItem";
import { EmptyState } from "@/components/common/EmptyState";
import type { Approval } from "@/types/app";

interface ApprovalListProps {
  approvals: Approval[];
  canRespond: boolean;
  isSubmitting: boolean;
  onApprove: (approval: Approval) => Promise<void>;
  onRequestChanges: (approval: Approval, message: string) => Promise<void>;
}

export function ApprovalList({ approvals, canRespond, isSubmitting, onApprove, onRequestChanges }: ApprovalListProps) {
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null);

  async function handleSubmitChanges(message: string) {
    if (!selectedApproval) {
      return;
    }

    await onRequestChanges(selectedApproval, message);
    setSelectedApproval(null);
  }

  if (approvals.length === 0) {
    return <EmptyState description="Für dieses Projekt existieren noch keine Freigaben." title="Keine Freigaben" />;
  }

  return (
    <>
      <div className="space-y-3">
        {approvals.map((approval) => (
          <ApprovalItem
            approval={approval}
            canRespond={canRespond}
            isSubmitting={isSubmitting}
            key={approval.id}
            onApprove={onApprove}
            onRequestChanges={setSelectedApproval}
          />
        ))}
      </div>

      <ApprovalDialog
        description={selectedApproval ? `Beschreibe die gewünschten Änderungen für „${selectedApproval.step_label ?? "Deliverable"}“.` : undefined}
        isSubmitting={isSubmitting}
        onOpenChange={(open) => !open && setSelectedApproval(null)}
        onSubmit={handleSubmitChanges}
        open={Boolean(selectedApproval)}
        submitLabel="Änderungen senden"
        title="Request Changes"
      />
    </>
  );
}
