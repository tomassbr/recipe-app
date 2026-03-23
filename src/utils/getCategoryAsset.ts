import type { CategoryAsset } from "@/constants/categoryAssets";
import {
  CATEGORY_ASSETS,
  DEFAULT_CATEGORY_ASSET,
} from "@/constants/categoryAssets";

/**
 * Resolve visual asset for a category label (exact match, then fuzzy keywords).
 */
export function getCategoryAsset(category: string): CategoryAsset {
  const trimmed = category.trim();
  if (CATEGORY_ASSETS[trimmed]) {
    return CATEGORY_ASSETS[trimmed];
  }
  const c = trimmed.toLowerCase();
  if (c.includes("glaz")) return CATEGORY_ASSETS["Zrcadlové glazury"];
  if (c.includes("potah") || c.includes("čokol") || c.includes("cokol")) {
    return CATEGORY_ASSETS["Potahování, čokolády"];
  }
  if (c.includes("omáč") || c.includes("omack") || c.includes("pektin")) {
    return CATEGORY_ASSETS["Omáčky s pektinem"];
  }
  if (
    c.includes("krém") ||
    c.includes("krem") ||
    c.includes("šleha") ||
    c.includes("creumex")
  ) {
    return CATEGORY_ASSETS["Krémy, šlehačky, créumex"];
  }
  if (c.includes("korpus")) return CATEGORY_ASSETS.Korpusy;
  if (c.includes("karamel")) return CATEGORY_ASSETS.Karamel;
  if (c.includes("dekor")) return CATEGORY_ASSETS.Dekorování;
  return DEFAULT_CATEGORY_ASSET;
}
