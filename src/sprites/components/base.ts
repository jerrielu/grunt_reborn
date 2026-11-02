export type Color = [number, number, number, number];
export type Point = [number, number];

export class Component {
  color: Color = [0, 0, 0, 255];
  position: Point = [0, 0];
  rotation = 0;
  offsets: Point[] | null = null;
  rects: [number, number, number, number][] | null = null;
  clip: [number, number, number, number] | null = null;
  visible = true;
  mirrored = false;

  localOffsets(): Point[] {
    if (this.rects) {
      const out: Point[] = [];
      for (const [rx, ry, rw, rh] of this.rects) {
        for (let dy = ry; dy < ry + rh; dy++) {
          for (let dx = rx; dx < rx + rw; dx++) {
            out.push([dx, dy]);
          }
        }
      }
      return out;
    }
    return (this.offsets || []).map(([x, y]) => [x, y]);
  }

  pixels(): Map<string, Color> {
    if (!this.visible) return new Map();
    const [px, py] = this.position;
    const angle = (this.rotation * Math.PI) / 180;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const clip = this.clip;
    const color = this.color;
    const out = new Map<string, Color>();
    for (const [dx0, dy] of this.localOffsets()) {
      let dx = dx0;
      if (this.mirrored) dx = -dx;
      if (clip && !(clip[0] <= dx && dx < clip[2] && clip[1] <= dy && dy < clip[3])) continue;
      const rx = dx * cosA - dy * sinA;
      const ry = dx * sinA + dy * cosA;
      out.set(`${px + Math.round(rx)},${py + Math.round(ry)}`, [color[0], color[1], color[2], color[3]]);
    }
    return out;
  }
}

export class CompositeComponent extends Component {
  children: Component[] | null = null;

  pixels(): Map<string, Color> {
    if (!this.visible) return new Map();
    const merged = new Map<string, Color>();
    for (const child of this.children || []) {
      for (const [k, v] of child.pixels()) merged.set(k, v);
    }
    return merged;
  }
}
