import { getRecipes } from "@/actions/recipes";
import RecipeApp from "@/components/features/home/RecipeApp";

export default async function Page() {
  const initialRecipes = await getRecipes();
  return <RecipeApp initialRecipes={initialRecipes} />;
}
