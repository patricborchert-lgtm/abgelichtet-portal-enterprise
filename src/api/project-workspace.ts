import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import type {
  Approval,
  ApprovalDecisionValues,
  Milestone,
  MilestoneFormValues,
  MilestoneStatus,
  TimelineEvent,
  TimelineEventFormValues,
} from "@/types/app";

export async function listProjectMilestones(projectId: string): Promise<Milestone[]> {
  const result = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return assertSuccess(result, "Meilensteine konnten nicht geladen werden.");
}

export async function createProjectMilestone(projectId: string, values: MilestoneFormValues): Promise<Milestone> {
  const result = await supabase
    .from("milestones")
    .insert({
      description: values.description || null,
      project_id: projectId,
      sort_order: values.sortOrder,
      title: values.title,
    })
    .select("*")
    .single();

  return assertSuccess(result, "Meilenstein konnte nicht erstellt werden.");
}

export async function updateProjectMilestone(
  milestoneId: string,
  values: Partial<MilestoneFormValues> & { status?: MilestoneStatus },
): Promise<Milestone> {
  const result = await supabase
    .from("milestones")
    .update({
      description: values.description === undefined ? undefined : values.description || null,
      sort_order: values.sortOrder,
      status: values.status,
      title: values.title,
    })
    .eq("id", milestoneId)
    .select("*")
    .single();

  return assertSuccess(result, "Meilenstein konnte nicht aktualisiert werden.");
}

export async function listProjectTimeline(projectId: string): Promise<TimelineEvent[]> {
  const result = await supabase
    .from("timeline_events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return assertSuccess(result, "Timeline konnte nicht geladen werden.");
}

export async function createProjectTimelineEvent(
  projectId: string,
  authorId: string,
  values: TimelineEventFormValues,
): Promise<TimelineEvent> {
  const result = await supabase
    .from("timeline_events")
    .insert({
      author_id: authorId,
      author_label: values.authorLabel,
      event_type: values.eventType,
      message: values.message,
      project_id: projectId,
    })
    .select("*")
    .single();

  return assertSuccess(result, "Timeline-Eintrag konnte nicht erstellt werden.");
}

export async function listProjectApprovals(projectId: string): Promise<Approval[]> {
  const result = await supabase
    .from("approvals")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return assertSuccess(result, "Abnahmeverlauf konnte nicht geladen werden.");
}

export async function requestProjectApproval(
  projectId: string,
  requestedBy: string,
  requestMessage: string,
): Promise<Approval> {
  const result = await supabase
    .from("approvals")
    .insert({
      project_id: projectId,
      request_message: requestMessage || null,
      requested_by: requestedBy,
      status: "pending",
    })
    .select("*")
    .single();

  return assertSuccess(result, "Abnahme konnte nicht angefordert werden.");
}

export async function decideProjectApproval(approvalId: string, values: ApprovalDecisionValues): Promise<void> {
  const result = await supabase.rpc("respond_to_project_approval", {
    p_approval_id: approvalId,
    p_response_comment: values.comment || null,
    p_status: values.status,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}
