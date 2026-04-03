import { getTranslations } from "next-intl/server";
import { GlassCard } from "@/components/ui";
import { SignOutButton } from "@/components/features/auth/SignOutButton";

export default async function PendingPage() {
  const t = await getTranslations("pending");

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-6 py-16">
      <GlassCard className="w-full space-y-6 px-8 py-10 text-center md:px-10 md:py-12">
        <div className="text-4xl">⏳</div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            {t("heading")}
          </h1>
          <p className="mt-2 text-sm text-slate-500">{t("message")}</p>
        </div>
        <SignOutButton label={t("signOut")} />
      </GlassCard>
    </div>
  );
}
