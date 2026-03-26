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
import { toast } from "sonner";
import type { Recipe } from "@/types/recipe";
import { usePersistedRecipes } from "@/composables/usePersistedRecipes";
import { useSessionProfile } from "@/context/SessionProfileContext";

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
  /** Správa v UI jen pro administrátory (ignoruje localStorage / DevTools). */
  effectiveManageMode: boolean;
  isAdmin: boolean;
  profileRoleHydrated: boolean;

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

/** Zobrazení při pokusu neadmina měnit data receptů (UI + server actions). */
export const RECIPE_MUTATION_FORBIDDEN_MESSAGE =
  "Úpravy receptů smí provádět pouze administrátor. Přihlaste se účtem s rolí admin.";

export function RecipeProvider({ children }: { children: ReactNode }) {
  const { recipes, setRecipes, hydrated } = usePersistedRecipes();
  const { isAdmin, profileHydrated: profileRoleHydrated } = useSessionProfile();
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

  useEffect(() => {
    if (!profileRoleHydrated) return;
    if (!isAdmin && manageMode) {
      setManageModeState(false);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_MANAGE, "0");
      }
    }
  }, [profileRoleHydrated, isAdmin, manageMode]);

  const setManageMode = useCallback(
    (v: boolean | ((prev: boolean) => boolean)) => {
      setManageModeState((prev) => {
        const next = typeof v === "function" ? v(prev) : v;
        if (next && !isAdmin) {
          toast.error(RECIPE_MUTATION_FORBIDDEN_MESSAGE);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_MANAGE, "0");
          }
          return false;
        }
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_MANAGE, next ? "1" : "0");
        }
        return next;
      });
    },
    [isAdmin]
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

  const addRecipe = useCallback(
    (recipe: Recipe) => {
      if (!isAdmin) {
        toast.error(RECIPE_MUTATION_FORBIDDEN_MESSAGE);
        return;
      }
      setRecipes((prev) => [...prev, recipe]);
    },
    [isAdmin, setRecipes]
  );

  const updateRecipe = useCallback(
    (recipe: Recipe) => {
      if (!isAdmin) {
        toast.error(RECIPE_MUTATION_FORBIDDEN_MESSAGE);
        return;
      }
      setRecipes((prev) =>
        prev.map((r) => (r.id === recipe.id ? recipe : r))
      );
    },
    [isAdmin, setRecipes]
  );

  const deleteRecipe = useCallback(
    (id: string) => {
      if (!isAdmin) {
        toast.error(RECIPE_MUTATION_FORBIDDEN_MESSAGE);
        return;
      }
      setRecipes((prev) => prev.filter((r) => r.id !== id));
    },
    [isAdmin, setRecipes]
  );

  const openCreateRecipe = useCallback(() => {
    if (!isAdmin) {
      toast.error(RECIPE_MUTATION_FORBIDDEN_MESSAGE);
      return;
    }
    setEditingId(null);
    setEditorOpen(true);
  }, [isAdmin]);

  const openEditRecipe = useCallback(
    (recipe: Recipe) => {
      if (!isAdmin) {
        toast.error(RECIPE_MUTATION_FORBIDDEN_MESSAGE);
        return;
      }
      setEditingId(recipe.id);
      setEditorOpen(true);
    },
    [isAdmin]
  );

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setEditingId(null);
  }, []);

  const persistRecipe = useCallback(
    (recipe: Recipe) => {
      if (!isAdmin) {
        toast.error(RECIPE_MUTATION_FORBIDDEN_MESSAGE);
        return;
      }
      if (editingId) {
        updateRecipe(recipe);
      } else {
        addRecipe(recipe);
      }
    },
    [editingId, updateRecipe, addRecipe, isAdmin]
  );

  const setDeleteTargetGuarded = useCallback(
    (recipe: Recipe | null) => {
      if (recipe != null && !isAdmin) {
        toast.error(RECIPE_MUTATION_FORBIDDEN_MESSAGE);
        return;
      }
      setDeleteTarget(recipe);
    },
    [isAdmin]
  );

  const effectiveManageMode = manageMode && isAdmin;

  const value = useMemo<RecipeContextValue>(
    () => ({
      recipes,
      hydrated,
      manageMode,
      setManageMode,
      effectiveManageMode,
      isAdmin,
      profileRoleHydrated,
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
      setDeleteTarget: setDeleteTargetGuarded,
    }),
    [
      recipes,
      hydrated,
      manageMode,
      setManageMode,
      effectiveManageMode,
      isAdmin,
      profileRoleHydrated,
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
      setDeleteTargetGuarded,
    ]
  );

  return (
    <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>
  );
}

export function useRecipeContext(): RecipeContextValue {
  const ctx = useContext(RecipeContext);
  if (!ctx) {
    throw new Error("useRecipeContext must be used within RecipeProvider");
  }
  return ctx;
}

/** @deprecated Use `useRecipe` from `@/composables/useRecipe` */
export function useRecipesContext(): RecipeContextValue {
  return useRecipeContext();
}
