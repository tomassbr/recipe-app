/**
 * Visual assets per recipe category (matches `db.json` labels).
 * `accent`: Tailwind gradient utility for glass panels (no spaces in class names).
 */

export type CategoryAsset = {
  /** Lucide icon component name */
  icon:
    | "Sparkles"
    | "Flame"
    | "Cake"
    | "Layers"
    | "Droplets"
    | "Candy"
    | "Waves";
  /** e.g. `from-fuchsia-500/35 via-purple-400/25 to-pink-400/30` */
  accent: string;
};

export const CATEGORY_ASSETS: Record<string, CategoryAsset> = {
  "Zrcadlové glazury": {
    icon: "Waves",
    accent: "from-fuchsia-500/35 via-purple-400/25 to-pink-400/30",
  },
  "Potahování, čokolády": {
    icon: "Layers",
    accent: "from-amber-900/40 via-stone-700/30 to-amber-600/35",
  },
  "Omáčky s pektinem": {
    icon: "Droplets",
    accent: "from-sky-400/35 via-indigo-400/25 to-rose-300/30",
  },
  "Krémy, šlehačky, créumex": {
    icon: "Candy",
    accent: "from-pink-300/35 via-fuchsia-400/25 to-violet-400/30",
  },
  Korpusy: {
    icon: "Cake",
    accent: "from-rose-300/35 via-amber-200/30 to-orange-300/30",
  },
  Karamel: {
    icon: "Flame",
    accent: "from-amber-500/40 via-orange-600/35 to-yellow-500/25",
  },
  Dekorování: {
    icon: "Sparkles",
    accent: "from-violet-400/35 via-purple-400/25 to-fuchsia-400/30",
  },
};

/** Fallback when category is not in the map (dynamic / new categories). */
export const DEFAULT_CATEGORY_ASSET: CategoryAsset = {
  icon: "Sparkles",
  accent: "from-amber-400/30 via-gold/25 to-slate-400/20",
};
