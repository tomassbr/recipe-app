import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui";
import { LanguageSwitcher } from "@/components/features/account/LanguageSwitcher";
import { DeleteAccountSection } from "@/components/features/account/DeleteAccountSection";

export async function generateMetadata() {
  const t = await getTranslations("account");
  return { title: t("title") };
}

export default async function DashboardPage() {
  const [supabase, t, locale] = await Promise.all([
    createClient(),
    getTranslations("account"),
    getLocale(),
  ]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-16">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToRecipes")}
        </Link>
      </div>

      <GlassCard className="space-y-8 px-8 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
          {t("title")}
        </h1>

        {/* User info */}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t("loggedInAs")}
          </p>
          <p className="text-sm font-medium text-slate-800">
            {user?.email ?? "—"}
          </p>
        </div>

        <hr className="border-slate-200/70" />

        {/* Language switcher */}
        <LanguageSwitcher currentLocale={locale} />

        <hr className="border-slate-200/70" />

        {/* Danger zone */}
        <DeleteAccountSection />
      </GlassCard>
    </div>
  );
}
