import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import type { MessageFormValues, ProjectMessage } from "@/types/app";

export async function listProjectMessages(projectId: string): Promise<ProjectMessage[]> {
  const result = await supabase
    .from("messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  return assertSuccess(result, "Nachrichten konnten nicht geladen werden.");
}

export async function createProjectMessage(
  projectId: string,
  authorId: string,
  values: MessageFormValues,
): Promise<ProjectMessage> {
  const result = await supabase
    .from("messages")
    .insert({
      author_id: authorId,
      author_label: values.authorLabel,
      body: values.body,
      project_id: projectId,
    })
    .select("*")
    .single();

  return assertSuccess(result, "Nachricht konnte nicht gesendet werden.");
}
