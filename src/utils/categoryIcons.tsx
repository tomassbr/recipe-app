import type { LucideIcon } from "lucide-react";
import { getCategoryAsset } from "@/utils/getCategoryAsset";
import { getLucideIconForAsset } from "@/utils/categoryLucideIcon";

/**
 * Lucide icon for a category label (aligned with `CATEGORY_ASSETS`).
 */
export function getCategoryIcon(category: string): LucideIcon {
  return getLucideIconForAsset(getCategoryAsset(category));
}
