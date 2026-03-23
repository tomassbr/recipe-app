"use client";

import type { ReactNode } from "react";
import { RecipeProvider } from "@/context/RecipeContext";

export function Providers({ children }: { children: ReactNode }) {
  return <RecipeProvider>{children}</RecipeProvider>;
}
