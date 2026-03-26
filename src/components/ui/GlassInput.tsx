"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { glassSurfaceClass } from "./glass-tokens";

export type GlassInputProps = InputHTMLAttributes<HTMLInputElement> & {
  variant?: "default" | "emphasis";
};

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  function GlassInput(
    { className, type = "text", variant = "default", ...props },
    ref
  ) {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          glassSurfaceClass,
          "w-full rounded-xl border-white/50 px-4 py-3 text-slate-800 outline-none placeholder:text-slate-400",
          variant === "default" && [
            "text-lg",
            "focus:border-gold focus:ring-2 focus:ring-blue-300/50",
          ],
          variant === "emphasis" &&
            "rounded-2xl border-2 border-gold/35 bg-white/85 px-6 py-4 text-3xl font-semibold shadow-inner tabular-nums focus:border-gold focus:ring-4 focus:ring-gold/20 md:text-4xl",
          className
        )}
        {...props}
      />
    );
  }
);
