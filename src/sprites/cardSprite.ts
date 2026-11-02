import { SpriteTemplate } from "./sprite_template";
import { CardFrame, CardIcon } from "./components/cardFrame";
import { getCard } from "../config/cards";
import type { Color } from "./components/base";

const TYPE_COLOR: Record<string, Color> = {
  tactic: [180, 60, 60, 255],
  equipment: [60, 120, 180, 255],
  instant: [180, 150, 40, 255],
  summon: [60, 160, 80, 255],
};

const ICON_COLOR: Record<string, Color> = {
  charge: [220, 80, 60, 255],
  guard: [80, 120, 200, 255],
  assassinate: [120, 60, 180, 255],
  frenzy: [220, 120, 40, 255],
  bait: [200, 180, 60, 255],
  slowHit: [100, 100, 100, 255],
  lurk: [90, 90, 120, 255],
  steady: [70, 130, 90, 255],
  bloodbath: [160, 30, 30, 255],
  spear: [180, 180, 200, 255],
  heavyArmor: [100, 100, 140, 255],
  swiftBoots: [200, 160, 80, 255],
  dagger: [200, 200, 220, 255],
  shockwave: [220, 200, 80, 255],
  firstAid: [80, 200, 120, 255],
  disrupt: [120, 120, 220, 255],
  roar: [220, 120, 60, 255],
  summonFootman: [90, 170, 90, 255],
  summonSpearman: [90, 170, 130, 255],
  summonShieldman: [90, 170, 60, 255],
  summonRally: [90, 190, 90, 255],
};

// per-card icon rects (relative to canvas origin)
const ICONS: Record<string, [number, number, number, number][]> = {
  charge: [[22, 16, 4, 4], [20, 20, 8, 2], [22, 22, 4, 16]],
  guard: [[18, 18, 12, 2], [18, 20, 2, 12], [28, 20, 2, 12], [18, 32, 12, 2]],
  assassinate: [[22, 16, 4, 4], [23, 20, 2, 14], [20, 32, 8, 2]],
  frenzy: [[20, 18, 3, 3], [25, 16, 3, 3], [22, 22, 4, 12], [19, 30, 10, 3]],
  bait: [[22, 18, 4, 4], [20, 22, 8, 2], [20, 24, 2, 8], [26, 24, 2, 8], [20, 32, 8, 2]],
  slowHit: [[18, 18, 12, 4], [22, 22, 4, 12], [18, 34, 12, 2]],
  lurk: [[20, 20, 8, 8], [22, 22, 4, 4]],
  steady: [[16, 20, 16, 2], [16, 22, 2, 12], [30, 22, 2, 12], [16, 34, 16, 2]],
  bloodbath: [[20, 18, 8, 8], [22, 26, 4, 8], [18, 34, 12, 2]],
  spear: [[22, 14, 2, 24], [20, 16, 6, 2], [18, 36, 10, 2]],
  heavyArmor: [[18, 18, 12, 4], [18, 22, 4, 10], [26, 22, 4, 10], [18, 32, 12, 4]],
  swiftBoots: [[18, 18, 6, 6], [24, 24, 6, 6], [20, 30, 4, 6], [26, 30, 4, 6]],
  dagger: [[20, 16, 8, 2], [23, 18, 2, 14], [20, 32, 8, 2]],
  shockwave: [[14, 24, 4, 4], [18, 22, 4, 8], [22, 20, 4, 12], [26, 22, 4, 8], [30, 24, 4, 4]],
  firstAid: [[22, 18, 4, 16], [16, 24, 16, 4]],
  disrupt: [[20, 20, 8, 2], [26, 22, 2, 8], [20, 30, 8, 2], [20, 22, 2, 8]],
  roar: [[18, 18, 12, 4], [20, 22, 8, 2], [22, 24, 4, 8], [18, 32, 12, 2]],
  summonFootman: [[20, 18, 8, 4], [22, 22, 4, 10], [18, 32, 12, 2]],
  summonSpearman: [[22, 14, 2, 18], [20, 16, 6, 2], [20, 32, 8, 2]],
  summonShieldman: [[18, 18, 12, 4], [18, 22, 4, 10], [26, 22, 4, 10], [18, 32, 12, 2]],
  summonRally: [[18, 18, 4, 4], [26, 18, 4, 4], [20, 22, 8, 2], [22, 24, 4, 10], [18, 34, 12, 2]],
};

export class CardSpriteTemplate extends SpriteTemplate {
  static WIDTH = 64;
  static HEIGHT = 96;

  constructor(cardId: string) {
    super();
    const def = getCard(cardId);
    const type = def?.type ?? "tactic";
    const accent = TYPE_COLOR[type] ?? [100, 100, 100, 255];
    const iconColor = ICON_COLOR[cardId] ?? [60, 60, 60, 255];
    const rects = ICONS[cardId] ?? [[20, 22, 8, 8]];
    const stars = type === "instant" ? 2 : type === "summon" ? 4 : 3;
    const frame = new CardFrame(64, 96, accent, stars);
    const icon = new CardIcon(rects, iconColor, 2, [10, 20]);
    this.COMPONENTS = [frame, icon];
  }
}