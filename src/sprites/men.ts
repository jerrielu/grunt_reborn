import { SpriteTemplate } from "./sprite_template";
import { Head } from "./components/head";
import { Body } from "./components/body";
import { Arm } from "./components/arm";
import { Leg } from "./components/leg";

export class MenSpriteTemplate extends SpriteTemplate {
  static DEFAULT_OUTPUT = "men.png";

  COMPONENTS = [
    new Head([32, 14]),
    new Body([32, 30]),
    new Arm([22, 29]),
    new Arm([42, 29]),
    new Leg([29, 45], "left"),
    new Leg([35, 45], "right"),
  ];
}
