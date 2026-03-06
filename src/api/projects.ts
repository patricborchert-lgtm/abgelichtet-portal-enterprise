import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import type { Client, Project, ProjectFormValues } from "@/types/app";

export interface ProjectWithClient extends Project {
  clients: Pick<Client, "email" | "id" | "name"> | null;
}

export interface ProjectDetailsData {
  project: ProjectWithClient;
}

export async function listAdminProjects(): Promise<ProjectWithClient[]> {
  const result = await supabase
    .from("projects")
    .select("*, clients(id, name, email)")
    .order("created_at", { ascending: false });

  return assertSuccess(result, "Projekte konnten nicht geladen werden.") as unknown as ProjectWithClient[];
}

export async function listMyProjects(): Promise<ProjectWithClient[]> {
  const result = await supabase
    .from("projects")
    .select("*, clients(id, name, email)")
    .neq("status", "archived")
    .order("created_at", { ascending: false });

  return assertSuccess(result, "Eigene Projekte konnten nicht geladen werden.") as unknown as ProjectWithClient[];
}

export async function getProjectDetails(projectId: string): Promise<ProjectDetailsData> {
  const result = await supabase.from("projects").select("*, clients(id, name, email)").eq("id", projectId).maybeSingle();
  return {
    project: assertSuccess(result, "Projekt wurde nicht gefunden.") as unknown as ProjectWithClient,
  };
}

export async function createProject(values: ProjectFormValues): Promise<Project> {
  const result = await supabase
    .from("projects")
    .insert({
      client_id: values.clientId,
      description: values.description || null,
      service_type: values.serviceType ?? null,
      status: values.status,
      title: values.title,
    })
    .select("*")
    .single();

  return assertSuccess(result, "Projekt konnte nicht erstellt werden.");
}

export async function updateProject(projectId: string, values: ProjectFormValues): Promise<Project> {
  const result = await supabase
    .from("projects")
    .update({
      client_id: values.clientId,
      description: values.description || null,
      ...(values.serviceType === undefined ? {} : { service_type: values.serviceType }),
      status: values.status,
      title: values.title,
    })
    .eq("id", projectId)
    .select("*")
    .single();

  return assertSuccess(result, "Projekt konnte nicht gespeichert werden.");
}

export async function listClientOptions(): Promise<Client[]> {
  const result = await supabase
    .from("clients")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  return assertSuccess(result, "Clients konnten nicht geladen werden.");
}
