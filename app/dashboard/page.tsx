import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { GlassCard } from "@/components/ui";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <GlassCard className="space-y-6 px-8 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          Nástěnka
        </h1>
        <p className="text-sm text-slate-600">
          Přihlášený uživatel:{" "}
          <span className="font-medium text-slate-800">
            {user?.email ?? "—"}
          </span>
        </p>
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-gold-dark underline-offset-4 hover:underline"
        >
          Zpět na recepty
        </Link>
      </GlassCard>
    </div>
  );
}
