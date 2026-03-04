import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logActivity } from "@/api/activity";
import { sendProjectEmail } from "@/api/emails";
import { deleteProjectFile, getProjectFileDownloadUrl, listProjectFiles, uploadProjectFile } from "@/api/files";
import { createProjectMessage, listProjectMessages } from "@/api/project-messages";
import { getProjectDetails, listClientOptions, updateProject } from "@/api/projects";
import {
  createProjectMilestone,
  createProjectTimelineEvent,
  decideProjectApproval,
  listProjectApprovals,
  listProjectMilestones,
  listProjectTimeline,
  requestProjectApproval,
  updateProjectMilestone,
} from "@/api/project-workspace";
import { ErrorState } from "@/components/common/ErrorState";
import { LoadingTable } from "@/components/common/LoadingTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ProjectApprovalsTab } from "@/components/projects/ProjectApprovalsTab";
import { ProjectChatTab } from "@/components/projects/ProjectChatTab";
import { ProjectMilestonesTab } from "@/components/projects/ProjectMilestonesTab";
import { ProjectOverviewTab } from "@/components/projects/ProjectOverviewTab";
import { ProjectTabs } from "@/components/projects/ProjectTabs";
import { ProjectTimelineTab } from "@/components/projects/ProjectTimelineTab";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/utils";
import type {
  ActivityPayload,
  ApprovalDecisionValues,
  Milestone,
  MilestoneFormValues,
  MilestoneStatus,
  MessageFormValues,
  ProjectFile,
  ProjectFileFolderKey,
  ProjectFormValues,
  ProjectStatus,
  TimelineEventFormValues,
} from "@/types/app";
import { useParams } from "react-router-dom";

type ProjectDetailTab = "overview" | "timeline" | "chat" | "milestones" | "approvals";

function getProgressFromStatus(status: ProjectStatus): number {
  switch (status) {
    case "planned":
      return 20;
    case "active":
      return 55;
    case "review":
      return 80;
    case "delivered":
      return 100;
    case "archived":
      return 100;
    default:
      return 0;
  }
}

