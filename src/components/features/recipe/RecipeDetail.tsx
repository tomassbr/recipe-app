"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Recipe } from "@/types/recipe";
import { useRecipe, useRecipeDetailScaling } from "@/hooks/useRecipe";
import { GlassCard, GlassInput, GlassTable } from "@/components/ui";
import { formatScaledAmountDisplay } from "@/utils/recipeAmount";
import { IngredientRow } from "./IngredientRow";

type RecipeDetailProps = {
  recipe: Recipe;
};

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const t = useTranslations("recipeDetail");
  const { setActiveRecipeId, effectiveManageMode, openEditRecipe } = useRecipe();
  const {
    targetYield,
    setTargetYield,
    pieceCounts,
    setPieceCount,
    coefficient,
    scaledRecipe,
    componentBatchSummaries,
  } = useRecipeDetailScaling(recipe);

  const singleComponent = (recipe.components?.length ?? 0) === 1;
  const pieceOptions =
    recipe.yieldUnit === "g" ? recipe.pieceOptions ?? [] : [];

  return (
    <GlassCard className="relative z-0 flex min-h-0 flex-1 flex-col gap-8 p-6 md:gap-8 md:p-8">
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
          {t("back")}
        </motion.button>
        <button
          type="button"
          disabled={!effectiveManageMode}
          title={effectiveManageMode ? t("editTitle") : t("editHint")}
          onClick={() => effectiveManageMode && openEditRecipe(recipe)}
          className={`inline-flex items-center gap-2 rounded-full border px-4 py-3 text-sm ${
            effectiveManageMode
              ? "border-gold/35 bg-white/50 text-slate-800 hover:border-gold/50 hover:bg-gold-muted"
              : "cursor-not-allowed border-white/40 bg-white/30 text-slate-400"
          }`}
        >
          <Pencil className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          {t("edit")}
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
          <p className="max-w-3xl text-base leading-relaxed text-slate-600 md:text-lg">
            {recipe.note}
          </p>
        ) : null}
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-white/75 via-white/60 to-white/55 p-6 shadow-glass-gold ring-1 ring-gold/20 backdrop-blur-xl md:rounded-3xl md:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(212,175,55,0.1),_transparent_55%)]"
          aria-hidden
        />
        <div className="relative space-y-4 md:space-y-6">
          {pieceOptions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold tracking-tight text-slate-800">
                {t("pieceModeTitle")}
              </p>
              <p className="text-sm text-slate-600">{t("piecesHint")}</p>
              <div className="flex flex-wrap gap-4">
                {pieceOptions.map((opt, i) => (
                  <label key={opt.name} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {opt.name}{" "}
                      <span className="rounded-full bg-gold-muted px-2 py-0.5 text-xs font-bold tabular-nums text-gold-dark">
                        {t("piecePerUnit", { grams: opt.grams })}
                      </span>
                    </span>
                    <GlassInput
                      type="number"
                      inputMode="numeric"
                      min={0}
                      step={1}
                      data-testid={`piece-count-${i}`}
                      value={pieceCounts[i] ?? ""}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, 10);
                        setPieceCount(i, Number.isNaN(n) || n < 0 ? 0 : n);
                      }}
                      className="max-w-[9rem]"
                    />
                    <span className="text-xs tabular-nums text-slate-500">
                      {t("pieceBatchYield", {
                        count: Math.round((recipe.baseYield / opt.grams) * 100) / 100,
                      })}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          <label
            htmlFor="target-yield"
            className="flex flex-wrap items-baseline gap-2 text-lg font-semibold tracking-tight text-slate-800"
          >
            {t("targetYield")}
            <span className="rounded-full bg-gold-muted px-3 py-1 text-sm font-bold tabular-nums text-gold-dark">
              {recipe.yieldUnit}
            </span>
          </label>
          <p className="text-sm text-slate-600">{t("yieldHint")}</p>
          <GlassInput
            id="target-yield"
            type="number"
            inputMode="decimal"
            step="any"
            variant="emphasis"
            data-testid="yield-input"
            value={Number.isFinite(targetYield) ? targetYield : ""}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "" || raw === "-") { setTargetYield(0); return; }
              const n = parseFloat(raw);
              if (!Number.isNaN(n)) setTargetYield(n);
            }}
            className="max-w-lg md:max-w-xl"
          />
          <p className="text-sm tabular-nums text-slate-600" aria-live="polite">
            {t("coefficient")}{" "}
            <motion.span
              key={Number.isFinite(coefficient) ? formatScaledAmountDisplay(coefficient) : "nan"}
              initial={{ opacity: 0.35, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block font-medium text-gold-dark"
            >
              {Number.isFinite(coefficient) ? formatScaledAmountDisplay(coefficient) : "—"}
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
            transition={{ duration: 0.32, delay: 0.12 + ci * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0"
          >
            <h2 className="mb-4 flex items-center gap-4 text-xl font-bold tracking-tight text-slate-800 md:text-2xl">
              <span className="h-8 w-1 rounded-full bg-gradient-to-b from-gold to-gold-dark" aria-hidden />
              {component.name}
            </h2>
            <GlassTable className="shadow-inner md:overflow-x-visible">
              <thead>
                <tr className="border-b border-white/50 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <th className="px-4 py-4 md:sticky md:top-0 md:z-10 md:rounded-tl-3xl md:bg-white/75 md:backdrop-blur-md">{t("colIngredient")}</th>
                  <th className="hidden px-4 py-4 text-right tabular-nums sm:table-cell md:sticky md:top-0 md:z-10 md:bg-white/75 md:backdrop-blur-md">{t("colOriginal")}</th>
                  <th className="px-4 py-4 text-right tabular-nums md:sticky md:top-0 md:z-10 md:rounded-tr-3xl md:bg-white/75 md:backdrop-blur-md">{t("colScaled")}</th>
                </tr>
              </thead>
              <tbody>
                {component.ingredients.map((ing, idx) => (
                  <IngredientRow
                    key={`${component.id}-${idx}-${ing.name}`}
                    originalIngredient={ing}
                    scaledIngredient={scaledRecipe.components[ci].ingredients[idx]}
                    recalcKey={`${targetYield}`}
                    data-testid="scaled-amount"
                  />
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gold/25 bg-gold-muted/40 text-slate-800">
                  <td className="px-4 py-3.5 text-left text-sm font-bold">
                    {singleComponent ? t("batchTotal") : t("componentTotal")}
                  </td>
                  <td className="hidden sm:table-cell" />
                  <td
                    className="px-4 py-3.5 text-right text-base font-bold tabular-nums text-gold-dark"
                    title={t("batchTotalHint")}
                    aria-live="polite"
                  >
                    {componentBatchSummaries[ci]?.displayLine ?? "—"}
                  </td>
                </tr>
              </tfoot>
            </GlassTable>
          </motion.section>
        ))}
      </div>
    </GlassCard>
  );
}
