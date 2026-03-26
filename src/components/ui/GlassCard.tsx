"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { glassSurfaceClass } from "./glass-tokens";

export type GlassCardProps = HTMLAttributes<HTMLDivElement>;

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          glassSurfaceClass,
          "rounded-2xl md:rounded-3xl",
          className
        )}
        {...props}
      />
    );
  }
);
