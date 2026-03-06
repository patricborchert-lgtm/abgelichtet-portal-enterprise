import { sendProjectEmail } from "@/api/emails";
import { logDevError } from "@/lib/errors";

type EmailNotificationType = "approval_requested" | "approved" | "changes_requested" | "project_created" | "chat_message_sent";

interface SendEmailNotificationPayload {
  link?: string;
  message: string;
  projectId?: string;
  recipient: string;
  subject: string;
  type: EmailNotificationType;
}

export async function sendEmailNotification(payload: SendEmailNotificationPayload): Promise<void> {
  if (import.meta.env.DEV) {
    console.info("[email:event]", payload);
  }

  if (!payload.projectId) {
    return;
  }

  try {
    await sendProjectEmail({
      comment: payload.link ? `${payload.message}\n\n${payload.link}` : payload.message,
      projectId: payload.projectId,
      type: payload.type,
    });
  } catch (error) {
    logDevError("Email trigger failed", error);
  }
}
