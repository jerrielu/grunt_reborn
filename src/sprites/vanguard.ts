import { SpriteTemplate } from "./sprite_template";
import { Head } from "./components/head";
import { Body } from "./components/body";
import { Horse } from "./components/horse";

export class VanguardSpriteTemplate extends SpriteTemplate {
  static WIDTH = 64;
  static HEIGHT = 64;
  static DEFAULT_OUTPUT = "vanguard.png";

  constructor(dir: string = "down") {
    super();
    const mirrored = dir === "left";
    const back = dir === "up";
    const head = new Head([32, 18]);
    if (back) {
      const hair = (head as any).children?.[1];
      if (hair) hair.clip = null;
      const face = (head as any).children?.[2];
      if (face) face.visible = false;
    }
    const bodyRot = dir === "right" ? 90 : dir === "left" ? 270 : 0;
    const body = new Body([32, 26], [50, 100, 200, 255]);
    body.rotation = bodyRot;
    const comps: any[] = [
      new Horse([32, 40]),
      body,
      head,
    ];
    if (mirrored) for (const c of comps) c.mirrored = true;
    this.COMPONENTS = comps;
  }
}
