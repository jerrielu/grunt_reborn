import { SpriteTemplate } from "./sprite_template";
import { Head } from "./components/head";
import { SuitBody } from "./components/suit";
import { Arm } from "./components/arm";
import { Leg } from "./components/leg";

export class SuitSpriteTemplate extends SpriteTemplate {
  static DEFAULT_OUTPUT = "suit.png";

  constructor(dir: string = "down") {
    super();
    const mirrored = dir === "left";
    const back = dir === "up";
    const head = new Head([32, 18], [255, 200, 150, 255], [20, 20, 20, 255], [20, 20, 20, 255]);
    if (back) {
      const hair = (head as any).children?.[1];
      if (hair) hair.clip = null;
      const face = (head as any).children?.[2];
      if (face) face.visible = false;
    }
    const comps: any[] = [
      head,
      new SuitBody([32, 30]),
      new Arm([22, 28], [25, 35, 80, 255]),
      new Arm([42, 28], [25, 35, 80, 255]),
      new Leg([28, 38], "left", [30, 30, 40, 255], [20, 20, 20, 255]),
      new Leg([36, 38], "right", [30, 30, 40, 255], [20, 20, 20, 255]),
    ];
    if (mirrored) for (const c of comps) c.mirrored = true;
    this.COMPONENTS = comps;
  }
}
