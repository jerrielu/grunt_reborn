import { Component, CompositeComponent, Color } from "./base";

export class CardFrame extends CompositeComponent {
  constructor(w: number, h: number, accent: Color, stars: number = 3) {
    super();
    const light: Color = [250, 245, 230, 255];
    const dark: Color = [30, 25, 20, 255];
    const mid: Color = [200, 190, 160, 255];

    const bg = new Component(); bg.color = light; bg.position = [0, 0]; bg.rects = [[0, 0, w, h]];
    const s = w / 64;
    const r = (v: number) => Math.round(v * s);
    const outer = new Component(); outer.color = dark; outer.position = [0, 0]; outer.rects = [
      [0, 0, w, Math.max(1, r(2))], [0, h - Math.max(1, r(2)), w, Math.max(1, r(2))], [0, 0, Math.max(1, r(2)), h], [w - Math.max(1, r(2)), 0, Math.max(1, r(2)), h],
    ];
    const nameBar = new Component(); nameBar.color = mid; nameBar.position = [0, 0]; nameBar.rects = [[r(4), r(4), w - r(8), Math.max(1, r(10))]];
    const artWin = new Component(); artWin.color = [210, 205, 195, 255]; artWin.position = [0, 0]; artWin.rects = [[r(6), r(16), w - r(12), Math.max(1, r(34))]];
    const artBorder = new Component(); artBorder.color = dark; artBorder.position = [0, 0]; artBorder.rects = [
      [r(6), r(16), w - r(12), 1], [r(6), r(16) + Math.max(1, r(34)) - 1, w - r(12), 1], [r(6), r(16), 1, Math.max(1, r(34))], [w - r(7), r(16), 1, Math.max(1, r(34))],
    ];
    const typeLine = new Component(); typeLine.color = [225, 215, 190, 255]; typeLine.position = [0, 0]; typeLine.rects = [[r(6), r(52), w - r(12), Math.max(1, r(7))]];
    const effectArea = new Component(); effectArea.color = [245, 238, 215, 255]; effectArea.position = [0, 0]; effectArea.rects = [[r(6), r(61), w - r(12), Math.max(1, r(24))]];
    const statBar = new Component(); statBar.color = accent; statBar.position = [0, 0]; statBar.rects = [[r(6), r(87), w - r(12), Math.max(1, r(5))]];

    const starComps: Component[] = [];
    for (let i = 0; i < stars; i++) {
      const st = new Component();
      st.color = [230, 200, 60, 255];
      st.position = [0, 0];
      st.rects = [[r(8) + i * Math.max(1, r(10)), r(6), Math.max(1, r(6)), Math.max(1, r(6))]];
      starComps.push(st);
    }

    this.children = [bg, outer, nameBar, artWin, artBorder, typeLine, effectArea, statBar, ...starComps];
  }
}

export class CardIcon extends Component {
  constructor(rects: [number, number, number, number][], color: Color, res: number = 1) {
    super();
    this.color = color;
    this.position = [0, 0];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y, w, h] of rects) {
      minX = Math.min(minX, x); minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w); maxY = Math.max(maxY, y + h);
    }
    const srcW = maxX - minX; const srcH = maxY - minY;
    const artW = 52 * res; const artH = 34 * res;
    const scale = Math.min(artW / srcW, artH / srcH) * 0.85;
    const bw = srcW * scale; const bh = srcH * scale;
    const artCx = 32 * res; const artCy = 33 * res;
    this.rects = rects.map(([x, y, w, h]) => [
      Math.round((x - minX) * scale + (artCx - bw / 2)),
      Math.round((y - minY) * scale + (artCy - bh / 2)),
      Math.max(1, Math.round(w * scale)),
      Math.max(1, Math.round(h * scale)),
    ]) as any;
  }
}