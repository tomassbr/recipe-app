"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

type AnimatedScaledAmountProps = {
  /** Stable key string when the displayed value meaningfully changes */
  valueKey: string;
  className?: string;
  children: ReactNode;
};

/**
 * Brief fade when scaled amounts update (bez AnimatePresence wait — žádné „mizení“ buňky).
 */
export function AnimatedScaledAmount({
  valueKey,
  className,
  children,
}: AnimatedScaledAmountProps) {
  return (
    <span
      className={`relative inline-block min-h-[1.25em] overflow-visible ${className ?? ""}`}
    >
      <motion.span
        key={valueKey}
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="inline-block tabular-nums"
      >
        {children}
      </motion.span>
    </span>
  );
}
