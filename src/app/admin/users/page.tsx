import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { UserManagementTable } from "@/components/features/admin/UserManagementTable";
import { GlassCard } from "@/components/ui";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/profile";

export async function generateMetadata() {
  const t = await getTranslations("admin");
  return { title: t("pageTitle"), description: t("pageDescription") };
}

export default async function AdminUsersPage() {
  const t = await getTranslations("admin");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin/users");

  const { data: rows, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, approved")
    .order("email", { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <GlassCard className="p-6 md:p-8">
        <p className="text-sm text-red-700">{t("errorLoad", { message: error.message })}</p>
        <p className="mt-2 text-xs text-slate-500">{t("errorHint")}</p>
      </GlassCard>
    );
  }

  const profiles = (rows ?? []) as ProfileRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
            {t("heading")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-white/50 bg-white/50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-gold/35 hover:bg-gold-muted"
        >
          {t("backToApp")}
        </Link>
      </div>

      <GlassCard className="p-6 md:p-8">
        {profiles.length === 0 ? (
          <p className="text-sm text-slate-600">{t("noProfiles")}</p>
        ) : (
          <UserManagementTable profiles={profiles} currentUserId={user.id} />
        )}
      </GlassCard>
    </div>
  );
}
