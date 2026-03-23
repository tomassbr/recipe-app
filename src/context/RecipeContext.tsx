"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Recipe } from "@/types/recipe";
import { usePersistedRecipes } from "@/composables/usePersistedRecipes";

const STORAGE_MANAGE = "pastrycalc-manage-v1";

function uniqueCategories(recipes: Recipe[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const r of recipes) {
    if (!seen.has(r.category)) {
      seen.add(r.category);
      out.push(r.category);
    }
  }
  return out.sort((a, b) => a.localeCompare(b, "cs"));
}

function loadManageMode(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_MANAGE) === "1";
}

export type RecipeContextValue = {
  recipes: Recipe[];
  hydrated: boolean;
  manageMode: boolean;
  setManageMode: (v: boolean | ((prev: boolean) => boolean)) => void;

  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  categorySlideDir: number;

  /** Full-text filter within the active category (name) */
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  /** Recipes in active category after search */
  filteredRecipes: Recipe[];

  /** Selected recipe in browse/detail */
  activeRecipeId: string | null;
  setActiveRecipeId: (id: string | null) => void;
  activeRecipe: Recipe | undefined;

  getRecipeById: (id: string) => Recipe | undefined;

  addRecipe: (recipe: Recipe) => void;
  updateRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  /** Create or update from form modal (uses `editingId` internally). */
  persistRecipe: (recipe: Recipe) => void;

  /** Form modal */
  editorOpen: boolean;
  editingRecipe: Recipe | null;
  openCreateRecipe: () => void;
  openEditRecipe: (recipe: Recipe) => void;
  closeEditor: () => void;

  deleteTarget: Recipe | null;
  setDeleteTarget: (recipe: Recipe | null) => void;
};

const RecipeContext = createContext<RecipeContextValue | null>(null);

export function RecipeProvider({ children }: { children: ReactNode }) {
  const { recipes, setRecipes, hydrated } = usePersistedRecipes();
  const [manageMode, setManageModeState] = useState(false);

  const [activeCategory, setActiveCategoryState] = useState("");
  const [categorySlideDir, setCategorySlideDir] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Recipe | null>(null);

  useEffect(() => {
    setManageModeState(loadManageMode());
  }, []);

  const setManageMode = useCallback(
    (v: boolean | ((prev: boolean) => boolean)) => {
      setManageModeState((prev) => {
        const next = typeof v === "function" ? v(prev) : v;
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_MANAGE, next ? "1" : "0");
        }
        return next;
      });
    },
    []
  );

  const categories = useMemo(() => uniqueCategories(recipes), [recipes]);

  useEffect(() => {
    if (!hydrated || !categories.length) return;
    if (!activeCategory || !categories.includes(activeCategory)) {
      setActiveCategoryState(categories[0]);
    }
  }, [hydrated, categories, activeCategory]);

  const getRecipeById = useCallback(
    (id: string) => recipes.find((r) => r.id === id),
    [recipes]
  );

  useEffect(() => {
    if (!activeRecipeId) return;
    if (!getRecipeById(activeRecipeId)) {
      setActiveRecipeId(null);
    }
  }, [getRecipeById, activeRecipeId]);

  const setActiveCategory = useCallback(
    (category: string) => {
      if (category !== activeCategory) {
        const pi = categories.indexOf(activeCategory);
        const ni = categories.indexOf(category);
        if (pi >= 0 && ni >= 0) {
          setCategorySlideDir(ni > pi ? 1 : -1);
        }
      }
      setActiveCategoryState(category);
      setActiveRecipeId(null);
    },
    [activeCategory, categories]
  );

  const filteredRecipes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return recipes.filter(
      (r) =>
        r.category === activeCategory &&
        (q === "" || r.name.toLowerCase().includes(q))
    );
  }, [recipes, activeCategory, searchQuery]);

  const activeRecipe = activeRecipeId
    ? getRecipeById(activeRecipeId)
    : undefined;

  const editingRecipe = editingId
    ? getRecipeById(editingId) ?? null
    : null;

  const addRecipe = useCallback((recipe: Recipe) => {
    setRecipes((prev) => [...prev, recipe]);
  }, [setRecipes]);

  const updateRecipe = useCallback((recipe: Recipe) => {
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipe.id ? recipe : r))
    );
  }, [setRecipes]);

  const deleteRecipe = useCallback((id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }, [setRecipes]);

  const openCreateRecipe = useCallback(() => {
    setEditingId(null);
    setEditorOpen(true);
  }, []);

  const openEditRecipe = useCallback((recipe: Recipe) => {
    setEditingId(recipe.id);
    setEditorOpen(true);
  }, []);

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingId(null);
  }, []);

  const persistRecipe = useCallback(
    (recipe: Recipe) => {
      if (editingId) {
        updateRecipe(recipe);
      } else {
        addRecipe(recipe);
      }
    },
    [editingId, updateRecipe, addRecipe]
  );

  const value = useMemo<RecipeContextValue>(
    () => ({
      recipes,
      hydrated,
      manageMode,
      setManageMode,
      categories,
      activeCategory,
      setActiveCategory,
      categorySlideDir,
      searchQuery,
      setSearchQuery,
      filteredRecipes,
      activeRecipeId,
      setActiveRecipeId,
      activeRecipe,
      getRecipeById,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      persistRecipe,
      editorOpen,
      editingRecipe,
      openCreateRecipe,
      openEditRecipe,
      closeEditor,
      deleteTarget,
      setDeleteTarget,
    }),
    [
      recipes,
      hydrated,
      manageMode,
      setManageMode,
      categories,
      activeCategory,
      setActiveCategory,
      categorySlideDir,
      searchQuery,
      filteredRecipes,
      activeRecipeId,
      activeRecipe,
      getRecipeById,
      addRecipe,
      updateRecipe,
      deleteRecipe,
      persistRecipe,
      editorOpen,
      editingRecipe,
      openCreateRecipe,
      openEditRecipe,
      closeEditor,
      deleteTarget,
    ]
  );

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
}

export function useRecipe(): RecipeContextValue {
  const ctx = useContext(RecipeContext);
  if (!ctx) {
    throw new Error("useRecipe must be used within RecipeProvider");
  }
  return ctx;
}

/** @deprecated Use `useRecipe` */
export function useRecipesContext(): RecipeContextValue {
  return useRecipe();
}
