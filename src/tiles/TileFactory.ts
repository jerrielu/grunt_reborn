import Phaser from "phaser";

const TILE = 14;
const FLOWER_COLORS = [0xffcc44, 0xff66aa, 0x88ccff, 0xffffff, 0xff8844, 0xcc66ff, 0x66ffaa, 0xff4444];

export class TileFactory {
  static ensureGroundTexture(scene: Phaser.Scene, w: number, h: number): string {
    const key = "ground.main";
    if (scene.textures.exists(key)) return key;
    const rt = scene.add.renderTexture(0, 0, w, h);
    const g = scene.add.graphics();
    for (let y = 0; y < h; y += TILE) {
      for (let x = 0; x < w; x += TILE) {
        const baseR = Math.random();
        const detailR = Math.random();
        const dirtR = Math.random();
        const pebbleR = Math.random();
        const base = baseR < 0.4 ? 0x2a3a2a : baseR < 0.7 ? 0x2e402e : 0x263426;
        g.fillStyle(base, 1);
        g.fillRect(x, y, TILE, TILE);
        // flowers
        if (detailR > 0.985) {
          const c1 = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
          const c2 = FLOWER_COLORS[Math.floor(Math.random() * FLOWER_COLORS.length)];
          const cx = x + 5 + Math.floor(Math.random() * 8);
          const cy = y + 5 + Math.floor(Math.random() * 8);
          g.fillStyle(c1, 1);
          g.fillCircle(cx - 2, cy, 1);
          g.fillCircle(cx + 2, cy, 1);
          g.fillCircle(cx, cy - 2, 1);
          g.fillCircle(cx, cy + 2, 1);
          g.fillStyle(c2, 1);
          g.fillCircle(cx, cy, 1);
          g.fillStyle(0x2a5a1a, 1);
          g.fillRect(cx, cy + 1, 1, 3);
        }
        // dirt patches
        if (dirtR > 0.995) {
          g.fillStyle(0x5a4a3a, 0.95);
          g.fillCircle(x + TILE / 2, y + TILE / 2, 2);
          g.fillStyle(0x4a3a2a, 0.9);
          g.fillCircle(x + TILE / 2 + 1, y + TILE / 2 - 1, 1);
        }
        // pebbles
        if (pebbleR > 0.99) {
          g.fillStyle(0x7a7a6a, 1);
          g.fillCircle(x + TILE - 4, y + TILE - 4, 1);
          g.fillStyle(0x6a6a5a, 1);
          g.fillCircle(x + 3, y + TILE - 3, 1);
        }
      }
    }
    rt.draw(g, 0, 0);
    g.destroy();
    rt.saveTexture(key);
    rt.destroy();
    return key;
  }
}