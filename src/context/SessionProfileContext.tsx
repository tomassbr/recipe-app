"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { ProfileRole } from "@/types/profile";

export type SessionProfileValue = {
  /** `null` = signed out or no profile row yet */
  role: ProfileRole | null;
  isAdmin: boolean;
  /** True after first auth/profile fetch for this tab session */
  profileHydrated: boolean;
};

const SessionProfileContext = createContext<SessionProfileValue | null>(null);

export function SessionProfileProvider({
  children,
  initialRole,
}: {
  children: ReactNode;
  initialRole?: ProfileRole | null;
}) {
  const [role, setRole] = useState<ProfileRole | null>(initialRole ?? null);
  const [profileHydrated, setProfileHydrated] = useState(initialRole !== undefined);
  const skipInitialFetch = useRef(initialRole !== undefined);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setRole(null);
          setProfileHydrated(true);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      const r = data?.role;
      if (r === "admin" || r === "user") {
        setRole(r);
      } else {
        setRole(null);
      }
      setProfileHydrated(true);
    }

    if (!skipInitialFetch.current) {
      void loadRole();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadRole();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo<SessionProfileValue>(
    () => ({
      role,
      isAdmin: role === "admin",
      profileHydrated,
    }),
    [role, profileHydrated]
  );

  return (
    <SessionProfileContext.Provider value={value}>
      {children}
    </SessionProfileContext.Provider>
  );
}

export function useSessionProfile(): SessionProfileValue {
  const ctx = useContext(SessionProfileContext);
  if (!ctx) {
    throw new Error("useSessionProfile must be used within SessionProfileProvider");
  }
  return ctx;
}
