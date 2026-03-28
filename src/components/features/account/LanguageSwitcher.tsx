"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { setLocale } from "@/actions/locale";
import { cn } from "@/utils/cn";

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const t = useTranslations("account");
  const [isPending, startTransition] = useTransition();

  const handleChange = (locale: string) => {
    startTransition(async () => {
      await setLocale(locale);
      // Hard reload so the new locale takes effect everywhere (server components)
      window.location.reload();
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-slate-700">{t("language")}</p>
      <div className="flex gap-2">
        {(["cs", "en"] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            disabled={isPending || currentLocale === locale}
            onClick={() => handleChange(locale)}
            className={cn(
              "rounded-full border px-5 py-2 text-sm font-medium transition-colors",
              currentLocale === locale
                ? "border-gold/50 bg-gold-muted text-slate-900 shadow-sm"
                : "border-white/50 bg-white/50 text-slate-600 hover:border-gold/35 hover:bg-gold-muted/50",
              "disabled:cursor-default"
            )}
          >
            {locale === "cs" ? t("langCs") : t("langEn")}
          </button>
        ))}
      </div>
    </div>
  );
}
