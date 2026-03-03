import { createClient, type SupabaseClient, type User } from "https://esm.sh/@supabase/supabase-js@2.52.1";

interface AdminContext {
  serviceClient: SupabaseClient;
  user: User;
}

interface AuthenticatedContext extends AdminContext {
  actorRole: string;
}

function getEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

export function createServiceClient(): SupabaseClient {
  return createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function requireAuthenticatedUser(req: Request): Promise<AuthenticatedContext> {
  const authHeader = req.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Response(JSON.stringify({ error: "Missing bearer token." }), { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "").trim();
  const serviceClient = createServiceClient();
  const {
    data: { user },
    error: userError,
  } = await serviceClient.auth.getUser(token);

  if (userError || !user) {
    throw new Response(JSON.stringify({ error: "Invalid auth token." }), { status: 401 });
  }

  const { data: profile, error: profileError } = await serviceClient
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || !profile.is_active) {
    throw new Response(JSON.stringify({ error: "Profile not active." }), { status: 403 });
  }

  return {
    actorRole: profile.role,
    serviceClient,
    user,
  };
}

export async function requireAdmin(req: Request): Promise<AdminContext> {
  const context = await requireAuthenticatedUser(req);

  if (context.actorRole !== "admin") {
    throw new Response(JSON.stringify({ error: "Admin role required." }), { status: 403 });
  }

  return {
    serviceClient: context.serviceClient,
    user: context.user,
  };
}
