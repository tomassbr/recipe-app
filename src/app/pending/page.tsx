import { Hourglass } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui";
import { SignOutButton } from "@/components/features/auth/SignOutButton";

export default async function PendingPage() {
  const t = await getTranslations("pending");

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16">
      <GlassCard className="w-full space-y-6 px-8 py-10 text-center md:px-10 md:py-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 bg-gold-muted shadow-sm">
          <Hourglass className="h-6 w-6 text-gold-dark" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {t("heading")}
          </h1>
          <p className="mt-2 text-sm text-slate-600">{t("message")}</p>
        </div>
        <SignOutButton label={t("signOut")} />
      </GlassCard>
    </div>
  );
}
