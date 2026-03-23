"use client";

import type { Recipe } from "@/types/recipe";
import { motion } from "framer-motion";
import { Pencil, Scale, Trash2 } from "lucide-react";
import { getCategoryIcon } from "@/utils/categoryIcons";

type RecipeCardProps = {
  recipe: Recipe;
  onSelect: (id: string) => void;
  manageMode?: boolean;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipe: Recipe) => void;
};

export function RecipeCard({
  recipe,
  onSelect,
  manageMode,
  onEdit,
  onDelete,
}: RecipeCardProps) {
  const CategoryIcon = getCategoryIcon(recipe.category);

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className="group/card flex h-full min-h-0 flex-col"
    >
      <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/50 bg-white/40 shadow-glass backdrop-blur-xl">
        {manageMode ? (
          <div className="relative z-20 flex shrink-0 items-center justify-end gap-2 border-b border-white/40 bg-white/40 px-4 py-3 backdrop-blur-md md:px-4 md:py-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit?.(recipe);
              }}
              className="inline-flex h-8 min-w-[2rem] shrink-0 items-center justify-center rounded-xl border border-white/60 bg-white/80 px-2 text-gold-dark shadow-sm backdrop-blur-sm transition-colors hover:border-gold/50 hover:bg-gold-muted"
              title="Upravit"
            >
              <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onDelete?.(recipe);
              }}
              className="inline-flex h-8 min-w-[2rem] shrink-0 items-center justify-center rounded-xl border border-red-200/80 bg-red-50/90 px-2 text-red-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-red-100"
              title="Smazat"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            </button>
          </div>
        ) : null}
        <motion.button
          type="button"
          layout
          whileHover={{
            y: -4,
            scale: 1.01,
            boxShadow:
              "0 20px 48px -12px rgba(217, 119, 6, 0.22), 0 0 0 1px rgba(212, 175, 55, 0.28), 0 0 40px -8px rgba(251, 191, 36, 0.35)",
          }}
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 28,
          }}
          whileTap={{ scale: 0.985 }}
          onClick={() => onSelect(recipe.id)}
          className="relative flex min-h-[120px] flex-1 flex-col gap-4 overflow-hidden p-6 text-left md:min-h-[128px] md:p-8"
        >
          <div className="flex min-w-0 items-start justify-between gap-4">
            <span className="min-w-0 flex-1 line-clamp-2 text-lg font-bold tracking-tight text-slate-800 group-hover/card:text-slate-900 md:text-xl">
              {recipe.name}
            </span>
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white/60 text-gold-dark shadow-md backdrop-blur-md">
              <CategoryIcon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between gap-3">
            <span className="tabular-nums text-sm text-slate-600">
              <span className="font-semibold text-gold-dark/90">
                {recipe.baseYield}
              </span>{" "}
              {recipe.yieldUnit}
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/60 bg-white/45 text-slate-500 shadow-sm backdrop-blur-sm">
              <Scale className="h-4 w-4" strokeWidth={1.5} aria-hidden />
            </span>
          </div>
        </motion.button>
      </div>
    </motion.div>
  );
}
