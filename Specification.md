# Product Specification: Pastry Recipe Calculator

## 1. Overview
A Next.js (App Router) + TypeScript application that allows pastry chefs to select a recipe from a database and dynamically recalculate ingredient amounts based on a desired target yield.

## 2. Core Features & UX Flow
1. **Initial Load**: User sees a Sidebar with Categories and a Main View with a grid of Recipes for the selected category.
2. **Recipe Selection**: Clicking a recipe card opens the Recipe Detail View (replaces the grid or opens next to it).
3. **The Calculator (Real-time)**:
   - The Detail View displays the Recipe Name and its Original Note.
   - Prominently displays an `<input type="number">` for the **Target Yield** (Cílové netto/počet).
   - The input's default value is the recipe's `baseYield`.
   - Below the input, a table displays the components and ingredients.
   - **Crucial Rule**: As the user types in the input, the ingredient amounts in the table must recalculate *instantly* via React state (no submit button needed).

## 3. Mathematical Logic (Strict Rule)
The calculation must perfectly mirror the original Excel sheets. DO NOT alter the base data.
- **Variables**:
  - `baseYield`: The original weight/pieces of the recipe (from DB).
  - `targetYield`: The value inputted by the user.
  - `baseAmount`: The original amount of a specific ingredient (from DB).
- **Formula**:
  1. `Coefficient = targetYield / baseYield`
  2. `CalculatedAmount = baseAmount * Coefficient`
- **Formatting**:
  - Round `CalculatedAmount` to maximum 2 decimal places (e.g., `15.45`). If it's a whole number, omit decimals (e.g., `15`).
  - Keep the original unit exactly as it is in the database (`g`, `kg`, `ks`). Do not auto-convert g to kg.

## 4. Data Structure Details
- Read data from `db.json`.
- Handle the `components` array properly. If a recipe has multiple components (e.g., "Odpalované těsto" and "Crumble"), render a sub-header for each component inside the main table, followed by its specific ingredients.

## 5. Future-proofing (Architecture)
- Write the data fetching logic behind a service or hook (e.g., `useRecipes()`), so it's easy to swap the static JSON import for a `fetch()` call to an API or Supabase later.
- Keep components small and modular (e.g., `<RecipeCard />`, `<IngredientTable />`, `<CalculatorInput />`).

### Auth & Security Rules
- **No Manual JWT:** Always use Supabase Auth helpers for session management.
- **Role Checks:** UI must always check `user.role` before rendering destructive actions (Delete, Edit).
- **Server-Side Validation:** All API routes or Server Actions must re-validate the user role on the backend, never trust the frontend alone.
- **Environment Variables:** All Supabase keys must be in `.env.local` and never hardcoded.