import { handleOptions, createJsonResponse } from "../_shared/cors.ts";
import { requireAuthenticatedUser } from "../_shared/auth.ts";

interface LogActivityBody {
  action?: string;
  entityId?: string | null;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

const auditActions = new Set(["invite_generated", "password_set", "impersonation_started", "impersonation_stopped"]);

function getSeverity(action: string): "info" | "warning" | "critical" {
  if (action.startsWith("impersonation")) {
    return "warning";
  }

  if (action === "password_set") {
    return "info";
  }

  return "info";
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
    const body = (await req.json()) as LogActivityBody;

    if (!body.action || !body.entityType) {
      return createJsonResponse(origin, { error: "action and entityType are required." }, 400);
    }

    const metadata = body.metadata ?? {};

    const { error: insertError } = await serviceClient.from("activity_log").insert({
      action: body.action,
      actor_id: user.id,
      actor_role: actorRole,
      entity_id: body.entityId ?? null,
      entity_type: body.entityType,
      metadata,
    });

    if (insertError) {
      return createJsonResponse(origin, { error: insertError.message }, 400);
    }

    if (auditActions.has(body.action)) {
      await serviceClient.from("audit_log").insert({
        action: body.action,
        actor_id: user.id,
        ip_address: req.headers.get("x-forwarded-for"),
        metadata,
        severity: getSeverity(body.action),
      });
    }

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
