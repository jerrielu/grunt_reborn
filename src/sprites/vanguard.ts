import { SpriteTemplate } from "./sprite_template";
import { Head } from "./components/head";
import { Body } from "./components/body";
import { Horse } from "./components/horse";
import { Weapon } from "./components/weapon";

export class VanguardSpriteTemplate extends SpriteTemplate {
  static WIDTH = 64;
  static HEIGHT = 64;
  static DEFAULT_OUTPUT = "vanguard.png";

  COMPONENTS = [
    new Horse([32, 42]),
    new Body([32, 26], [50, 100, 200, 255]),
    new Head([32, 16]),
    new Weapon([18, 20]),
  ];
}