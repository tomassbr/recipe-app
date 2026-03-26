import Link from "next/link";
import { redirect } from "next/navigation";
import { UserManagementTable } from "./UserManagementTable";
import { GlassCard } from "@/components/ui";
import { createClient } from "@/utils/supabase/server";
import type { ProfileRow } from "@/types/profile";

export const metadata = {
  title: "Správa uživatelů — PastryCalc",
  description: "Přidělení a odebrání role administrátora",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/users");
  }

  const { data: rows, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role")
    .order("email", { ascending: true, nullsFirst: false });

  if (error) {
    return (
      <GlassCard className="p-6 md:p-8">
        <p className="text-sm text-red-700">
          Nelze načíst uživatele: {error.message}
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Ověřte, že v Supabase běží migrace{" "}
          <code className="rounded bg-white/60 px-1">
            supabase/migrations/20250326120000_profiles_admin_trigger.sql
          </code>
          .
        </p>
      </GlassCard>
    );
  }

  const profiles = (rows ?? []) as ProfileRow[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 md:text-3xl">
            Správa uživatelů
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Udělte nebo odeberte roli administrátora. První registrovaný účet je
            administrátor automaticky.
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border border-white/50 bg-white/50 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-gold/35 hover:bg-gold-muted"
        >
          Zpět do aplikace
        </Link>
      </div>

      <GlassCard className="p-6 md:p-8">
        {profiles.length === 0 ? (
          <p className="text-sm text-slate-600">
            Žádné profily. Po přihlášení prvního uživatele se profil vytvoří
            automaticky.
          </p>
        ) : (
          <UserManagementTable
            profiles={profiles}
            currentUserId={user.id}
          />
        )}
      </GlassCard>
    </div>
  );
}
