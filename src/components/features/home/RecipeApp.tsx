"use client";

import type { Recipe } from "@/types/recipe";
import { RecipeProvider } from "@/context/RecipeContext";
import HomePage from "@/components/features/home/HomePage";

interface RecipeAppProps {
  initialRecipes: Recipe[];
}

/**
 * Client boundary that receives server-fetched recipes and provides them
 * to the RecipeContext before first render (no loading flash).
 */
export default function RecipeApp({ initialRecipes }: RecipeAppProps) {
  return (
    <RecipeProvider initialRecipes={initialRecipes}>
      <HomePage />
    </RecipeProvider>
  );
}
