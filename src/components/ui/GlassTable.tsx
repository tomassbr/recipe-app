"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn";

export type GlassTableProps = {
  children: ReactNode;
  className?: string;
  tableClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

/**
 * Ingredient / data tables — glass shell + `tabular-nums` on the table (Design.md §4).
 */
export function GlassTable({
  children,
  className,
  tableClassName,
  ...wrapperProps
}: GlassTableProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-2xl border border-white/50 bg-white/40 shadow-glass backdrop-blur-xl md:rounded-3xl",
        className
      )}
      {...wrapperProps}
    >
      <table
        className={cn(
          "w-full min-w-[300px] border-collapse text-sm tabular-nums md:text-base",
          tableClassName
        )}
      >
        {children}
      </table>
    </div>
  );
}
