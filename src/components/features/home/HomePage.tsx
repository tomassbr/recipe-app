"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AppBrandBar } from "@/components/features/layout/AppBrandBar";
import { Sidebar } from "@/components/features/layout/Sidebar";
import { RecipeGrid } from "@/components/features/recipe/RecipeGrid";
import { RecipeDetail } from "@/components/features/recipe/RecipeDetail";
import { RecipeFormModal } from "@/components/features/recipe/RecipeFormModal";
import { ConfirmDeleteModal } from "@/components/features/recipe/ConfirmDeleteModal";
import { CategoryBrowseHero } from "@/components/features/recipe/CategoryBrowseHero";
import { useRecipe } from "@/hooks/useRecipe";
import { GlassCard } from "@/components/ui";

const transitionEase = [0.22, 1, 0.36, 1] as const;

export default function HomePage() {
  const t = useTranslations("home");
  const {
    categories,
    activeCategory,
    filteredRecipes,
    activeRecipe,
  } = useRecipe();

  if (!categories.length) {
    return (
      <div className="relative z-10 mx-auto max-w-lg px-6 py-20 text-center text-slate-600">
        <p className="text-lg">{t("noRecipes")}</p>
        <p className="mt-2 text-sm text-slate-500">{t("noRecipesHint")}</p>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 pb-8 pt-8 md:px-8 md:pb-12 md:pt-8 lg:px-12">
      <AppBrandBar />

      <div className="flex min-h-0 flex-1 flex-col gap-8 md:flex-row md:items-start md:gap-8">
        <Sidebar />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col">
          {activeRecipe ? (
            <motion.div
              key={`detail-${activeRecipe.id}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, ease: transitionEase }}
              className="flex w-full min-h-0 min-w-0 flex-1 flex-col"
            >
              <RecipeDetail recipe={activeRecipe} />
            </motion.div>
          ) : (
            <motion.div
              key="browse"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, ease: transitionEase }}
              className="flex min-h-0 min-w-0 flex-1 flex-col"
            >
              <GlassCard className="flex min-h-0 flex-1 flex-col gap-6 p-6 md:gap-8 md:p-8">
                <motion.header
                  className="border-b border-white/30 pb-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05, ease: transitionEase }}
                >
                  <h2 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                    {t("heading")}
                  </h2>
                  <p className="mt-2 max-w-2xl text-pretty text-sm text-slate-500 md:mt-3 md:text-base">
                    {t("selectCategory")}
                    {filteredRecipes.length > 0 ? (
                      <> {t("clickCard")}</>
                    ) : null}
                  </p>
                </motion.header>

                <CategoryBrowseHero category={activeCategory} />
                <RecipeGrid />
              </GlassCard>
            </motion.div>
          )}
        </main>
      </div>

      <RecipeFormModal />
      <ConfirmDeleteModal />
    </div>
  );
}
