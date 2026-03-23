"use client";

import { motion } from "framer-motion";
import { getCategoryAsset } from "@/utils/getCategoryAsset";
import { getLucideIconForAsset } from "@/utils/categoryLucideIcon";
import { cn } from "@/utils/cn";

type CategoryBrowseHeroProps = {
  category: string;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const GOLD = "#D4AF37";

/** Jemná line-art dekorace (bez fotek). */
function CategoryHeroArt() {
  return (
    <svg
      className="pointer-events-none absolute -right-6 -top-10 h-44 w-44 opacity-[0.22] md:h-52 md:w-52"
      viewBox="0 0 200 200"
      aria-hidden
    >
      <circle
        cx="128"
        cy="72"
        r="56"
        fill="none"
        stroke={GOLD}
        strokeWidth="1"
      />
      <circle
        cx="148"
        cy="92"
        r="28"
        fill="none"
        stroke={GOLD}
        strokeWidth="0.85"
        opacity="0.75"
      />
      <path
        d="M 24 168 Q 88 120 164 156"
        fill="none"
        stroke={GOLD}
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.65"
      />
      <path
        d="M 40 52 L 40 88 Q 40 100 56 100 L 72 100"
        fill="none"
        stroke={GOLD}
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

export function CategoryBrowseHero({ category }: CategoryBrowseHeroProps) {
  const asset = getCategoryAsset(category);
  const Icon = getLucideIconForAsset(asset);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/50 shadow-glass backdrop-blur-xl md:rounded-3xl">
      <div className="relative min-h-[100px] w-full sm:min-h-[108px] md:min-h-[112px]">
        <motion.div
          key={category}
          className="absolute inset-0"
          initial={{ opacity: 0.88 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: easeOut }}
        >
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-90",
              asset.accent
            )}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/45 via-white/65 to-white/90"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_90%_15%,rgba(255,255,255,0.55)_0%,transparent_55%)]"
            aria-hidden
          />
          <CategoryHeroArt />
          {/* Velká „vodoznaková“ ikona jen jako tvar */}
          <div className="pointer-events-none absolute -right-4 bottom-0 opacity-[0.07]">
            <Icon
              className="h-36 w-36 text-slate-900 md:h-40 md:w-40"
              strokeWidth={1}
              aria-hidden
            />
          </div>
        </motion.div>

        <div className="relative z-10 flex min-h-[100px] flex-row items-center gap-4 px-4 py-3 md:min-h-[112px] md:gap-5 md:px-6 md:py-3.5">
          <motion.div
            key={`icon-${category}`}
            initial={{ opacity: 0.92, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: easeOut }}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/60 text-gold-dark shadow-md backdrop-blur-md md:h-14 md:w-14"
          >
            <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.5} aria-hidden />
          </motion.div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600 md:text-xs">
              Aktivní kategorie
            </p>
            <h3 className="mt-0.5 line-clamp-2 text-lg font-bold leading-snug tracking-tight text-slate-900 md:text-xl">
              {category}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
