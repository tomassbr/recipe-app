"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { RecipeProvider } from "@/context/RecipeContext";
import { SessionProfileProvider } from "@/context/SessionProfileContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProfileProvider>
      <RecipeProvider>
        {children}
        <Toaster richColors position="top-center" closeButton />
      </RecipeProvider>
    </SessionProfileProvider>
  );
}
