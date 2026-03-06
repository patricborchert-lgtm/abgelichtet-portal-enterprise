import { createProjectNotification } from "@/api/notifications";
import { logDevError } from "@/lib/errors";
import type { NotificationType } from "@/types/app";

interface CreateNotificationPayload {
  link?: string;
  message: string;
  projectId?: string;
  title: string;
  type?: NotificationType;
  userId: string;
}

export async function createNotification(payload: CreateNotificationPayload): Promise<void> {
  if (!payload.projectId) {
    if (import.meta.env.DEV) {
      console.info("[notification:event]", payload);
    }
    return;
  }

  try {
    await createProjectNotification({
      message: payload.link ? `${payload.message} (${payload.link})` : payload.message,
      projectId: payload.projectId,
      title: payload.title,
      type: payload.type ?? "chat_message",
    });
  } catch (error) {
    logDevError("Notification trigger failed", error);
  }
}
