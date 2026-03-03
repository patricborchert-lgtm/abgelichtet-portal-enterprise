import { handleOptions, createJsonResponse } from "../_shared/cors.ts";
import { requireAdmin } from "../_shared/auth.ts";

interface InviteUserBody {
  clientData?: {
    company?: string | null;
    name?: string | null;
    notes?: string | null;
    phone?: string | null;
  };
  email?: string;
}

const redirectTo = "https://portal.abgelichtet.ch/set-password";

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
    const body = (await req.json()) as InviteUserBody;
    const email = body.email?.trim().toLowerCase();
    const clientName = body.clientData?.name?.trim();

    if (!email || !clientName) {
      return createJsonResponse(origin, { error: "Email and client name are required." }, 400);
    }

    const { data: existingClient } = await serviceClient.from("clients").select("*").eq("email", email).maybeSingle();

    const clientPayload = {
      company: body.clientData?.company?.trim() || null,
      email,
      name: clientName,
      notes: body.clientData?.notes?.trim() || null,
      phone: body.clientData?.phone?.trim() || null,
    };

    const clientResult = existingClient
      ? await serviceClient.from("clients").update(clientPayload).eq("id", existingClient.id).select("*").single()
      : await serviceClient.from("clients").insert(clientPayload).select("*").single();

    if (clientResult.error) {
      return createJsonResponse(origin, { error: clientResult.error.message }, 400);
    }

    const client = clientResult.data;

    const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.generateLink({
      email,
      options: {
        redirectTo,
      },
      type: "invite",
    });

    if (inviteError || !inviteData.properties?.action_link) {
      return createJsonResponse(origin, { error: inviteError?.message ?? "Invite link generation failed." }, 400);
    }

    const invitedUserId = inviteData.user?.id;

    if (invitedUserId) {
      const { data: existingProfile } = await serviceClient
        .from("profiles")
        .select("role")
        .eq("id", invitedUserId)
        .maybeSingle();

      if (existingProfile?.role === "admin") {
        return createJsonResponse(origin, { error: "Existing admin user cannot be assigned as client." }, 409);
      }

      const { error: profileError } = await serviceClient.from("profiles").upsert({
        client_id: client.id,
        id: invitedUserId,
        is_active: true,
        role: "client",
      });

      if (profileError) {
        return createJsonResponse(origin, { error: profileError.message }, 400);
      }
    }

    await serviceClient.from("activity_log").insert({
      action: "invite_generated",
      actor_id: user.id,
      actor_role: "admin",
      entity_id: client.id,
      entity_type: "client",
      metadata: {
        client_email: email,
        client_name: client.name,
      },
    });

    return createJsonResponse(origin, {
      clientId: client.id,
      inviteLink: inviteData.properties.action_link,
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
