"use client";

import { RecipeCard } from "./RecipeCard";
import { RecipeEmptyState } from "./RecipeEmptyState";
import { motion } from "framer-motion";
import { useRecipe } from "@/composables/useRecipe";

export function RecipeGrid() {
  const {
    filteredRecipes,
    activeCategory,
    setActiveRecipeId,
    effectiveManageMode,
    openEditRecipe,
    setDeleteTarget,
  } = useRecipe();

  if (filteredRecipes.length === 0) {
    return (
      <RecipeEmptyState variant="category-empty" category={activeCategory} />
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: { staggerChildren: 0.05, delayChildren: 0.06 },
        },
      }}
      className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3"
    >
      {filteredRecipes.map((r) => (
        <RecipeCard
          key={r.id}
          recipe={r}
          manageMode={effectiveManageMode}
          onEdit={openEditRecipe}
          onDelete={setDeleteTarget}
          onSelect={setActiveRecipeId}
        />
      ))}
    </motion.div>
  );
}
