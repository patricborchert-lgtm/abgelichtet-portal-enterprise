import { supabase } from "@/integrations/supabase/client";
import { assertSuccess } from "@/lib/errors";
import type { ImpersonationResponse } from "@/types/app";

export async function requestImpersonationLink(clientId: string): Promise<ImpersonationResponse> {
  const result = await supabase.functions.invoke<ImpersonationResponse>("impersonate-client", {
    body: {
      clientId,
    },
  });

  return assertSuccess(result, "Impersonation-Link konnte nicht erstellt werden.");
}