export function ProjectDetailsPage() {
  const params = useParams();
  const projectId = params.id ?? "";
  const [activeTab, setActiveTab] = useState<ProjectDetailTab>("overview");
  const { isAdmin, isClient, profile, user } = useAuth();
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

  const timelineQuery = useQuery({
    enabled: Boolean(projectId),
    queryFn: () => listProjectTimeline(projectId),
    queryKey: ["project-timeline", projectId],
  });

  const messagesQuery = useQuery({
    enabled: Boolean(projectId),
    queryFn: () => listProjectMessages(projectId),
    queryKey: ["project-messages", projectId],
  });

  const milestonesQuery = useQuery({
    enabled: Boolean(projectId),
    queryFn: () => listProjectMilestones(projectId),
    queryKey: ["project-milestones", projectId],
  });

  const approvalsQuery = useQuery({
    enabled: Boolean(projectId),
    queryFn: () => listProjectApprovals(projectId),
    queryKey: ["project-approvals", projectId],
  });

  const clientOptionsQuery = useQuery({
    enabled: isAdmin,
    queryFn: listClientOptions,
    queryKey: ["client-options"],
  });

  function logActivitySafely(payload: ActivityPayload): void {
    void (async () => {
      try {
        await logActivity(payload);
      } catch {
        // Logging must never block business flows.
      }
    })();
  }

  function sendProjectEmailSafely(
    type: "approval_requested" | "approved" | "changes_requested",
    comment?: string,
  ): void {
    void (async () => {
      try {
        await sendProjectEmail({
          comment,
          projectId,
          type,
        });
      } catch {
        // Email delivery must never block business flows.
      }
    })();
  }

  function getAuthorLabel(): string {
    if (profile?.role === "admin") {
      return "Admin";
    }

    return projectQuery.data?.project.clients?.name ?? "Kunde";
  }

  const updateMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => updateProject(projectId, values),
    onSuccess: async (project) => {
      logActivitySafely({
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

  const timelineMutation = useMutation({
    mutationFn: (values: TimelineEventFormValues) => {
      if (!user) {
        throw new Error("Keine aktive Session.");
      }

      return createProjectTimelineEvent(projectId, user.id, values);
    },
    onSuccess: async (event) => {
      logActivitySafely({
        action: "timeline_event_created",
        entityId: event.id,
        entityType: "timeline_event",
        metadata: {
          event_type: event.event_type,
          project_id: projectId,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-timeline", projectId] });
      toast.success("Update gepostet.");
    },
  });

  const createMilestoneMutation = useMutation({
    mutationFn: (values: MilestoneFormValues) => createProjectMilestone(projectId, values),
    onSuccess: async (milestone) => {
      logActivitySafely({
        action: "milestone_created",
        entityId: milestone.id,
        entityType: "milestone",
        metadata: {
          project_id: projectId,
          title: milestone.title,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-milestones", projectId] });
      toast.success("Meilenstein gespeichert.");
    },
  });

  const messageMutation = useMutation({
    mutationFn: (values: MessageFormValues) => {
      if (!user) {
        throw new Error("Keine aktive Session.");
      }

      return createProjectMessage(projectId, user.id, values);
    },
    onSuccess: async (message) => {
      logActivitySafely({
        action: "message_created",
        entityId: message.id,
        entityType: "message",
        metadata: {
          project_id: projectId,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-messages", projectId] });
      toast.success("Nachricht gesendet.");
    },
  });

  const updateMilestoneMutation = useMutation({
    mutationFn: ({ milestone, status }: { milestone: Milestone; status: MilestoneStatus }) =>
      updateProjectMilestone(milestone.id, { status }),
    onSuccess: async (milestone) => {
      logActivitySafely({
        action: "milestone_updated",
        entityId: milestone.id,
        entityType: "milestone",
        metadata: {
          project_id: projectId,
          status: milestone.status,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-milestones", projectId] });
      toast.success("Meilenstein aktualisiert.");
    },
  });

  const requestApprovalMutation = useMutation({
    mutationFn: (message: string) => {
      if (!user) {
        throw new Error("Keine aktive Session.");
      }

      return requestProjectApproval(projectId, user.id, message);
    },
    onSuccess: async (approval) => {
      logActivitySafely({
        action: "approval_requested",
        entityId: approval.id,
        entityType: "approval",
        metadata: {
          project_id: projectId,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-approvals", projectId] });
      toast.success("Abnahme angefordert.");
    },
  });

  const decideApprovalMutation = useMutation({
    mutationFn: ({ approvalId, values }: { approvalId: string; values: ApprovalDecisionValues }) =>
      decideProjectApproval(approvalId, values),
    onSuccess: async (_, variables) => {
      logActivitySafely({
        action: "approval_decided",
        entityId: variables.approvalId,
        entityType: "approval",
        metadata: {
          decision: variables.values.status,
          project_id: projectId,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-approvals", projectId] });
      toast.success(variables.values.status === "approved" ? "Projekt abgenommen." : "Änderungswunsch gespeichert.");
    },
  });

  const isLoading =
    projectQuery.isLoading ||
    filesQuery.isLoading ||
    timelineQuery.isLoading ||
    messagesQuery.isLoading ||
    milestonesQuery.isLoading ||
    approvalsQuery.isLoading ||
    (isAdmin && clientOptionsQuery.isLoading);

  if (isLoading) {
    return <LoadingTable />;
  }

  const hasError =
    projectQuery.isError ||
    filesQuery.isError ||
    timelineQuery.isError ||
    messagesQuery.isError ||
    milestonesQuery.isError ||
    approvalsQuery.isError ||
    (isAdmin && clientOptionsQuery.isError) ||
    !projectQuery.data;

  if (hasError) {
    return <ErrorState message="Projekt konnte nicht geladen werden." />;
  }

  const project = projectQuery.data.project;
  const files = filesQuery.data ?? [];
  const timelineEvents = timelineQuery.data ?? [];
  const messages = messagesQuery.data ?? [];
  const milestones = milestonesQuery.data ?? [];
  const approvals = approvalsQuery.data ?? [];
  const clientOptions = clientOptionsQuery.data ?? [];
  const progress = getProgressFromStatus(project.status);

  async function handleSave(values: ProjectFormValues) {
    try {
      await updateMutation.mutateAsync(values);
    } catch (error) {
      toast.error(getErrorMessage(error, "Projekt konnte nicht gespeichert werden."));
    }
  }

  async function handleUpload(file: File, folder: ProjectFileFolderKey) {
    if (!user) {
      throw new Error("Keine aktive Session.");
    }

    const uploaded = await uploadProjectFile({
      clientId: project.client_id,
      file,
      folder,
      projectId,
      userId: user.id,
    });

    logActivitySafely({
      action: "file_uploaded",
      entityId: uploaded.id,
        entityType: "project_file",
        metadata: {
          filename: uploaded.filename,
          folder,
          project_id: projectId,
        },
      });

    await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
  }

  async function handleDelete(file: ProjectFile) {
    try {
      await deleteProjectFile(file);
      logActivitySafely({
        action: "file_deleted",
        entityId: file.id,
        entityType: "project_file",
        metadata: {
          filename: file.filename,
          project_id: projectId,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["project-files", projectId] });
      toast.success("Datei gelöscht.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Datei konnte nicht gelöscht werden."));
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

  async function handleCreateTimeline(message: string) {
    try {
      await timelineMutation.mutateAsync({
        authorLabel: getAuthorLabel(),
        eventType: "update",
        message,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Timeline-Eintrag konnte nicht erstellt werden."));
    }
  }

  async function handleSendMessage(body: string) {
    try {
      await messageMutation.mutateAsync({
        authorLabel: getAuthorLabel(),
        body,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Nachricht konnte nicht gesendet werden."));
    }
  }

  async function appendSupportingTimelineEvent(values: TimelineEventFormValues): Promise<void> {
    if (!user) {
      return;
    }

    try {
      await createProjectTimelineEvent(projectId, user.id, values);
      await queryClient.invalidateQueries({ queryKey: ["project-timeline", projectId] });
    } catch {
      // Timeline support events must not block main actions.
    }
  }

  async function handleCreateMilestone(values: MilestoneFormValues) {
    try {
      const milestone = await createMilestoneMutation.mutateAsync(values);
      await appendSupportingTimelineEvent({
        authorLabel: getAuthorLabel(),
        eventType: "milestone",
        message: `Neuer Meilenstein erstellt: ${milestone.title}`,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Meilenstein konnte nicht erstellt werden."));
    }
  }

  async function handleMilestoneStatusChange(milestone: Milestone, status: MilestoneStatus) {
    try {
      await updateMilestoneMutation.mutateAsync({ milestone, status });
      await appendSupportingTimelineEvent({
        authorLabel: getAuthorLabel(),
        eventType: "milestone",
        message: `Meilenstein „${milestone.title}“ wurde auf „${
          status === "completed" ? "Abgeschlossen" : status === "in_progress" ? "In Arbeit" : "Geplant"
        }“ gesetzt.`,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Meilenstein konnte nicht aktualisiert werden."));
    }
  }

  async function handleRequestApproval(message: string) {
    try {
      await requestApprovalMutation.mutateAsync(message);
      sendProjectEmailSafely("approval_requested", message || undefined);
      await appendSupportingTimelineEvent({
        authorLabel: getAuthorLabel(),
        eventType: "approval_requested",
        message: message || "Abnahme für dieses Projekt wurde angefragt.",
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Abnahme konnte nicht angefordert werden."));
    }
  }

  async function handleApprovalDecision(values: ApprovalDecisionValues) {
    const pendingApproval = approvals.find((approval) => approval.status === "pending");

    if (!pendingApproval) {
      toast.error("Es gibt keine offene Abnahmeanfrage.");
      return;
    }

    try {
      await decideApprovalMutation.mutateAsync({
        approvalId: pendingApproval.id,
        values,
      });
      sendProjectEmailSafely(values.status, values.comment || undefined);
      await appendSupportingTimelineEvent({
        authorLabel: getAuthorLabel(),
        eventType: values.status,
        message:
          values.status === "approved"
            ? values.comment || "Projekt wurde abgenommen."
            : values.comment,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, "Deine Entscheidung konnte nicht gespeichert werden."));
    }
  }

  const tabs = [
    { key: "overview", label: "Übersicht" },
    { badge: timelineEvents.length, key: "timeline", label: "Timeline" },
    { badge: messages.length, key: "chat", label: "Chat" },
    { badge: milestones.length, key: "milestones", label: "Meilensteine" },
    { badge: approvals.length, key: "approvals", label: "Abnahme" },
  ] satisfies { badge?: number; key: ProjectDetailTab; label: string }[];

  return (
    <div className="space-y-8">
      <div
        className="overflow-hidden rounded-2xl border border-white/70 bg-white shadow-[0_22px_55px_rgba(15,23,42,0.08)]"
        style={{ borderRadius: 16 }}
      >
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #8F87F1 0%, rgba(143,135,241,0.18) 100%)" }}
        />
        <div className="grid gap-6 p-6 lg:grid-cols-[1.3fr_0.7fr] lg:p-8">
          <div className="space-y-5">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">Projektübersicht</p>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{project.title}</h1>
                  <p className="text-sm text-slate-500">
                    {project.clients?.name ?? "Kein Kunde zugewiesen"} · Erstellt am {formatDate(project.created_at)}
                  </p>
                </div>
                <StatusBadge status={project.status} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-500">Fortschritt</span>
                <span className="font-medium text-slate-700">{progress}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #8F87F1 0%, #B7B1FF 100%)",
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <p className="max-w-3xl text-sm leading-6 text-slate-600">
              {project.description || "Für dieses Projekt ist aktuell noch keine Beschreibung hinterlegt."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.06)_0%,rgba(255,255,255,1)_45%)] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Kunde</p>
              <p className="mt-2 text-sm font-medium text-slate-900">{project.clients?.name ?? "Unbekannt"}</p>
              <p className="mt-1 text-sm text-slate-500">{project.clients?.email ?? "Keine E-Mail vorhanden"}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.06)_0%,rgba(255,255,255,1)_45%)] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Meilensteine</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">{milestones.length}</p>
              <p className="mt-1 text-sm text-slate-500">Im Projekt hinterlegt</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-[linear-gradient(180deg,rgba(143,135,241,0.06)_0%,rgba(255,255,255,1)_45%)] p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Abnahme</p>
              <p className="mt-2 text-2xl font-semibold text-slate-950">
                {approvals.find((approval) => approval.status === "pending") ? "Offen" : approvals.length > 0 ? "Verlauf" : "Keine"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {approvals.length > 0 ? `${approvals.length} Einträge im Verlauf` : "Noch keine Anfrage"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ProjectTabs activeTab={activeTab} items={tabs} onChange={(key) => setActiveTab(key as ProjectDetailTab)} />

      {activeTab === "overview" ? (
        <ProjectOverviewTab
          clientOptions={clientOptions}
          files={files}
          isAdmin={isAdmin}
          isSaving={updateMutation.isPending}
          onDeleteFile={handleDelete}
          onDownloadFile={handleDownload}
          onSave={handleSave}
          onUploadFile={handleUpload}
          project={project}
        />
      ) : null}

      {activeTab === "timeline" ? (
        <ProjectTimelineTab events={timelineEvents} isSubmitting={timelineMutation.isPending} onSubmit={handleCreateTimeline} />
      ) : null}

      {activeTab === "chat" ? (
        <ProjectChatTab isSubmitting={messageMutation.isPending} messages={messages} onSubmit={handleSendMessage} />
      ) : null}

      {activeTab === "milestones" ? (
        <ProjectMilestonesTab
          isAdmin={isAdmin}
          isCreating={createMilestoneMutation.isPending}
          isUpdating={updateMilestoneMutation.isPending}
          milestones={milestones}
          onCreate={handleCreateMilestone}
          onStatusChange={handleMilestoneStatusChange}
        />
      ) : null}

      {activeTab === "approvals" ? (
        <ProjectApprovalsTab
          approvals={approvals}
          isAdmin={isAdmin}
          isClient={isClient}
          isDeciding={decideApprovalMutation.isPending}
          isRequesting={requestApprovalMutation.isPending}
          onDecide={handleApprovalDecision}
          onRequestApproval={handleRequestApproval}
          projectStatus={project.status}
        />
      ) : null}
    </div>
  );
}
