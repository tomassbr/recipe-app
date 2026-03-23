"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Pencil } from "lucide-react";
import type { Recipe } from "@/types/recipe";
import { useRecipeCalculator } from "@/composables/useRecipeCalculator";
import { useRecipe } from "@/context/RecipeContext";
import { IngredientRow } from "./IngredientRow";

type RecipeDetailProps = {
  recipe: Recipe;
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const { setActiveRecipeId, manageMode, openEditRecipe } = useRecipe();
  const [targetYield, setTargetYield] = useState(recipe.baseYield);

  useEffect(() => {
    setTargetYield(recipe.baseYield);
  }, [recipe.id, recipe.baseYield]);

  const { coefficient, scaledRecipe, componentBatchSummaries } =
    useRecipeCalculator(recipe, targetYield);

  const singleComponent = (recipe.components?.length ?? 0) === 1;

  return (
    <div className="relative z-0 flex min-h-0 flex-1 flex-col gap-8 rounded-2xl border border-white/50 bg-white/40 p-6 shadow-glass backdrop-blur-xl md:gap-8 md:rounded-3xl md:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <motion.button
          type="button"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          whileHover={{ x: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveRecipeId(null)}
          className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-white/50 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-gold/45 hover:bg-gold-muted hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          Zpět na recepty
        </motion.button>
        <button
          type="button"
          disabled={!manageMode}
          title={
            manageMode
              ? "Upravit recept"
              : "Zapněte režim Správa v postranním panelu"
          }
          onClick={() => manageMode && openEditRecipe(recipe)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm ${
            manageMode
              ? "border-gold/35 bg-white/50 text-slate-800 hover:border-gold/50 hover:bg-gold-muted"
              : "cursor-not-allowed border-white/40 bg-white/30 text-slate-400"
          }`}
        >
          <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Upravit
        </button>
      </div>

      <motion.header
        className="space-y-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
      >
        <h1 className="text-3xl font-bold leading-[1.15] tracking-tight text-slate-800 md:text-4xl">
          {recipe.name}
        </h1>
        {recipe.note ? (
          <p className="max-w-3xl text-base leading-relaxed text-slate-500 md:text-lg">
            {recipe.note}
          </p>
        ) : null}
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-white/75 via-white/55 to-white/45 p-6 shadow-glass-gold ring-1 ring-gold/20 backdrop-blur-xl md:rounded-3xl md:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.1),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative space-y-4 md:space-y-6">
          <label
            htmlFor="target-yield"
            className="flex flex-wrap items-baseline gap-2 text-lg font-semibold tracking-tight text-slate-800"
          >
            Cílové netto / počet
            <span className="rounded-full bg-gold-muted px-3 py-1 text-sm font-bold tabular-nums text-gold-dark">
              {recipe.yieldUnit}
            </span>
          </label>
          <p className="text-sm text-slate-500">
            Upravte hodnotu — přepočet všech surovin proběhne okamžitě.
          </p>
          <input
            id="target-yield"
            type="number"
            inputMode="decimal"
            step="any"
            value={Number.isFinite(targetYield) ? targetYield : ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "" || raw === "-") {
                setTargetYield(0);
                return;
              }
              const n = parseFloat(raw);
              if (!Number.isNaN(n)) {
                setTargetYield(n);
              }
            }}
            className="w-full max-w-lg rounded-2xl border-2 border-gold/35 bg-white/85 px-6 py-4 text-3xl font-semibold text-slate-800 tabular-nums shadow-inner outline-none transition-[border-color,box-shadow] focus:border-gold focus:ring-4 focus:ring-gold/20 md:max-w-xl md:text-4xl"
          />
          <p className="text-sm tabular-nums text-slate-500">
            Koeficient (live):{" "}
            <motion.span
              key={Number.isFinite(coefficient) ? coefficient.toFixed(8) : "nan"}
              initial={{ opacity: 0.35, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block font-medium text-gold-dark"
            >
              {Number.isFinite(coefficient) ? coefficient.toFixed(6) : "—"}
            </motion.span>
          </p>
        </div>
      </motion.div>

      <div className="flex min-h-0 flex-col gap-8 overflow-auto md:gap-10">
        {(recipe.components ?? []).map((component, ci) => (
          <motion.section
            key={component.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.32,
              delay: 0.12 + ci * 0.05,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="min-w-0"
          >
            <h2 className="mb-4 flex items-center gap-4 text-xl font-bold tracking-tight text-slate-800 md:text-2xl">
              <span
                className="h-8 w-1 rounded-full bg-gradient-to-b from-gold to-gold-dark"
                aria-hidden
              />
              {component.name}
            </h2>
            <div className="overflow-x-auto rounded-xl border border-white/45 bg-white/30 shadow-inner backdrop-blur-md">
              <table className="w-full min-w-[300px] border-collapse text-sm md:text-base">
                <thead>
                  <tr className="border-b border-white/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-4">Surovina</th>
                    <th className="px-4 py-4 text-right tabular-nums">
                      Původní
                    </th>
                    <th className="px-4 py-4 text-right tabular-nums">
                      Přepočet
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {component.ingredients.map((ing, idx) => (
                    <IngredientRow
                      key={`${component.id}-${idx}-${ing.name}`}
                      originalIngredient={ing}
                      scaledIngredient={
                        scaledRecipe.components[ci].ingredients[idx]
                      }
                      recalcKey={`${targetYield}`}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/20 bg-white/15 text-slate-800">
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-left text-sm font-semibold"
                    >
                      {singleComponent
                        ? "Součet receptury"
                        : "Součet komponenty"}
                    </td>
                    <td
                      className="px-4 py-3 text-right text-sm font-semibold tabular-nums text-gold-dark"
                      title="Součet přepočtu podle jednotek v řádcích (hmotnosti v g, ks a další zvlášť)"
                    >
                      {componentBatchSummaries[ci]?.displayLine ?? "—"}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
