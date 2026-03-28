"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { SessionProfileProvider } from "@/context/SessionProfileContext";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProfileProvider>
      {children}
      <Toaster richColors position="top-center" closeButton />
    </SessionProfileProvider>
  );
}
