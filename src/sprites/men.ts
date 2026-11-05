import { SpriteTemplate } from "./sprite_template";
import { Head } from "./components/head";
import { Body } from "./components/body";
import { Arm } from "./components/arm";
import { Leg } from "./components/leg";

export class MenSpriteTemplate extends SpriteTemplate {
  static DEFAULT_OUTPUT = "men.png";

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
    const body = new Body([32, 30]);
    body.rotation = bodyRot;
    const comps: any[] = [
      head,
      body,
      new Arm([22, 28]),
      new Arm([42, 28]),
      new Leg([28, 38], "left"),
      new Leg([36, 38], "right"),
    ];
    if (mirrored) for (const c of comps) c.mirrored = true;
    this.COMPONENTS = comps;
  }
}
