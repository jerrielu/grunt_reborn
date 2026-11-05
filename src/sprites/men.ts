import { SpriteTemplate } from "./sprite_template";
import { Head } from "./components/head";
import { Body } from "./components/body";
import { Arm } from "./components/arm";
import { Leg } from "./components/leg";
import { Weapon } from "./components/weapon";

export class MenSpriteTemplate extends SpriteTemplate {
  static DEFAULT_OUTPUT = "men.png";

  COMPONENTS = [
    new Head([32, 18]),
    new Body([32, 30]),
    new Arm([22, 28]),
    new Arm([42, 28]),
    new Weapon([44, 26]),
    new Leg([28, 38], "left"),
    new Leg([36, 38], "right"),
  ];
}
