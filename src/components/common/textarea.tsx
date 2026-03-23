"use client";

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full resize-y rounded-xl border border-white/60 bg-white/60 px-4 py-3 text-slate-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/25",
          className
        )}
        {...props}
      />
    );
  }
);
