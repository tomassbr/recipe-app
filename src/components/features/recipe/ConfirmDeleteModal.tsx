"use client";

import { useRecipe } from "@/hooks/useRecipe";
import { Button, GlassModal } from "@/components/common";

export function ConfirmDeleteModal() {
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
    <GlassModal open={open} onClose={handleClose} title="Smazat recept?">
      <div className="space-y-6">
        <p className="text-slate-600">
          Opravdu chcete trvale smazat recept{" "}
          <span className="font-semibold text-slate-800">„{recipeName}“</span>
          ? Tuto akci nelze vrátit zpět.
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Zrušit
          </Button>
          <Button type="button" variant="danger" onClick={handleConfirm}>
            Smazat
          </Button>
        </div>
      </div>
    </GlassModal>
  );
}
