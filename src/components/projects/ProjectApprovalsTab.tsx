import { useMemo, useState } from "react";
import { CheckCheck, ClipboardCheck, MessageCircleWarning } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { APPROVAL_STEP_OPTIONS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
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

function getApprovalLabel(status: Approval["status"]): string {
  switch (status) {
    case "approved":
      return "Abgenommen";
    case "changes_requested":
      return "Änderungen angefordert";
    case "pending":
    default:
      return "Ausstehend";
  }
}

function getApprovalVariant(status: Approval["status"]): "secondary" | "success" | "outline" {
  switch (status) {
    case "approved":
      return "success";
    case "changes_requested":
      return "outline";
    case "pending":
    default:
      return "secondary";
  }
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
  const [requestMessage, setRequestMessage] = useState("");
  const [requestStep, setRequestStep] = useState<ApprovalStepKey>("design_proposal");
  const [responseComment, setResponseComment] = useState("");

  const pendingApproval = useMemo(() => approvals.find((approval) => approval.status === "pending") ?? null, [approvals]);
  const latestApproval = approvals[0] ?? null;
  const selectedStep = APPROVAL_STEP_OPTIONS.find((option) => option.value === requestStep) ?? APPROVAL_STEP_OPTIONS[0];
  const canRequestApproval = isAdmin && !pendingApproval;

  async function handleRequestApproval() {
    await onRequestApproval({
      message: requestMessage.trim(),
      stepKey: selectedStep.value,
      stepLabel: selectedStep.label,
    });
    setRequestMessage("");
  }

  async function handleDecision(status: ApprovalDecisionValues["status"]) {
    await onDecide({
      comment: responseComment.trim(),
      status,
    });

    setResponseComment("");
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Abnahme</CardTitle>
          <CardDescription>Steuere Freigaben und Kundenfeedback direkt im Projekt.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.04)_0%,rgba(255,255,255,1)_38%)] p-4">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-[#8F87F1]" />
              <span className="text-sm font-medium text-slate-600">Aktueller Stand</span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant={latestApproval ? getApprovalVariant(latestApproval.status) : "outline"}>
                {latestApproval ? getApprovalLabel(latestApproval.status) : "Noch keine Abnahme"}
              </Badge>
              {latestApproval ? (
                <Badge variant="outline">
                  {latestApproval.step_label ?? "Finale Projektabnahme"} · Runde {latestApproval.step_round}
                </Badge>
              ) : null}
              {latestApproval ? <span className="text-sm text-slate-500">{formatDate(latestApproval.created_at)}</span> : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {latestApproval?.request_message ||
                latestApproval?.response_comment ||
                "Sobald dieses Projekt bereit ist, kannst du hier eine Abnahme anfragen oder beantworten."}
            </p>
          </div>

          {isAdmin ? (
            <div id="project-approval-request" className="scroll-mt-24 space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Abnahme anfragen</h3>
                <p className="text-sm text-slate-500">
                  Wähle den passenden Step und sende die Anfrage direkt an den Kunden.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval-step">Abnahme-Step</Label>
                <Select onValueChange={(value) => setRequestStep(value as ApprovalStepKey)} value={requestStep}>
                  <SelectTrigger id="approval-step">
                    <SelectValue placeholder="Step auswählen" />
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
                <Label htmlFor="approval-request-message">Nachricht an den Kunden</Label>
                <Textarea
                  id="approval-request-message"
                  onChange={(event) => setRequestMessage(event.target.value)}
                  placeholder="Optionaler Hinweis für die Freigabe"
                  value={requestMessage}
                />
              </div>
              <Button disabled={!canRequestApproval || isRequesting} onClick={() => void handleRequestApproval()}>
                Abnahme anfordern
              </Button>
              {!canRequestApproval ? (
                <p className="text-xs text-slate-500">
                  {pendingApproval
                    ? "Es gibt bereits eine offene Abnahmeanfrage."
                    : "Die Anfrage ist aktuell nicht möglich."}
                </p>
              ) : null}
            </div>
          ) : null}

          {isClient && pendingApproval ? (
            <div id="project-approval-decision" className="scroll-mt-24 space-y-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Deine Rückmeldung</h3>
                <p className="text-sm text-slate-500">
                  Du kannst dieses Projekt abnehmen oder Änderungen anfordern. Für Änderungswünsche ist ein Kommentar Pflicht.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval-response-comment">Kommentar</Label>
                <Textarea
                  id="approval-response-comment"
                  onChange={(event) => setResponseComment(event.target.value)}
                  placeholder="Dein Feedback zur Abnahme"
                  value={responseComment}
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="sm:flex-1" disabled={isDeciding} onClick={() => void handleDecision("approved")}>
                  <CheckCheck className="h-4 w-4" />
                  Abnehmen
                </Button>
                <Button
                  className="sm:flex-1"
                  disabled={isDeciding || responseComment.trim().length === 0}
                  onClick={() => void handleDecision("changes_requested")}
                  variant="outline"
                >
                  <MessageCircleWarning className="h-4 w-4" />
                  Änderungen anfordern
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-slate-950">Verlauf</CardTitle>
          <CardDescription>Alle bisherigen Abnahmeanfragen und Entscheidungen in chronologischer Reihenfolge.</CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <EmptyState description="Für dieses Projekt wurde noch keine Abnahme angefragt." title="Noch kein Verlauf" />
          ) : (
            <div className="space-y-4">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.04)_0%,rgba(255,255,255,1)_38%)] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={getApprovalVariant(approval.status)}>{getApprovalLabel(approval.status)}</Badge>
                      <Badge variant="outline">
                        {approval.step_label ?? "Finale Projektabnahme"} · Runde {approval.step_round}
                      </Badge>
                      <span className="text-sm text-slate-500">Angefragt am {formatDate(approval.created_at)}</span>
                    </div>
                    {approval.decided_at ? <span className="text-sm text-slate-500">Entschieden am {formatDate(approval.decided_at)}</span> : null}
                  </div>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                    {approval.request_message ? <p><span className="font-medium text-slate-900">Anfrage:</span> {approval.request_message}</p> : null}
                    {approval.response_comment ? <p><span className="font-medium text-slate-900">Antwort:</span> {approval.response_comment}</p> : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
