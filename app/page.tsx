"use client";

import { motion } from "framer-motion";
import { AppBrandBar } from "@/components/layout/AppBrandBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { RecipeGrid } from "@/components/recipe/RecipeGrid";
import { RecipeDetail } from "@/components/recipe/RecipeDetail";
import { RecipeFormModal } from "@/components/recipe/RecipeFormModal";
import { ConfirmDeleteModal } from "@/components/recipe/ConfirmDeleteModal";
import { CategoryBrowseHero } from "@/components/recipe/CategoryBrowseHero";
import { useRecipe } from "@/context/RecipeContext";

const transitionEase = [0.22, 1, 0.36, 1] as const;

export default function HomePage() {
  const {
    hydrated,
    categories,
    activeCategory,
    filteredRecipes,
    activeRecipe,
  } = useRecipe();

  if (!hydrated) {
    return (
      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 text-slate-500">
        Načítám recepty…
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="relative z-10 mx-auto max-w-lg px-6 py-20 text-center text-slate-600">
        <p className="text-lg">Žádné recepty v databázi.</p>
        <p className="mt-2 text-sm text-slate-500">
          Vymažte localStorage klíč{" "}
          <code className="rounded bg-white/50 px-1">pastrycalc-recipes-v1</code>{" "}
          a obnovte stránku pro obnovení výchozích dat.
        </p>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-[1680px] flex-col px-4 pb-8 pt-8 md:px-8 md:pb-12 md:pt-8 lg:px-12">
      <AppBrandBar />

      <div className="flex min-h-0 flex-1 flex-col gap-8 md:flex-row md:gap-8">
        <Sidebar />

        <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
          {activeRecipe ? (
            <motion.div
              key={`detail-${activeRecipe.id}`}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, ease: transitionEase }}
              className="flex w-full min-h-0 flex-1 flex-col"
            >
              <RecipeDetail recipe={activeRecipe} />
            </motion.div>
          ) : (
            <motion.div
              key="browse"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.28, ease: transitionEase }}
              className="flex min-h-0 flex-1 flex-col gap-6 rounded-2xl border border-white/50 bg-white/40 p-6 shadow-glass backdrop-blur-xl md:gap-8 md:rounded-3xl md:p-8"
            >
                <motion.header
                  className="border-b border-white/30 pb-4"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.05, ease: transitionEase }}
                >
                  <h2 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                    Recepty
                  </h2>
                  <p className="mt-2 max-w-2xl text-pretty text-sm text-slate-500 md:mt-3 md:text-base">
                    Vyberte kategorii v postranním panelu.
                    {filteredRecipes.length > 0 ? (
                      <>
                        {" "}
                        Klikněte na kartu níže — zobrazí se přepočet surovin a
                        poznámky.
                      </>
                    ) : null}
                  </p>
                </motion.header>

                <CategoryBrowseHero category={activeCategory} />

                <RecipeGrid />
              </motion.div>
            )}
        </main>
      </div>

      <RecipeFormModal />
      <ConfirmDeleteModal />
    </div>
  );
}
