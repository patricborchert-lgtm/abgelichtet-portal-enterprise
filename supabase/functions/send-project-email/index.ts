import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.52.1";
import { createJsonResponse, handleOptions } from "../_shared/cors.ts";
import { requireAuthenticatedUser } from "../_shared/auth.ts";
import { sendBrevoEmail } from "../_shared/brevo.ts";

type ProjectEmailEvent = "project_created" | "approval_requested" | "approved" | "changes_requested";

interface SendProjectEmailBody {
  comment?: string;
  projectId?: string;
  type?: ProjectEmailEvent;
}

interface ProjectEmailContext {
  clientEmail: string;
  clientName: string;
  projectId: string;
  projectTitle: string;
}

const portalBaseUrl = "https://portal.abgelichtet.ch";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function getProjectEmailContext(
  projectId: string,
  userId: string,
  actorRole: string,
  serviceClient: SupabaseClient,
): Promise<ProjectEmailContext> {
  const { data: project, error: projectError } = await serviceClient
    .from("projects")
    .select("id, title, client_id, clients(name, email)")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project) {
    throw new Response(JSON.stringify({ error: projectError?.message ?? "Project not found." }), { status: 404 });
  }

  const clientName = project.clients?.name?.trim();
  const clientEmail = project.clients?.email?.trim().toLowerCase();

  if (!clientName || !clientEmail) {
    throw new Response(JSON.stringify({ error: "Client email data is missing." }), { status: 400 });
  }

  if (actorRole === "client") {
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("client_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile || profile.client_id !== project.client_id) {
      throw new Response(JSON.stringify({ error: "Not allowed for this project." }), { status: 403 });
    }
  }

  return {
    clientEmail,
    clientName,
    projectId: project.id,
    projectTitle: project.title,
  };
}

function buildEmailContent(type: ProjectEmailEvent, context: ProjectEmailContext, comment?: string) {
  const projectUrl = `${portalBaseUrl}/project/${context.projectId}`;
  const safeProjectTitle = escapeHtml(context.projectTitle);
  const safeClientName = escapeHtml(context.clientName);
  const safeComment = comment ? escapeHtml(comment) : "";

  switch (type) {
    case "project_created":
      return {
        html: `<p>Hoi ${safeClientName},</p><p>dein neues Projekt <strong>${safeProjectTitle}</strong> wurde angelegt.</p><p>Du kannst den aktuellen Stand jederzeit hier ansehen:</p><p><a href="${projectUrl}">${projectUrl}</a></p><p>Liebe Grüsse<br />abgelichtet.ch</p>`,
        subject: `Neues Projekt: ${context.projectTitle}`,
        text: `Hoi ${context.clientName},\n\ndein neues Projekt "${context.projectTitle}" wurde angelegt.\n\nProjekt ansehen: ${projectUrl}\n\nLiebe Grüsse\nabgelichtet.ch`,
      };
    case "approval_requested":
      return {
        html: `<p>Hoi ${safeClientName},</p><p>für dein Projekt <strong>${safeProjectTitle}</strong> wurde eine Abnahme angefragt.</p>${safeComment ? `<p>Hinweis: ${safeComment}</p>` : ""}<p>Hier kannst du das Projekt direkt prüfen:</p><p><a href="${projectUrl}">${projectUrl}</a></p><p>Liebe Grüsse<br />abgelichtet.ch</p>`,
        subject: `Abnahme angefragt: ${context.projectTitle}`,
        text: `Hoi ${context.clientName},\n\nfür dein Projekt "${context.projectTitle}" wurde eine Abnahme angefragt.\n${comment ? `\nHinweis: ${comment}\n` : "\n"}Projekt ansehen: ${projectUrl}\n\nLiebe Grüsse\nabgelichtet.ch`,
      };
    case "approved":
      return {
        html: `<p>Hallo abgelichtet.ch,</p><p>das Projekt <strong>${safeProjectTitle}</strong> wurde von ${safeClientName} abgenommen.</p>${safeComment ? `<p>Kommentar: ${safeComment}</p>` : ""}<p>Projekt öffnen: <a href="${projectUrl}">${projectUrl}</a></p>`,
        subject: `Projekt abgenommen: ${context.projectTitle}`,
        text: `Hallo abgelichtet.ch,\n\ndas Projekt "${context.projectTitle}" wurde von ${context.clientName} abgenommen.\n${comment ? `\nKommentar: ${comment}\n` : "\n"}Projekt öffnen: ${projectUrl}`,
      };
    case "changes_requested":
      return {
        html: `<p>Hallo abgelichtet.ch,</p><p>für das Projekt <strong>${safeProjectTitle}</strong> wurden Änderungen angefordert.</p><p>Kommentar: ${safeComment}</p><p>Projekt öffnen: <a href="${projectUrl}">${projectUrl}</a></p>`,
        subject: `Änderungen angefordert: ${context.projectTitle}`,
        text: `Hallo abgelichtet.ch,\n\nfür das Projekt "${context.projectTitle}" wurden Änderungen angefordert.\n\nKommentar: ${comment ?? ""}\n\nProjekt öffnen: ${projectUrl}`,
      };
  }
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

    const { actorRole, serviceClient, user } = await requireAuthenticatedUser(req);
    const body = (await req.json()) as SendProjectEmailBody;
    const type = body.type;
    const projectId = body.projectId?.trim();
    const comment = body.comment?.trim() || undefined;

    if (!type || !projectId) {
      return createJsonResponse(origin, { error: "type and projectId are required." }, 400);
    }

    if ((type === "project_created" || type === "approval_requested") && actorRole !== "admin") {
      return createJsonResponse(origin, { error: "Admin role required for this email." }, 403);
    }

    if ((type === "approved" || type === "changes_requested") && actorRole !== "client") {
      return createJsonResponse(origin, { error: "Client role required for this email." }, 403);
    }

    if (type === "changes_requested" && !comment) {
      return createJsonResponse(origin, { error: "Comment is required for changes_requested." }, 400);
    }

    const context = await getProjectEmailContext(projectId, user.id, actorRole, serviceClient);
    const content = buildEmailContent(type, context, comment);

    const recipients =
      type === "project_created" || type === "approval_requested"
        ? [{ email: context.clientEmail, name: context.clientName }]
        : [{ email: Deno.env.get("BREVO_NOTIFICATION_EMAIL") ?? Deno.env.get("BREVO_SENDER_EMAIL")!, name: "abgelichtet.ch" }];

    await sendBrevoEmail({
      htmlContent: content.html,
      subject: content.subject,
      textContent: content.text,
      to: recipients,
    });

    return createJsonResponse(origin, { success: true });
  } catch (error) {
    if (error instanceof Response) {
      return new Response(await error.text(), {
        headers: {
          ...Object.fromEntries(new Headers(createJsonResponse(origin, {}).headers).entries()),
        },
        status: error.status,
      });
    }

    return createJsonResponse(origin, { error: error instanceof Error ? error.message : "Unexpected error." }, 500);
  }
});
