"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { User } from "@supabase/supabase-js";
import { LogOut, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/utils/cn";

function initialsFromUser(user: User) {
  const meta = user.user_metadata as Record<string, string | undefined>;
  const name = meta?.full_name ?? meta?.name ?? user.email ?? "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function avatarUrlFromUser(user: User): string | undefined {
  const meta = user.user_metadata as Record<string, unknown>;
  const fromMeta =
    (typeof meta.avatar_url === "string" && meta.avatar_url) ||
    (typeof meta.picture === "string" && meta.picture);
  if (fromMeta) return fromMeta;

  for (const identity of user.identities ?? []) {
    if (identity.provider !== "google") continue;
    const data = identity.identity_data as Record<string, unknown> | undefined;
    if (!data) continue;
    const u =
      (typeof data.avatar_url === "string" && data.avatar_url) ||
      (typeof data.picture === "string" && data.picture);
    if (u) return u;
  }
  return undefined;
}

export function UserNav() {
  const t = useTranslations("nav");
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setAvatarFailed(false);
  }, [user?.id]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }, [router]);

  if (!user) {
    return null;
  }

  const meta = user.user_metadata as Record<string, string | undefined>;
  const avatarUrl = avatarUrlFromUser(user);
  const label = meta?.full_name ?? meta?.name ?? user.email ?? t("account");

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/50 bg-white/50 px-2 py-1.5 pl-2 pr-1 shadow-sm backdrop-blur-sm">
      <div className="flex min-w-0 items-center gap-2">
        {avatarUrl && !avatarFailed ? (
          <Image
            src={avatarUrl}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-white/60"
            onError={() => setAvatarFailed(true)}
          />
        ) : (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-muted text-xs font-semibold text-slate-700 ring-1 ring-gold/30"
            aria-hidden
          >
            {initialsFromUser(user)}
          </span>
        )}
        <span className="hidden max-w-[140px] truncate text-xs font-medium text-slate-700 sm:inline">
          {label}
        </span>
      </div>
      <Link
        href="/dashboard"
        title={t("settings")}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-slate-600 transition-colors",
          "hover:border-slate-200/80 hover:bg-white/70 hover:text-slate-800"
        )}
      >
        <Settings className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        <span className="sr-only">{t("settings")}</span>
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        title={t("signOut")}
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-transparent text-slate-600 transition-colors",
          "hover:border-red-200/80 hover:bg-red-50/90 hover:text-red-700"
        )}
      >
        <LogOut className="h-4 w-4" strokeWidth={2} aria-hidden />
        <span className="sr-only">{t("signOut")}</span>
      </button>
    </div>
  );
}
