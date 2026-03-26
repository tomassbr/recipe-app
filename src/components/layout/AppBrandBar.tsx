"use client";

import { motion } from "framer-motion";
import { ChefHat, Plus } from "lucide-react";
import { useRecipe } from "@/composables/useRecipe";
import { UserNav } from "@/components/auth/UserNav";
import { GlassCard } from "@/components/ui";
import { cn } from "@/utils/cn";

export function AppBrandBar() {
  const { effectiveManageMode, openCreateRecipe } = useRecipe();

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="mb-8"
    >
      <GlassCard className="flex flex-wrap items-center justify-between gap-6 px-6 py-6 md:px-8 md:py-8">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold-muted/80 text-gold-dark shadow-sm">
            <ChefHat className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 md:text-2xl">
              PastryCalc
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Přepočty receptur pro cukráře
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-3">
          <UserNav />
          <button
            type="button"
            disabled={!effectiveManageMode}
            onClick={openCreateRecipe}
            title={
              effectiveManageMode
                ? "Přidat nový recept"
                : "Režim Správa je dostupný jen administrátorům (postranní panel)."
            }
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium shadow-sm backdrop-blur-sm transition-colors",
              effectiveManageMode
                ? "border-gold/35 bg-white/60 text-slate-800 hover:border-gold/50 hover:bg-gold-muted"
                : "cursor-not-allowed border-white/40 bg-white/30 text-slate-400"
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
            Nový recept
          </button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
