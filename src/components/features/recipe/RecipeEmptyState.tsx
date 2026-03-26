"use client";

import { useId } from "react";
import { motion } from "framer-motion";
import { EMPTY_STATE_VISUAL } from "@/utils/emptyStateVisual";

const GOLD = "#D4AF37";

type RecipeEmptyStateProps = {
  variant?: "select" | "category-empty";
  category?: string;
  className?: string;
};

/**
 * Elegant line-art: whisk + chef hat, thin gold strokes (#D4AF37).
 */
function GoldLinePastryIllustration({ title }: { title: string }) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 220 140"
      className="h-auto w-full max-h-[128px] md:max-h-[140px]"
      role="img"
      aria-labelledby={`${uid}-ill-title`}
    >
      <title id={`${uid}-ill-title`}>{title}</title>

      {/* Chef hat — left */}
      <motion.g
        initial={{ opacity: 0.85 }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M 28 88 L 28 102 Q 28 108 44 108 L 72 108 Q 88 108 88 102 L 88 88"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 32 88 Q 58 52 84 88"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.15"
          strokeLinecap="round"
        />
        <path
          d="M 42 72 Q 58 58 74 72"
          fill="none"
          stroke={GOLD}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.85"
        />
        <line
          x1="44"
          y1="96"
          x2="72"
          y2="96"
          stroke={GOLD}
          strokeWidth="0.9"
          opacity="0.6"
        />
      </motion.g>

      {/* Whisk — right */}
      <motion.g
        initial={{ opacity: 0.9 }}
        animate={{ rotate: [0, 1.5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "148px 72px" }}
      >
        <line
          x1="148"
          y1="28"
          x2="148"
          y2="96"
          stroke={GOLD}
          strokeWidth="1.35"
          strokeLinecap="round"
        />
        <path
          d="M 132 100 Q 148 108 164 100"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M 128 104 Q 148 118 168 104"
          fill="none"
          stroke={GOLD}
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.95"
        />
        <path
          d="M 124 108 Q 148 126 172 108"
          fill="none"
          stroke={GOLD}
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.88"
        />
        {/* Wires */}
        <path
          d="M 148 96 C 138 102 130 112 124 122 M 148 96 C 142 108 138 120 136 128 M 148 96 C 154 108 160 120 162 128 M 148 96 C 158 102 166 112 172 122"
          fill="none"
          stroke={GOLD}
          strokeWidth="0.95"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx="148" cy="24" r="3" fill="none" stroke={GOLD} strokeWidth="1" />
      </motion.g>

      {/* Decorative arc */}
      <path
        d="M 20 118 Q 110 132 200 118"
        fill="none"
        stroke={GOLD}
        strokeWidth="0.85"
        strokeLinecap="round"
        opacity="0.45"
      />
    </svg>
  );
}

/**
 * Kompaktní úvodní karta — jednotná paleta, čistá ilustrace.
 */
export function RecipeEmptyState({
  variant = "select",
  category,
  className = "",
}: RecipeEmptyStateProps) {
  const v = EMPTY_STATE_VISUAL;

  const title =
    variant === "select"
      ? "Vyberte recept"
      : "V této kategorii zatím nic není";
  const subtitle =
    variant === "select"
      ? "Klikněte na kartu níže — zobrazí se přepočet surovin a poznámky."
      : "Přidejte recept v režimu Správa nebo zvolte jinou kategorii.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-glass backdrop-blur-xl md:rounded-3xl ${v.border} ${v.bg} p-4 md:p-5 ${className}`}
    >
      <div
        className={`pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full blur-2xl ${v.blob1}`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute -bottom-16 -left-8 h-40 w-40 rounded-full blur-2xl ${v.blob2}`}
        aria-hidden
      />

      <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="relative w-full max-w-[180px] shrink-0 sm:max-w-[200px] sm:mx-0">
          <GoldLinePastryIllustration title={title} />
        </div>

        <div className="min-w-0 flex-1 text-center sm:text-left">
          {category ? (
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 md:text-xs">
              {category}
            </p>
          ) : null}
          <h3 className="text-lg font-bold tracking-tight text-slate-800 md:text-xl">
            {title}
          </h3>
          <p className="mt-2 max-w-md text-pretty text-xs leading-relaxed text-slate-600 md:text-sm">
            {subtitle}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
