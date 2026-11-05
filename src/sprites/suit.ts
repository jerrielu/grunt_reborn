import { SpriteTemplate } from "./sprite_template";
import { Head } from "./components/head";
import { SuitBody } from "./components/suit";
import { Arm } from "./components/arm";
import { Leg } from "./components/leg";

export class SuitSpriteTemplate extends SpriteTemplate {
  static DEFAULT_OUTPUT = "suit.png";

  COMPONENTS = [
    new Head([32, 18], [255, 200, 150, 255], [20, 20, 20, 255], [20, 20, 20, 255]),
    new SuitBody([32, 30]),
    new Arm([22, 28], [25, 35, 80, 255]),
    new Arm([42, 28], [25, 35, 80, 255]),
    new Leg([28, 38], "left", [30, 30, 40, 255], [20, 20, 20, 255]),
    new Leg([36, 38], "right", [30, 30, 40, 255], [20, 20, 20, 255]),
  ];
}