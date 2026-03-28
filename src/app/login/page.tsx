import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LoginContent } from "@/components/features/auth/LoginContent";

export default async function LoginPage() {
  const t = await getTranslations("login");
  return (
    <Suspense
      fallback={
        <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-slate-500">
          {t("loading")}
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
