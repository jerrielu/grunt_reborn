import Phaser from "phaser";
import { MenSpriteTemplate } from "../sprites/men";
import { SuitSpriteTemplate } from "../sprites/suit";
import { VanguardSpriteTemplate } from "../sprites/vanguard";
import { Sword } from "../sprites/components/sword";

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: "BootScene" }); }

  create(): void {
    const tpl = new SuitSpriteTemplate();
    const canvas = tpl.renderToCanvas();
    const tex = this.textures.createCanvas("hero", 64, 64);
    if (tex) {
      tex.getContext().drawImage(canvas, 0, 0);
      tex.refresh();
    }
    const stpl = new MenSpriteTemplate();
    const soldierCanvas = stpl.renderToCanvas();
    const soldierTex = this.textures.createCanvas("soldier", 64, 64);
    if (soldierTex) {
      soldierTex.getContext().drawImage(soldierCanvas, 0, 0);
      soldierTex.refresh();
    }
    const vtpl = new VanguardSpriteTemplate();
    const vcanvas = vtpl.renderToCanvas();
    const vtex = this.textures.createCanvas("vanguard", 64, 64);
    if (vtex) {
      vtex.getContext().drawImage(vcanvas, 0, 0);
      vtex.refresh();
    }

    const ssword = new Sword([32, 32]);
    const scanvas = document.createElement("canvas");
    scanvas.width = 64; scanvas.height = 64;
    const sctx = scanvas.getContext("2d")!;
    sctx.clearRect(0, 0, 64, 64);
    for (const [key, color] of ssword.pixels()) {
      const [x, y] = key.split(",").map(Number);
      sctx.fillStyle = `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`;
      sctx.fillRect(x, y, 1, 1);
    }
    const stex = this.textures.createCanvas("sword", 64, 64);
    if (stex) {
      stex.getContext().drawImage(scanvas, 0, 0);
      stex.refresh();
    }

    // Force nearest-neighbor filtering for crisp pixel art
    this.textures.each((texture: Phaser.Textures.Texture) => {
      if (texture.key === "__DEFAULT" || texture.key === "__MISSING") return;
      texture.setFilter(Phaser.Textures.FilterMode.NEAREST);
    }, this);

    const sprite = this.add.image(this.scale.width / 2, this.scale.height / 2, "hero");
    sprite.setScale(4);
    this.add.text(16, 16, "Grunt Reborn - P1 scaffold", { color: "#ffffff", fontSize: "14px" });
  }
}
