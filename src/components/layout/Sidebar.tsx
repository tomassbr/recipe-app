"use client";

import { motion } from "framer-motion";
import { LayoutGrid, Search, Settings2 } from "lucide-react";
import { getCategoryIcon } from "@/utils/categoryIcons";
import { useRecipe } from "@/composables/useRecipe";
import { GlassCard, GlassInput } from "@/components/ui";

export function Sidebar() {
  const {
    categories,
    activeCategory,
    setActiveCategory,
    manageMode,
    setManageMode,
    isAdmin,
    profileRoleHydrated,
    searchQuery,
    setSearchQuery,
  } = useRecipe();

  return (
    <GlassCard
      className="flex w-full flex-col shrink-0 p-6 md:sticky md:top-8 md:z-10 md:h-[calc(100vh-10rem)] md:w-80 md:min-h-0 md:overflow-hidden md:p-8"
      role="complementary"
      aria-label="Kategorie receptů"
    >
      {profileRoleHydrated && isAdmin ? (
        <div className="mb-8 flex shrink-0 flex-col gap-4 rounded-2xl border border-white/40 bg-white/25 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Settings2 className="h-4 w-4 text-gold-dark" aria-hidden />
              Správa
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={manageMode}
              onClick={() => setManageMode(!manageMode)}
              className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors ${
                manageMode
                  ? "border-gold/50 bg-gold-muted shadow-inner"
                  : "border-white/50 bg-white/40"
              }`}
            >
              <span
                className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${
                  manageMode ? "left-7 translate-x-0 border border-gold/30" : "left-1"
                }`}
              />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Zapněte pro úpravy a mazání receptů na kartách a v detailu.
          </p>
        </div>
      ) : null}

      <div className="mb-4 shrink-0">
        <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          Hledat v kategorii
        </label>
        <GlassInput
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Název receptu…"
          autoComplete="off"
          className="py-3 text-sm"
        />
      </div>

      <div className="mb-4 flex shrink-0 items-center gap-2 text-slate-500">
        <LayoutGrid className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wider">
          Kategorie
        </p>
      </div>
      <nav
        className="flex min-h-0 flex-row gap-2 overflow-x-auto pb-2 md:flex-1 md:flex-col md:gap-2 md:overflow-y-auto md:overflow-x-hidden md:pb-0"
        aria-label="Seznam kategorií"
      >
        {categories.map((cat) => {
          const active = cat === activeCategory;
          const Icon = getCategoryIcon(cat);
          return (
            <motion.button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition-colors md:py-4 ${
                active
                  ? "border border-gold/35 bg-gold-muted font-semibold text-slate-900 shadow-sm ring-1 ring-gold/20"
                  : "border border-transparent font-normal text-slate-500 hover:border-white/40 hover:bg-white/30 hover:text-slate-700"
              }`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  active
                    ? "bg-white/70 text-gold-dark"
                    : "bg-white/25 text-slate-400"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1 leading-snug">{cat}</span>
            </motion.button>
          );
        })}
      </nav>
    </GlassCard>
  );
}
