"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type GlassCardProps = HTMLAttributes<HTMLDivElement>;

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border border-white/50 bg-white/40 shadow-glass backdrop-blur-xl md:rounded-3xl",
          className
        )}
        {...props}
      />
    );
  }
);
