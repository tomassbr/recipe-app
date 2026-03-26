"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn";
import { glassSurfaceClass } from "./glass-tokens";

export type GlassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "icon";
};

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    { className, variant = "secondary", type = "button", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-gold/30 disabled:pointer-events-none disabled:opacity-50",
          variant === "secondary" && [
            glassSurfaceClass,
            "border-white/50 px-6 py-3 text-slate-700 hover:bg-white/60",
          ],
          variant === "primary" &&
            "border border-gold/40 bg-gold-muted px-6 py-3 font-semibold text-slate-900 shadow-sm hover:border-gold/60 hover:bg-gold-muted/90",
          variant === "ghost" &&
            "border-transparent bg-transparent px-4 py-3 text-slate-700 hover:bg-white/40",
          variant === "danger" &&
            "border border-red-300/80 bg-red-50/90 px-6 py-3 font-semibold text-red-900 hover:bg-red-100",
          variant === "icon" && [
            glassSurfaceClass,
            "rounded-full border-white/50 p-2 text-slate-600 hover:border-gold/40 hover:bg-gold-muted hover:text-slate-900",
          ],
          className
        )}
        {...props}
      />
    );
  }
);
