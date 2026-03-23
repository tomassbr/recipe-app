import type { LucideIcon } from "lucide-react";
import {
  Cake,
  Candy,
  Droplets,
  Flame,
  Layers,
  Sparkles,
  Waves,
} from "lucide-react";
import type { CategoryAsset } from "@/constants/categoryAssets";

const MAP: Record<CategoryAsset["icon"], LucideIcon> = {
  Sparkles,
  Flame,
  Cake,
  Layers,
  Droplets,
  Candy,
  Waves,
};

export function getLucideIconForAsset(asset: CategoryAsset): LucideIcon {
  return MAP[asset.icon] ?? Sparkles;
}
