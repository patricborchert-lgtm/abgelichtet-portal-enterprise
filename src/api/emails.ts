import { supabase } from "@/integrations/supabase/client";

type ProjectEmailEvent =
  | "project_created"
  | "approval_requested"
  | "approved"
  | "changes_requested"
  | "chat_message_sent";

interface SendProjectEmailPayload {
  comment?: string;
  projectId: string;
  type: ProjectEmailEvent;
}

export async function sendProjectEmail(
  payload: SendProjectEmailPayload
): Promise<void> {
  const result = await supabase.functions.invoke("send-project-email", {
    body: payload,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}
