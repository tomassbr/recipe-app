"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import type { Recipe } from "@/types/recipe";
import { useSessionProfile } from "@/context/SessionProfileContext";
import { useTranslations } from "next-intl";
import {
  createRecipe as createRecipeAction,
  updateRecipe as updateRecipeAction,
  deleteRecipe as deleteRecipeAction,
} from "@/actions/recipes";

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

  addRecipe: (recipe: Recipe) => Promise<void>;
  updateRecipe: (recipe: Recipe) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  /** Create or update from form modal (uses `editingId` internally). */
  persistRecipe: (recipe: Recipe) => Promise<void>;

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


interface RecipeProviderProps {
  children: ReactNode;
  /** Server-fetched recipes passed from the page Server Component. */
  initialRecipes: Recipe[];
}

export function RecipeProvider({ children, initialRecipes }: RecipeProviderProps) {
  const t = useTranslations("recipeContext");
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  // Track current recipes in a ref to avoid stale closures in callbacks
  const recipesRef = useRef<Recipe[]>(initialRecipes);
  useEffect(() => {
    recipesRef.current = recipes;
  }, [recipes]);

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
          toast.error(t("mutationForbidden"));
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
    if (!categories.length) return;
    if (!activeCategory || !categories.includes(activeCategory)) {
      setActiveCategoryState(categories[0]);
    }
  }, [categories, activeCategory]);

  const getRecipeById = useCallback(
    (id: string) => recipesRef.current.find((r) => r.id === id),
    []
  );

  useEffect(() => {
    if (!activeRecipeId) return;
    if (!getRecipeById(activeRecipeId)) {
      setActiveRecipeId(null);
    }
  }, [getRecipeById, activeRecipeId]);

  const setActiveCategory = useCallback(
    (category: string) => {
      setActiveCategoryState((prev) => {
        if (category !== prev) {
          const cats = uniqueCategories(recipesRef.current);
          const pi = cats.indexOf(prev);
          const ni = cats.indexOf(category);
          if (pi >= 0 && ni >= 0) {
            setCategorySlideDir(ni > pi ? 1 : -1);
          }
        }
        return category;
      });
      setActiveRecipeId(null);
    },
    []
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

  const editingRecipe = editingId ? getRecipeById(editingId) ?? null : null;

  const addRecipe = useCallback(
    async (recipe: Recipe) => {
      if (!isAdmin) {
        toast.error(t("mutationForbidden"));
        return;
      }
      // Optimistic update with a temp id
      const tempId = `temp-${uuidv4()}`;
      const optimistic = { ...recipe, id: tempId };
      setRecipes((prev) => [...prev, optimistic]);

      const result = await createRecipeAction(recipe);
      if (!result.ok) {
        // Rollback
        setRecipes(recipesRef.current.filter((r) => r.id !== tempId));
        toast.error(result.error);
        return;
      }
      // Replace temp id with the real server-generated id
      setRecipes((prev) =>
        prev.map((r) => (r.id === tempId ? { ...r, id: result.id } : r))
      );
    },
    [isAdmin]
  );

  const updateRecipe = useCallback(
    async (recipe: Recipe) => {
      if (!isAdmin) {
        toast.error(t("mutationForbidden"));
        return;
      }
      const prev = recipesRef.current;
      // Optimistic update
      setRecipes((current) =>
        current.map((r) => (r.id === recipe.id ? recipe : r))
      );

      const result = await updateRecipeAction(recipe);
      if (!result.ok) {
        setRecipes(prev);
        toast.error(result.error);
      }
    },
    [isAdmin]
  );

  const deleteRecipe = useCallback(
    async (id: string) => {
      if (!isAdmin) {
        toast.error(t("mutationForbidden"));
        return;
      }
      const prev = recipesRef.current;
      // Optimistic update
      setRecipes((current) => current.filter((r) => r.id !== id));

      const result = await deleteRecipeAction(id);
      if (!result.ok) {
        setRecipes(prev);
        toast.error(result.error);
      }
    },
    [isAdmin]
  );

  const openCreateRecipe = useCallback(() => {
    if (!isAdmin) {
      toast.error(t("mutationForbidden"));
      return;
    }
    setEditingId(null);
    setEditorOpen(true);
  }, [isAdmin]);

  const openEditRecipe = useCallback(
    (recipe: Recipe) => {
      if (!isAdmin) {
        toast.error(t("mutationForbidden"));
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
    async (recipe: Recipe) => {
      if (!isAdmin) {
        toast.error(t("mutationForbidden"));
        return;
      }
      if (editingId) {
        await updateRecipe(recipe);
      } else {
        await addRecipe(recipe);
      }
    },
    [editingId, updateRecipe, addRecipe, isAdmin]
  );

  const setDeleteTargetGuarded = useCallback(
    (recipe: Recipe | null) => {
      if (recipe != null && !isAdmin) {
        toast.error(t("mutationForbidden"));
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
      hydrated: true,
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

/** @deprecated Use `useRecipe` from `@/hooks/useRecipe` */
export function useRecipesContext(): RecipeContextValue {
  return useRecipeContext();
}
