export const config = {
  verify_jwt: false,
};

import { createJsonResponse, handleOptions } from "../_shared/cors.ts";
import { createServiceClient } from "../_shared/auth.ts";

type ReminderRuleType = "approval_requested" | "feedback_requested";

interface ReminderRule {
  days_after: number;
  enabled: boolean;
  id: string;
  send_to: "client" | "admin";
  type: ReminderRuleType;
}

interface DueReminderCandidate {
  approval_id: string;
  project_id: string;
}

interface ReminderRunStats {
  failed: number;
  sent: number;
  skipped: number;
}

const reminderEventTypeMap: Record<ReminderRuleType, "approval_reminder" | "feedback_reminder"> = {
  approval_requested: "approval_reminder",
  feedback_requested: "feedback_reminder",
};

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function hasValidReminderSecret(req: Request): boolean {
  const expectedSecret = Deno.env.get("REMINDER_CRON_SECRET")?.trim();
  const providedSecret = req.headers.get("x-reminder-secret")?.trim();

  return Boolean(expectedSecret && providedSecret && expectedSecret === providedSecret);
}

function isDuplicateEntryError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const maybeCode = (error as { code?: string }).code;
  return maybeCode === "23505";
}

function getCutoffIso(daysAfter: number): string {
  return new Date(Date.now() - daysAfter * 24 * 60 * 60 * 1000).toISOString();
}

async function listDueCandidates(rule: ReminderRule): Promise<DueReminderCandidate[]> {
  const serviceClient = createServiceClient();
  const cutoffIso = getCutoffIso(rule.days_after);

  const query = serviceClient
    .from("approvals")
    .select("id, project_id")
    .eq("status", rule.type === "approval_requested" ? "pending" : "changes_requested");

  const result =
    rule.type === "approval_requested"
      ? await query.lte("created_at", cutoffIso)
      : await query.not("decided_at", "is", null).lte("decided_at", cutoffIso);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return (result.data ?? []).map((item) => ({
    approval_id: item.id,
    project_id: item.project_id,
  }));
}

async function reserveHistoryEntry(candidate: DueReminderCandidate, type: ReminderRuleType): Promise<string | null> {
  const serviceClient = createServiceClient();
  const result = await serviceClient
    .from("reminder_history")
    .insert({
      approval_id: candidate.approval_id,
      project_id: candidate.project_id,
      type,
    })
    .select("id")
    .single();

  if (result.error) {
    if (isDuplicateEntryError(result.error)) {
      return null;
    }

    throw new Error(result.error.message);
  }

  return result.data.id;
}

async function releaseHistoryEntry(historyId: string): Promise<void> {
  const serviceClient = createServiceClient();
  await serviceClient.from("reminder_history").delete().eq("id", historyId);
}

async function sendReminderEmail(projectId: string, type: ReminderRuleType): Promise<void> {
  const supabaseUrl = getEnv("SUPABASE_URL");
  const serviceRoleKey = getEnv("SUPABASE_SERVICE_ROLE_KEY");
  const reminderSecret = getEnv("REMINDER_CRON_SECRET");
  const response = await fetch(`${supabaseUrl}/functions/v1/send-project-email`, {
    body: JSON.stringify({
      projectId,
      type: reminderEventTypeMap[type],
    }),
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      "x-reminder-secret": reminderSecret,
    },
    method: "POST",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Reminder email failed: ${message}`);
  }
}

async function processRule(rule: ReminderRule): Promise<ReminderRunStats> {
  const stats: ReminderRunStats = {
    failed: 0,
    sent: 0,
    skipped: 0,
  };

  if (!rule.enabled) {
    return stats;
  }

  if (rule.send_to !== "client") {
    stats.skipped += 1;
    return stats;
  }

  const candidates = await listDueCandidates(rule);

  for (const candidate of candidates) {
    const historyId = await reserveHistoryEntry(candidate, rule.type);

    if (!historyId) {
      stats.skipped += 1;
      continue;
    }

    try {
      await sendReminderEmail(candidate.project_id, rule.type);
      stats.sent += 1;
    } catch {
      await releaseHistoryEntry(historyId);
      stats.failed += 1;
    }
  }

  return stats;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return handleOptions(origin);
  }

  try {
    if (req.method !== "POST") {
      return createJsonResponse(origin, { error: "Method not allowed." }, 405);
    }

    if (!hasValidReminderSecret(req)) {
      return createJsonResponse(origin, { error: "Invalid reminder secret." }, 401);
    }

    const serviceClient = createServiceClient();
    const { data: rules, error } = await serviceClient
      .from("reminder_rules")
      .select("id, type, days_after, send_to, enabled")
      .eq("enabled", true);

    if (error) {
      return createJsonResponse(origin, { error: error.message }, 400);
    }

    const aggregate: ReminderRunStats = {
      failed: 0,
      sent: 0,
      skipped: 0,
    };

    for (const rule of (rules ?? []) as ReminderRule[]) {
      const stats = await processRule(rule);
      aggregate.sent += stats.sent;
      aggregate.skipped += stats.skipped;
      aggregate.failed += stats.failed;
    }

    return createJsonResponse(origin, {
      success: true,
      summary: aggregate,
    });
  } catch (error) {
    return createJsonResponse(origin, { error: error instanceof Error ? error.message : "Unexpected error." }, 500);
  }
});
