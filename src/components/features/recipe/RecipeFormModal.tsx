"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Component, Ingredient, Recipe } from "@/types/recipe";
import { validateRecipe } from "@/utils/recipeValidation";
import { useRecipe } from "@/hooks/useRecipe";
import { Button, GlassModal, Input, Textarea } from "@/components/common";
import { cn } from "@/utils/cn";

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

function emptyIngredient(): Ingredient {
  return { name: "", baseAmount: 1, unit: "g" };
}

function emptyComponent(defaultName: string): Component {
  return {
    id: newId("comp"),
    name: defaultName,
    ingredients: [emptyIngredient()],
  };
}

function emptyRecipeDraft(categoryHint: string, defaultComponentName: string): Recipe {
  return {
    id: newId("recipe"),
    name: "",
    category: categoryHint || "",
    baseYield: 1,
    yieldUnit: "g",
    note: "",
    components: [emptyComponent(defaultComponentName)],
  };
}

const compactInput =
  "rounded-lg border border-white/50 bg-white/50 px-2 py-2 text-sm focus:ring-1";

export function RecipeFormModal() {
  const t = useTranslations("recipeForm");
  const tCtx = useTranslations("recipeContext");
  const {
    editorOpen,
    closeEditor,
    editingRecipe,
    activeCategory,
    categories,
    persistRecipe,
    isAdmin,
    profileRoleHydrated,
  } = useRecipe();

  const [draft, setDraft] = useState<Recipe>(() =>
    emptyRecipeDraft(activeCategory, t("defaultComponentName"))
  );
  const [error, setError] = useState<string | null>(null);

  const isEdit = editingRecipe != null;

  useEffect(() => {
    if (!editorOpen) return;
    setError(null);
    if (editingRecipe) {
      setDraft(JSON.parse(JSON.stringify(editingRecipe)) as Recipe);
    } else {
      setDraft(emptyRecipeDraft(activeCategory, t("defaultComponentName")));
    }
  }, [editorOpen, editingRecipe, activeCategory, t]);

  useEffect(() => {
    if (!profileRoleHydrated || !editorOpen) return;
    if (!isAdmin) {
      closeEditor();
      toast.error(tCtx("mutationForbidden"));
    }
  }, [profileRoleHydrated, isAdmin, editorOpen, closeEditor, tCtx]);

  const categoryOptions = useMemo(() => {
    const s = new Set(categories);
    if (draft.category) s.add(draft.category);
    return Array.from(s).sort((a, b) => a.localeCompare(b, "cs"));
  }, [categories, draft.category]);

  const setField = <K extends keyof Recipe>(key: K, value: Recipe[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const updateComponent = (ci: number, patch: Partial<Component>) => {
    setDraft((d) => {
      const next = { ...d, components: [...d.components] };
      next.components[ci] = { ...next.components[ci], ...patch };
      return next;
    });
  };

  const addComponent = () => {
    setDraft((d) => ({
      ...d,
      components: [...d.components, emptyComponent(t("defaultComponentName"))],
    }));
  };

  const removeComponent = (ci: number) => {
    setDraft((d) => ({
      ...d,
      components: d.components.filter((_, i) => i !== ci),
    }));
  };

  const updateIngredient = (ci: number, ii: number, patch: Partial<Ingredient>) => {
    setDraft((d) => {
      const comps = [...d.components];
      const ings = [...comps[ci].ingredients];
      ings[ii] = { ...ings[ii], ...patch };
      comps[ci] = { ...comps[ci], ingredients: ings };
      return { ...d, components: comps };
    });
  };

  const addIngredient = (ci: number) => {
    setDraft((d) => {
      const comps = [...d.components];
      comps[ci] = { ...comps[ci], ingredients: [...comps[ci].ingredients, emptyIngredient()] };
      return { ...d, components: comps };
    });
  };

  const removeIngredient = (ci: number, ii: number) => {
    setDraft((d) => {
      const comps = [...d.components];
      const ings = comps[ci].ingredients.filter((_, i) => i !== ii);
      comps[ci] = { ...comps[ci], ingredients: ings };
      return { ...d, components: comps };
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v = validateRecipe(draft);
    if (!v.ok) { setError(v.message); return; }
    setError(null);
    persistRecipe(draft);
    closeEditor();
  };

  return (
    <GlassModal
      open={editorOpen}
      onClose={closeEditor}
      wide
      title={isEdit ? t("editTitle") : t("newTitle")}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {error ? (
          <p role="alert" className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-800">
            {error}
          </p>
        ) : null}

        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("sectionBase")}
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">{t("labelName")}</span>
              <Input required value={draft.name} onChange={(e) => setField("name", e.target.value)} />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">{t("labelCategory")}</span>
              <Input required list="recipe-categories" value={draft.category} onChange={(e) => setField("category", e.target.value)} />
              <datalist id="recipe-categories">
                {categoryOptions.map((c) => <option key={c} value={c} />)}
              </datalist>
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">{t("labelBaseYield")}</span>
              <Input type="number" min={0.0001} step="any" required value={draft.baseYield}
                onChange={(e) => setField("baseYield", parseFloat(e.target.value) || 0)}
                className="tabular-nums" />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">{t("labelYieldUnit")}</span>
              <select value={draft.yieldUnit} onChange={(e) => setField("yieldUnit", e.target.value as Recipe["yieldUnit"])}
                className={cn("w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-slate-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/25")}>
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ks">ks</option>
              </select>
            </label>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">{t("labelNote")}</span>
            <Textarea value={draft.note ?? ""} onChange={(e) => setField("note", e.target.value || undefined)} rows={2} />
          </label>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t("sectionComponents")}
            </h3>
            <Button type="button" variant="primary" onClick={addComponent}
              className="border-gold/35 bg-gold-muted/80 px-4 py-3 font-medium text-slate-800 hover:border-gold/50">
              <Plus className="h-4 w-4" aria-hidden />
              {t("addComponent")}
            </Button>
          </div>

          {draft.components.map((comp, ci) => (
            <div key={comp.id} className="rounded-2xl border border-white/45 bg-white/25 p-4 md:p-6">
              <div className="mb-4 flex flex-wrap items-end gap-3">
                <label className="min-w-0 flex-1 space-y-2">
                  <span className="text-xs font-medium text-slate-600">{t("labelComponentName")}</span>
                  <Input value={comp.name} onChange={(e) => updateComponent(ci, { name: e.target.value })} className={compactInput} />
                </label>
                {draft.components.length > 1 ? (
                  <Button type="button" variant="danger" onClick={() => removeComponent(ci)}
                    className="gap-1 rounded-lg border-red-200/80 bg-red-50/80 px-3 py-2 text-sm text-red-800 hover:bg-red-100/80">
                    <Trash2 className="h-4 w-4" aria-hidden />
                    {t("removeComponent")}
                  </Button>
                ) : null}
              </div>

              <div className="space-y-3">
                {comp.ingredients.map((ing, ii) => (
                  <div key={`${comp.id}-${ii}`}
                    className="grid gap-4 rounded-xl border border-white/35 bg-white/30 p-4 md:grid-cols-12 md:items-end">
                    <label className="md:col-span-4">
                      <span className="mb-1 block text-xs text-slate-600">{t("labelIngredient")}</span>
                      <Input value={ing.name} onChange={(e) => updateIngredient(ci, ii, { name: e.target.value })} className={compactInput} />
                    </label>
                    <label className="md:col-span-2">
                      <span className="mb-1 block text-xs text-slate-600">{t("labelAmount")}</span>
                      <Input type="number" min={0.0001} step="any" value={ing.baseAmount}
                        onChange={(e) => updateIngredient(ci, ii, { baseAmount: parseFloat(e.target.value) || 0 })}
                        className={cn(compactInput, "tabular-nums")} />
                    </label>
                    <label className="md:col-span-2">
                      <span className="mb-1 block text-xs text-slate-600">{t("labelUnit")}</span>
                      <Input value={ing.unit} onChange={(e) => updateIngredient(ci, ii, { unit: e.target.value })} className={compactInput} />
                    </label>
                    <label className="md:col-span-3">
                      <span className="mb-1 block text-xs text-slate-600">{t("labelIngredientNote")}</span>
                      <Input value={ing.note ?? ""} onChange={(e) => updateIngredient(ci, ii, { note: e.target.value || undefined })} className={compactInput} />
                    </label>
                    <div className="flex md:col-span-1 md:justify-end">
                      {comp.ingredients.length > 1 ? (
                        <Button type="button" variant="ghost" onClick={() => removeIngredient(ci, ii)}
                          className="rounded-lg border border-white/50 p-2 text-slate-500 hover:bg-red-50 hover:text-red-800"
                          aria-label={t("removeIngredient")}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addIngredient(ci)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-gold-dark hover:underline">
                  <Plus className="h-4 w-4" />
                  {t("addIngredient")}
                </button>
              </div>
            </div>
          ))}
        </section>

        <div className="flex flex-wrap justify-end gap-3 border-t border-white/40 pt-6">
          <Button type="button" variant="secondary" onClick={closeEditor}>{t("cancel")}</Button>
          <Button type="submit" variant="primary">
            {isEdit ? t("save") : t("create")}
          </Button>
        </div>
      </form>
    </GlassModal>
  );
}
