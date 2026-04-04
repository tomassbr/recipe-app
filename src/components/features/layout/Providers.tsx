"use client";

import type { ReactNode } from "react";
import { Toaster } from "sonner";
import { SessionProfileProvider } from "@/context/SessionProfileContext";
import type { ProfileRole } from "@/types/profile";

export function Providers({
  children,
  initialRole,
}: {
  children: ReactNode;
  initialRole?: ProfileRole | null;
}) {
  return (
    <SessionProfileProvider initialRole={initialRole}>
      {children}
      <Toaster richColors position="top-center" closeButton />
    </SessionProfileProvider>
  );
}
