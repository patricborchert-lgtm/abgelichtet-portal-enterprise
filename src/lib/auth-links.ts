import { supabase } from "@/integrations/supabase/client";

export async function establishSessionFromUrl(): Promise<void> {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const code = searchParams.get("code");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error(error.message);
    }

    return;
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      throw new Error(error.message);
    }
  }
}
