import recipesData from "../../db.json";
import { parseRecipeDatabase } from "@/utils/recipeDb";

export const SEED_RECIPES = parseRecipeDatabase(recipesData);
