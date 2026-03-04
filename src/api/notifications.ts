import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import type { Notification, NotificationType } from "@/types/app";

interface CreateProjectNotificationPayload {
  message: string;
  projectId: string;
  title: string;
  type: NotificationType;
}

export async function listNotifications(limit = 20): Promise<Notification[]> {
  const result = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  return assertSuccess(result, "Benachrichtigungen konnten nicht geladen werden.");
}

export async function getUnreadNotificationCount(): Promise<number> {
  const result = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false);

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.count ?? 0;
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  const result = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);

  if (result.error) {
    throw new Error(result.error.message);
  }
}

export async function createProjectNotification(payload: CreateProjectNotificationPayload): Promise<number> {
  const result = await supabase.rpc("create_project_notification", {
    p_message: payload.message,
    p_project_id: payload.projectId,
    p_title: payload.title,
    p_type: payload.type,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data ?? 0;
}
