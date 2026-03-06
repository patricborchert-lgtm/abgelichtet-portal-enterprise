import { useMemo, useState } from "react";
import { ApprovalList } from "@/components/approvals/ApprovalList";
import { Badge } from "@/components/ui/badge";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APPROVAL_STEP_OPTIONS } from "@/lib/constants";
import type { Approval, ApprovalDecisionValues, ApprovalRequestValues, ApprovalStepKey, ProjectStatus } from "@/types/app";

interface ProjectApprovalsTabProps {
  approvals: Approval[];
  isAdmin: boolean;
  isClient: boolean;
  isDeciding: boolean;
  isRequesting: boolean;
  projectStatus: ProjectStatus;
  onDecide: (values: ApprovalDecisionValues) => Promise<void>;
  onRequestApproval: (values: ApprovalRequestValues) => Promise<void>;
}

export function ProjectApprovalsTab({
  approvals,
  isAdmin,
  isClient,
  isDeciding,
  isRequesting,
  projectStatus,
  onDecide,
  onRequestApproval,
}: ProjectApprovalsTabProps) {
  const [stepKey, setStepKey] = useState<ApprovalStepKey>("design_proposal");
  const [deliverableTitle, setDeliverableTitle] = useState("");
  const [requestMessage, setRequestMessage] = useState("");

  const pendingApproval = useMemo(() => approvals.find((approval) => approval.status === "pending") ?? null, [approvals]);
  const selectedStep = APPROVAL_STEP_OPTIONS.find((option) => option.value === stepKey) ?? APPROVAL_STEP_OPTIONS[0];
  const canRequest = isAdmin && !pendingApproval && deliverableTitle.trim().length > 0;

  async function handleCreateApprovalRequest() {
    await onRequestApproval({
      message: requestMessage.trim(),
      stepKey,
      stepLabel: deliverableTitle.trim(),
    });

    setDeliverableTitle("");
    setRequestMessage("");
  }

  async function handleApprove(approval: Approval) {
    if (approval.status !== "pending") {
      return;
    }

    await onDecide({
      comment: "",
      status: "approved",
    });
  }

  async function handleRequestChanges(approval: Approval, message: string) {
    if (approval.status !== "pending") {
      return;
    }

    await onDecide({
      comment: message,
      status: "changes_requested",
    });
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
      <Card id="project-approval-request" className="scroll-mt-24">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Approvals</CardTitle>
          <CardDescription>Freigaben für Dateien und Deliverables direkt im Portal steuern.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <p className="text-sm text-slate-600">Projektstatus</p>
            <Badge variant="outline">{projectStatus}</Badge>
          </div>

          {isAdmin ? (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">Approval anfragen</p>

              <div className="space-y-2">
                <Label htmlFor="approval-deliverable-title">Deliverable</Label>
                <Input
                  id="approval-deliverable-title"
                  onChange={(event) => setDeliverableTitle(event.target.value)}
                  placeholder="z. B. Homepage Design"
                  value={deliverableTitle}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval-step-select">Step</Label>
                <Select onValueChange={(value) => setStepKey(value as ApprovalStepKey)} value={stepKey}>
                  <SelectTrigger id="approval-step-select">
                    <SelectValue placeholder="Step wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {APPROVAL_STEP_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">{selectedStep.description}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval-request-message">Beschreibung</Label>
                <Textarea
                  id="approval-request-message"
                  onChange={(event) => setRequestMessage(event.target.value)}
                  placeholder="Kurzer Kontext für den Client"
                  value={requestMessage}
                />
              </div>

              <PremiumButton
                disabled={!canRequest || isRequesting}
                onClick={() => void handleCreateApprovalRequest()}
                type="button"
              >
                {isRequesting ? "Wird angefragt..." : "Approval anfragen"}
              </PremiumButton>

              {!canRequest ? (
                <p className="text-xs text-slate-500">
                  {pendingApproval
                    ? "Es gibt bereits eine offene Anfrage."
                    : "Bitte zuerst einen Deliverable-Titel angeben."}
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
              Prüfe offene Deliverables und entscheide direkt per Approve oder Request Changes.
            </div>
          )}
        </CardContent>
      </Card>

      <Card id="project-approval-list" className="scroll-mt-24">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Approval List</CardTitle>
          <CardDescription>Alle Freigaben im Projekt mit aktuellem Status.</CardDescription>
        </CardHeader>
        <CardContent>
          <ApprovalList
            approvals={approvals}
            canRespond={isClient}
            isSubmitting={isDeciding}
            onApprove={handleApprove}
            onRequestChanges={handleRequestChanges}
          />
        </CardContent>
      </Card>
    </div>
  );
}
