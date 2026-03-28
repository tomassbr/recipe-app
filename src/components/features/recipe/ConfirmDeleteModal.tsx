"use client";

import { useTranslations } from "next-intl";
import { useRecipe } from "@/hooks/useRecipe";
import { Button, GlassModal } from "@/components/common";

export function ConfirmDeleteModal() {
  const t = useTranslations("confirmDelete");
  const {
    deleteTarget,
    setDeleteTarget,
    deleteRecipe,
    activeRecipeId,
    setActiveRecipeId,
  } = useRecipe();

  const open = deleteTarget != null;
  const recipeName = deleteTarget?.name ?? "";

  const handleClose = () => setDeleteTarget(null);

  const handleConfirm = () => {
    if (!deleteTarget) return;
    deleteRecipe(deleteTarget.id);
    if (activeRecipeId === deleteTarget.id) {
      setActiveRecipeId(null);
    }
    setDeleteTarget(null);
  };

  return (
    <GlassModal open={open} onClose={handleClose} title={t("title")}>
      <div className="space-y-6">
        <p className="text-slate-600">
          {t.rich("message", {
            name: recipeName,
            strong: (chunks) => (
              <span className="font-semibold text-slate-800">{chunks}</span>
            ),
          })}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t("cancel")}
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm}>
            {t("confirm")}
          </Button>
        </div>
      </div>
    </GlassModal>
  );
}
