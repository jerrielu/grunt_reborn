import Phaser from "phaser";
import { MenSpriteTemplate } from "../sprites/men";

export class BootScene extends Phaser.Scene {
  constructor() { super({ key: "BootScene" }); }

  create(): void {
    const tpl = new MenSpriteTemplate();
    const canvas = tpl.renderToCanvas();
    const tex = this.textures.createCanvas("hero", 64, 64);
    if (tex) {
      tex.getContext().drawImage(canvas, 0, 0);
      tex.refresh();
    }
    const sprite = this.add.image(this.scale.width / 2, this.scale.height / 2, "hero");
    sprite.setScale(4);
    this.add.text(16, 16, "Grunt Reborn - P1 scaffold", { color: "#ffffff", fontSize: "14px" });
  }
}
