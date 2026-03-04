import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import type { Approval, Milestone, ProjectMessage, TimelineEvent } from "@/types/app";

export interface ProjectWorkspaceSummary {
  completedMilestones: number;
  latestActivityAt: string | null;
  latestMessageAt: string | null;
  messageCount: number;
  pendingApprovals: number;
  projectId: string;
  totalMilestones: number;
  timelineCount: number;
}

export async function getProjectWorkspaceSummary(projectIds: string[]): Promise<Record<string, ProjectWorkspaceSummary>> {
  if (projectIds.length === 0) {
    return {};
  }

  const [approvalsResult, messagesResult, milestonesResult, timelineResult] = await Promise.all([
    supabase.from("approvals").select("project_id, status, created_at"),
    supabase.from("messages").select("project_id, created_at"),
    supabase.from("milestones").select("project_id, status"),
    supabase.from("timeline_events").select("project_id, created_at"),
  ]);

  const approvals = (assertSuccess(approvalsResult, "Abnahmen konnten nicht geladen werden.") as Pick<
    Approval,
    "created_at" | "project_id" | "status"
  >[]).filter((entry) => projectIds.includes(entry.project_id));
  const messages = (assertSuccess(messagesResult, "Nachrichten konnten nicht geladen werden.") as Pick<
    ProjectMessage,
    "created_at" | "project_id"
  >[]).filter((entry) => projectIds.includes(entry.project_id));
  const milestones = (assertSuccess(milestonesResult, "Meilensteine konnten nicht geladen werden.") as Pick<
    Milestone,
    "project_id" | "status"
  >[]).filter((entry) => projectIds.includes(entry.project_id));
  const timelineEvents = (assertSuccess(timelineResult, "Timeline konnte nicht geladen werden.") as Pick<
    TimelineEvent,
    "created_at" | "project_id"
  >[]).filter((entry) => projectIds.includes(entry.project_id));

  const summaryMap = new Map<string, ProjectWorkspaceSummary>();

  for (const projectId of projectIds) {
    summaryMap.set(projectId, {
      completedMilestones: 0,
      latestActivityAt: null,
      latestMessageAt: null,
      messageCount: 0,
      pendingApprovals: 0,
      projectId,
      timelineCount: 0,
      totalMilestones: 0,
    });
  }

  for (const entry of approvals) {
    const summary = summaryMap.get(entry.project_id);
    if (!summary) {
      continue;
    }

    if (entry.status === "pending") {
      summary.pendingApprovals += 1;
    }

    summary.latestActivityAt = getLatestDate(summary.latestActivityAt, entry.created_at);
  }

  for (const entry of messages) {
    const summary = summaryMap.get(entry.project_id);
    if (!summary) {
      continue;
    }

    summary.messageCount += 1;
    summary.latestMessageAt = getLatestDate(summary.latestMessageAt, entry.created_at);
    summary.latestActivityAt = getLatestDate(summary.latestActivityAt, entry.created_at);
  }

  for (const entry of milestones) {
    const summary = summaryMap.get(entry.project_id);
    if (!summary) {
      continue;
    }

    summary.totalMilestones += 1;

    if (entry.status === "completed") {
      summary.completedMilestones += 1;
    }
  }

  for (const entry of timelineEvents) {
    const summary = summaryMap.get(entry.project_id);
    if (!summary) {
      continue;
    }

    summary.timelineCount += 1;
    summary.latestActivityAt = getLatestDate(summary.latestActivityAt, entry.created_at);
  }

  return Object.fromEntries(summaryMap.entries());
}

function getLatestDate(current: string | null, next: string): string {
  if (!current) {
    return next;
  }

  return new Date(next).getTime() > new Date(current).getTime() ? next : current;
}
