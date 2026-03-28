"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import * as Sentry from "@sentry/nextjs";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="rounded-2xl border border-white/40 bg-white/50 p-8 shadow-glass backdrop-blur-xl">
        <h2 className="mb-2 text-xl font-semibold text-slate-800">{t("adminHeading")}</h2>
        <p className="mb-6 text-sm text-slate-500">
          {error.digest ? t("digest", { digest: error.digest }) : t("adminGeneric")}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {t("retry")}
          </button>
          <Link
            href="/"
            className="rounded-xl border border-slate-200 bg-white/70 px-5 py-2 text-sm font-medium text-slate-700 hover:bg-white active:scale-95 transition-all"
          >
            {t("backToApp")}
          </Link>
        </div>
      </div>
    </div>
  );
}
