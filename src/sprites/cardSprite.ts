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
  omnislash: [220, 200, 255, 255],
};

const ICONS: Record<string, [number, number, number, number][]> = {
  omnislash: [[8, 8, 2, 16], [10, 8, 2, 12], [12, 8, 2, 8], [14, 8, 2, 4], [18, 12, 2, 16], [20, 12, 2, 12], [22, 12, 2, 8], [24, 12, 2, 4], [28, 16, 2, 16], [30, 16, 2, 12], [32, 16, 2, 8], [34, 16, 2, 4], [38, 20, 2, 16], [40, 20, 2, 12], [42, 20, 2, 8], [44, 20, 2, 4], [48, 24, 2, 16], [50, 24, 2, 12], [52, 24, 2, 8], [54, 24, 2, 4]],
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

export function renderCardCanvas(cardId: string, scale: number = 1): HTMLCanvasElement {
  const s = Math.max(1, Math.round(scale));
  const baseW = 64;
  const baseH = 96;
  const w = baseW * s;
  const h = baseH * s;
  const tpl = new CardSpriteTemplate(cardId);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, w, h);
  for (const [key, color] of tpl.pixels()) {
    const [x, y] = key.split(",").map(Number);
    ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`;
    ctx.fillRect(x * s, y * s, s, s);
  }
  const def = getCard(cardId);
  if (!def) return canvas;
  if (def.type === "summon") {
    const stpl = new MenSpriteTemplate();
    const sc = stpl.renderToCanvas();
    ctx.drawImage(sc, 6 * s, 16 * s, 52 * s, 34 * s);
  }
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `bold ${9 * s}px monospace`;
  ctx.fillText(def.name, 6 * s, 13 * s);
  ctx.font = `${7 * s}px monospace`;
  ctx.fillStyle = "#333";
  const words = def.description.split("");
  let line = "";
  let y = 68 * s;
  const maxW = 52 * s;
  for (const ch of words) {
    const test = line + ch;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, 6 * s, y);
      line = ch;
      y += 9 * s;
      if (y > 84 * s) break;
    } else {
      line = test;
    }
  }
  if (line && y <= 84 * s) ctx.fillText(line, 6 * s, y);
  ctx.font = `${7 * s}px monospace`;
  ctx.fillStyle = "#555";
  ctx.fillText(def.type.toUpperCase(), 6 * s, 58 * s);
  return canvas;
}