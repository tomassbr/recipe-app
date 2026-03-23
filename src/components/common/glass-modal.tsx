"use client";

import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";
import { Button } from "./button";

export type GlassModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
};

export function GlassModal({
  open,
  title,
  onClose,
  children,
  wide,
}: GlassModalProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="glass-modal-title"
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/25 backdrop-blur-sm"
            aria-label="Zavřít"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "relative z-10 max-h-[min(92vh,900px)] w-full overflow-hidden rounded-3xl border border-white/50 bg-white/45 shadow-[0_24px_80px_-12px_rgba(31,38,135,0.2)] backdrop-blur-2xl",
              wide ? "max-w-3xl" : "max-w-lg"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex min-h-[56px] items-center justify-between gap-4 border-b border-white/40 bg-white/20 px-6 py-4 md:px-8">
              <h2
                id="glass-modal-title"
                className="text-lg font-bold tracking-tight text-slate-800 md:text-xl"
              >
                {title}
              </h2>
              <Button
                type="button"
                variant="icon"
                onClick={onClose}
                aria-label="Zavřít"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </Button>
            </div>
            <div className="max-h-[min(78vh,760px)] overflow-y-auto px-6 py-6 md:px-8 md:py-8">
              {children}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
