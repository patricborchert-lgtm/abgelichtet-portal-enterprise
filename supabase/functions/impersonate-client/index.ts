import { handleOptions, createJsonResponse } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

interface ImpersonateBody {
  clientId?: string;
}

const redirectTo = "https://portal.abgelichtet.ch/auth/callback?next=/client/dashboard&impersonation=1";

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");

  if (req.method === "OPTIONS") {
    return handleOptions(origin);
  }

  try {
    if (req.method !== "POST") {
      return createJsonResponse(origin, { error: "Method not allowed." }, 405);
    }

    const { serviceClient, user } = await requireAdmin(req);
    const body = (await req.json()) as ImpersonateBody;

    if (!body.clientId) {
      return createJsonResponse(origin, { error: "clientId is required." }, 400);
    }

    const { data: client, error: clientError } = await serviceClient
      .from("clients")
      .select("id, email, name, is_active")
      .eq("id", body.clientId)
      .maybeSingle();

    if (clientError || !client) {
      return createJsonResponse(origin, { error: clientError?.message ?? "Client not found." }, 404);
    }

    if (!client.is_active) {
      return createJsonResponse(origin, { error: "Client is inactive." }, 409);
    }

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("id, is_active")
      .eq("client_id", client.id)
      .eq("role", "client")
      .maybeSingle();

    if (profileError || !profile || !profile.is_active) {
      return createJsonResponse(origin, { error: "Active client profile not found." }, 404);
    }

    const { data: magicLinkData, error: magicLinkError } = await serviceClient.auth.admin.generateLink({
      email: client.email,
      options: {
        redirectTo,
      },
      type: "magiclink",
    });

    if (magicLinkError || !magicLinkData.properties?.action_link) {
      return createJsonResponse(origin, { error: magicLinkError?.message ?? "Magic link generation failed." }, 400);
    }

    await serviceClient.from("activity_log").insert({
      action: "impersonation_started",
      actor_id: user.id,
      actor_role: "admin",
      entity_id: client.id,
      entity_type: "client",
      metadata: {
        client_name: client.name,
        impersonated_profile_id: profile.id,
      },
    });

    await serviceClient.from("audit_log").insert({
      action: "impersonation_started",
      actor_id: user.id,
      ip_address: req.headers.get("x-forwarded-for"),
      metadata: {
        client_id: client.id,
        client_name: client.name,
        impersonated_profile_id: profile.id,
      },
      severity: "warning",
    });

    return createJsonResponse(origin, {
      redirectUrl: magicLinkData.properties.action_link,
    });
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
