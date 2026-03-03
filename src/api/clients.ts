import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import type { Client, ClientFormValues, InviteUserResponse, Project } from "@/types/app";

export interface ClientDetailsData {
  client: Client;
  projects: Project[];
}

export async function listClients(): Promise<Client[]> {
  const result = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  return assertSuccess(result, "Clients konnten nicht geladen werden.");
}

export async function getClientDetails(clientId: string): Promise<ClientDetailsData> {
  const clientResult = await supabase.from("clients").select("*").eq("id", clientId).maybeSingle();
  const projectsResult = await supabase.from("projects").select("*").eq("client_id", clientId).order("created_at", { ascending: false });

  return {
    client: assertSuccess(clientResult, "Client wurde nicht gefunden."),
    projects: assertSuccess(projectsResult, "Projekte des Clients konnten nicht geladen werden."),
  };
}

export async function updateClient(clientId: string, values: ClientFormValues): Promise<Client> {
  const result = await supabase
    .from("clients")
    .update({
      company: values.company || null,
      email: values.email,
      name: values.name,
      notes: values.notes || null,
      phone: values.phone || null,
    })
    .eq("id", clientId)
    .select("*")
    .single();

  return assertSuccess(result, "Client konnte nicht gespeichert werden.");
}

export async function setClientActiveState(clientId: string, isActive: boolean): Promise<Client> {
  const result = await supabase.from("clients").update({ is_active: isActive }).eq("id", clientId).select("*").single();
  return assertSuccess(result, "Client-Status konnte nicht aktualisiert werden.");
}

export async function generateInvite(values: ClientFormValues): Promise<InviteUserResponse> {
  const result = await supabase.functions.invoke<InviteUserResponse>("invite-user", {
    body: {
      clientData: {
        company: values.company || null,
        name: values.name,
        notes: values.notes || null,
        phone: values.phone || null,
      },
      email: values.email,
    },
  });

  return assertSuccess(result, "Invite-Link konnte nicht generiert werden.");
}
