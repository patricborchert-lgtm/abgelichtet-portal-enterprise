import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import type { ActivityLog, ActivityPayload } from "@/types/app";

export async function listRecentActivity(limit = 12): Promise<ActivityLog[]> {
  const result = await supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(limit);
  return assertSuccess(result, "Aktivitaeten konnten nicht geladen werden.");
}

export async function logActivity(payload: ActivityPayload): Promise<void> {
  const result = await supabase.functions.invoke("log-activity", {
    body: payload,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}
