import { createContext, useEffect, useState } from "react";
import type { PropsWithChildren } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getErrorMessage, logDevError } from "@/lib/errors";
import type { Profile } from "@/types/app";

interface AuthContextValue {
  isAdmin: boolean;
  isClient: boolean;
  loading: boolean;
  profile: Profile | null;
  refreshProfile: () => Promise<void>;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function hydrateProfile(nextUser: User | null): Promise<void> {
    if (!nextUser) {
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await fetchProfile(nextUser.id);
      setProfile(nextProfile);
    } catch (error) {
      logDevError("Failed to load profile", error);
      setProfile(null);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!isMounted) {
          return;
        }

        setSession(data.session);
        setUser(data.session?.user ?? null);
        await hydrateProfile(data.session?.user ?? null);
      } catch (error) {
        logDevError("Failed to initialize auth", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      void (async () => {
        await hydrateProfile(nextSession?.user ?? null);
        setLoading(false);
      })();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(getErrorMessage(error, "Login fehlgeschlagen."));
    }
  }

  async function signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(getErrorMessage(error, "Logout fehlgeschlagen."));
    }
  }

  async function refreshProfile(): Promise<void> {
    await hydrateProfile(user);
  }

  return (
    <AuthContext.Provider
      value={{
        isAdmin: profile?.role === "admin",
        isClient: profile?.role === "client",
        loading,
        profile,
        refreshProfile,
        session,
        signIn,
        signOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
