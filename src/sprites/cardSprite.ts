import { SpriteTemplate } from "./sprite_template";
import { CardFrame, CardIcon } from "./components/cardFrame";
import { MenSpriteTemplate } from "./men";
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

const ICONS: Record<string, [number, number, number, number][]> = {
  charge: [[23, 8, 2, 16], [21, 8, 6, 2], [20, 24, 8, 2], [23, 26, 2, 8], [21, 34, 6, 2], [19, 10, 2, 2], [27, 10, 2, 2]],
  guard: [[20, 10, 8, 2], [18, 12, 2, 2], [28, 12, 2, 2], [16, 14, 2, 4], [30, 14, 2, 4], [16, 18, 2, 6], [30, 18, 2, 6], [18, 24, 2, 6], [28, 24, 2, 6], [20, 30, 2, 4], [26, 30, 2, 4], [22, 34, 4, 2]],
  assassinate: [[22, 8, 4, 4], [23, 12, 2, 14], [20, 26, 8, 2], [19, 28, 2, 6], [27, 28, 2, 6], [21, 34, 6, 2], [20, 10, 2, 2], [26, 10, 2, 2]],
  frenzy: [[18, 10, 4, 4], [26, 8, 4, 4], [22, 14, 4, 12], [18, 26, 12, 3], [20, 29, 8, 3], [16, 14, 2, 8], [30, 14, 2, 8], [22, 10, 2, 2]],
  bait: [[22, 8, 4, 4], [20, 12, 8, 2], [18, 14, 2, 10], [28, 14, 2, 10], [18, 24, 2, 4], [28, 24, 2, 4], [20, 28, 8, 2], [22, 30, 4, 6], [18, 10, 2, 2], [28, 10, 2, 2]],
  slowHit: [[16, 10, 16, 4], [20, 14, 8, 2], [22, 16, 4, 12], [18, 28, 12, 2], [16, 30, 4, 4], [28, 30, 4, 4], [20, 34, 8, 2]],
  lurk: [[20, 12, 8, 8], [22, 14, 4, 4], [16, 22, 4, 4], [28, 22, 4, 4], [18, 28, 4, 4], [26, 28, 4, 4], [22, 26, 4, 2], [14, 18, 2, 2], [32, 18, 2, 2]],
  steady: [[14, 10, 20, 2], [14, 12, 2, 22], [32, 12, 2, 22], [14, 34, 20, 2], [18, 16, 2, 14], [22, 16, 2, 14], [26, 16, 2, 14], [30, 16, 2, 14]],
  bloodbath: [[20, 10, 8, 8], [22, 12, 4, 4], [21, 18, 6, 2], [22, 20, 4, 10], [18, 30, 12, 2], [16, 12, 2, 6], [30, 12, 2, 6], [18, 32, 2, 2], [28, 32, 2, 2]],
  spear: [[23, 6, 2, 26], [21, 8, 6, 2], [19, 10, 2, 2], [27, 10, 2, 2], [21, 32, 6, 2], [18, 34, 12, 2], [20, 36, 8, 2]],
  heavyArmor: [[18, 10, 12, 4], [16, 14, 4, 12], [28, 14, 4, 12], [18, 26, 12, 4], [20, 30, 8, 4], [16, 14, 2, 4], [30, 14, 2, 4], [18, 10, 2, 2], [28, 10, 2, 2]],
  swiftBoots: [[18, 10, 6, 6], [24, 16, 6, 6], [16, 22, 4, 8], [22, 28, 4, 8], [28, 22, 4, 6], [18, 30, 4, 6], [24, 22, 2, 2], [30, 28, 2, 2]],
  dagger: [[20, 8, 8, 2], [23, 10, 2, 16], [19, 26, 10, 2], [18, 28, 2, 6], [28, 28, 2, 6], [20, 34, 8, 2], [22, 12, 2, 2], [24, 12, 2, 2]],
  shockwave: [[12, 22, 4, 4], [16, 20, 4, 8], [20, 18, 4, 12], [24, 16, 4, 16], [28, 18, 4, 12], [32, 20, 4, 8], [36, 22, 4, 4], [22, 14, 4, 2], [26, 14, 4, 2]],
  firstAid: [[22, 8, 4, 28], [8, 20, 32, 4], [20, 6, 8, 2], [8, 18, 2, 8], [38, 18, 2, 8], [20, 36, 8, 2]],
  disrupt: [[20, 12, 8, 2], [26, 14, 2, 8], [20, 22, 8, 2], [20, 14, 2, 8], [18, 26, 4, 2], [26, 26, 4, 2], [20, 30, 8, 2], [22, 32, 4, 4]],
  roar: [[16, 10, 16, 4], [18, 14, 12, 2], [20, 16, 8, 8], [22, 24, 4, 6], [16, 30, 16, 2], [18, 32, 4, 2], [26, 32, 4, 2]],
  summonFootman: [[20, 8, 8, 4], [22, 12, 4, 14], [18, 26, 12, 2], [16, 28, 4, 6], [28, 28, 4, 6], [20, 34, 8, 2], [18, 10, 2, 2], [28, 10, 2, 2]],
  summonSpearman: [[23, 6, 2, 22], [21, 8, 6, 2], [19, 10, 2, 2], [27, 10, 2, 2], [21, 28, 6, 2], [18, 30, 12, 2], [20, 32, 8, 2], [22, 34, 4, 2]],
  summonShieldman: [[18, 8, 12, 4], [16, 12, 4, 14], [28, 12, 4, 14], [18, 26, 12, 4], [20, 30, 8, 4], [16, 12, 2, 4], [30, 12, 2, 4], [18, 8, 2, 2], [28, 8, 2, 2]],
  summonRally: [[18, 8, 4, 4], [26, 8, 4, 4], [20, 12, 8, 2], [22, 14, 4, 12], [18, 26, 12, 2], [16, 28, 4, 6], [28, 28, 4, 6], [20, 34, 8, 2]],
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
    const isSummon = type === "summon";
    const frame = new CardFrame(64, 96, accent, stars);
    const components: any[] = [frame];
    if (!isSummon) {
      const icon = new CardIcon(rects, iconColor);
      components.push(icon);
    }
    this.COMPONENTS = components;
  }
}

export function renderCardCanvas(cardId: string): HTMLCanvasElement {
  const tpl = new CardSpriteTemplate(cardId);
  const canvas = tpl.renderToCanvas();
  const ctx = canvas.getContext("2d")!;
  const def = getCard(cardId);
  if (!def) return canvas;
  if (def.type === "summon") {
    const stpl = new MenSpriteTemplate();
    const sc = stpl.renderToCanvas();
    ctx.drawImage(sc, 6, 16, 52, 34);
  }
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 9px monospace";
  ctx.fillText(def.name, 6, 13);
  ctx.font = "7px monospace";
  ctx.fillStyle = "#333";
  // wrap description into effect area
  const words = def.description.split("");
  let line = "";
  let y = 68;
  const maxW = 52;
  for (const ch of words) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, 6, y);
      line = ch;
      y += 9;
      if (y > 84) break;
    } else {
      line = test;
    }
  }
  if (line && y <= 84) ctx.fillText(line, 6, y);
  ctx.font = "7px monospace";
  ctx.fillStyle = "#555";
  ctx.fillText(def.type.toUpperCase(), 6, 58);
  return canvas;
}