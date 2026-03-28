"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAccount } from "@/actions/account";
import { Button, GlassModal } from "@/components/common";
import { cn } from "@/utils/cn";

export function DeleteAccountSection() {
  const t = useTranslations("account");
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteAccount();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setConfirmOpen(false);
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <>
      <div className="rounded-2xl border border-red-200/60 bg-red-50/40 p-6">
        <h3 className="mb-1 text-sm font-semibold text-red-800">{t("dangerZone")}</h3>
        <p className="mb-4 text-xs leading-relaxed text-red-700/80">{t("deleteHint")}</p>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-red-300/70 bg-white/80 px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition-colors",
            "hover:border-red-400/80 hover:bg-red-50 hover:text-red-800"
          )}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {t("deleteAccount")}
        </button>
      </div>

      <GlassModal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t("deleteConfirmTitle")}>
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-slate-600">
            {t("deleteConfirmMessage")}
          </p>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              {t("deleteCancel")}
            </Button>
            <Button type="button" variant="danger" onClick={handleDelete} disabled={isPending}>
              {isPending ? t("deleting") : t("deleteConfirmButton")}
            </Button>
          </div>
        </div>
      </GlassModal>
    </>
  );
}
