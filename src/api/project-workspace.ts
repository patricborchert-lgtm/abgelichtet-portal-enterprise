import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import { getProjectTemplateById } from "@/lib/projectTemplates";
import type {
  Approval,
  ApprovalRequestValues,
  ApprovalDecisionValues,
  Milestone,
  MilestoneFormValues,
  MilestoneStatus,
  ProjectTemplateKey,
  ProjectServiceType,
  TimelineEvent,
  TimelineEventFormValues,
} from "@/types/app";

const LEGACY_TEMPLATE_TO_SERVICE: Record<ProjectTemplateKey, ProjectServiceType> = {
  photography: "fotografie",
  seo: "seo",
  website: "webdesign",
};

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

export async function createProjectMilestones(projectId: string, titles: string[]): Promise<Milestone[]> {
  const milestones = titles.map((title, index) => ({
    project_id: projectId,
    sort_order: index,
    title,
  }));

  const result = await supabase.from("milestones").insert(milestones).select("*");
  return assertSuccess(result, "Standard-Meilensteine konnten nicht erstellt werden.");
}

export async function createProjectMilestonesForService(
  projectId: string,
  serviceType: ProjectServiceType,
): Promise<Milestone[]> {
  const template = getProjectTemplateById(serviceType);

  if (!template) {
    throw new Error("Unbekannter Service-Typ für Meilenstein-Vorlage.");
  }

  return createProjectMilestones(projectId, template.defaultMilestones);
}

export async function createProjectMilestoneTemplate(projectId: string, templateKey: ProjectTemplateKey): Promise<Milestone[]> {
  return createProjectMilestonesForService(projectId, LEGACY_TEMPLATE_TO_SERVICE[templateKey]);
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
  values: ApprovalRequestValues,
): Promise<Approval> {
  const previousStepResult = await supabase
    .from("approvals")
    .select("step_round")
    .eq("project_id", projectId)
    .eq("step_key", values.stepKey)
    .order("step_round", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (previousStepResult.error) {
    throw new Error(previousStepResult.error.message);
  }

  const nextStepRound = (previousStepResult.data?.step_round ?? 0) + 1;

  const result = await supabase
    .from("approvals")
    .insert({
      project_id: projectId,
      request_message: values.message || null,
      requested_by: requestedBy,
      step_key: values.stepKey,
      step_label: values.stepLabel,
      step_round: nextStepRound,
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
