"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, type = "text", ...props },
  ref
) {
  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        "w-full rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-slate-800 outline-none ring-gold/20 placeholder:text-slate-400 focus:border-gold focus:ring-2 focus:ring-gold/25",
        className
      )}
      {...props}
    />
  );
});
