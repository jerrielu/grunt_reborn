import { Component, Color } from "./components/base";

export class SpriteTemplate {
  static WIDTH = 64;
  static HEIGHT = 64;
  static DEFAULT_OUTPUT = "sprite.png";
  static COMPONENTS: any = {};
  COMPONENTS: any = (this.constructor as any).COMPONENTS ?? {};

  get WIDTH() {
    return (this.constructor as any).WIDTH ?? 64;
  }
  get HEIGHT() {
    return (this.constructor as any).HEIGHT ?? 64;
  }

  pixels(): Map<string, Color> {
    const merged = new Map<string, Color>();
    const items = Array.isArray(this.COMPONENTS)
      ? this.COMPONENTS
      : this.COMPONENTS && typeof this.COMPONENTS === "object"
      ? Object.values(this.COMPONENTS)
      : [];
    for (const item of items) {
      if (item instanceof Component) {
        for (const [k, v] of item.pixels()) merged.set(k, v);
      } else if (item && typeof item === "object") {
        if (item.visible === false) continue;
        for (const [k, v] of this.componentPixels(item)) merged.set(k, v);
      }
    }
    return merged;
  }

  componentPixels(spec: any): Map<string, Color> {
    const color = spec.color as Color;
    const [px, py] = spec.position ?? [0, 0];
    const angle = ((spec.rotation ?? 0) * Math.PI) / 180;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const clip = spec.clip ?? null;
    const out = new Map<string, Color>();
    for (const [dx0, dy] of this.componentOffsets(spec)) {
      let dx = dx0;
      if (spec.mirrored) dx = -dx;
      if (clip && !(clip[0] <= dx && dx < clip[2] && clip[1] <= dy && dy < clip[3])) continue;
      const rx = dx * cosA - dy * sinA;
      const ry = dx * sinA + dy * cosA;
      out.set(`${px + Math.round(rx)},${py + Math.round(ry)}`, [color[0], color[1], color[2], color[3]]);
    }
    return out;
  }

  componentOffsets(spec: any): [number, number][] {
    if (spec.rects) {
      const out: [number, number][] = [];
      for (const [rx, ry, rw, rh] of spec.rects) {
        for (let dy = ry; dy < ry + rh; dy++) {
          for (let dx = rx; dx < rx + rw; dx++) out.push([dx, dy]);
        }
      }
      return out;
    }
    return (spec.offsets ?? []).map(([x, y]: [number, number]) => [x, y]);
  }

  renderToCanvas(canvas?: HTMLCanvasElement): HTMLCanvasElement {
    const c = canvas ?? document.createElement("canvas");
    c.width = this.WIDTH;
    c.height = this.HEIGHT;
    const ctx = c.getContext("2d")!;
    ctx.clearRect(0, 0, c.width, c.height);
    for (const [key, color] of this.pixels()) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`;
      ctx.fillRect(x, y, 1, 1);
    }
    return c;
  }

  toDataURL(): string {
    return this.renderToCanvas().toDataURL("image/png");
  }
}
