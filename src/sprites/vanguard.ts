import { SpriteTemplate } from "./sprite_template";
import { Component } from "./components/base";

const BROWN: [number, number, number, number] = [120, 70, 40, 255];
const DARK: [number, number, number, number] = [80, 45, 25, 255];
const BLUE: [number, number, number, number] = [50, 100, 200, 255];
const SKIN: [number, number, number, number] = [255, 200, 150, 255];
const STEEL: [number, number, number, number] = [200, 200, 210, 255];
const WOOD: [number, number, number, number] = [140, 90, 50, 255];

function C(color: [number, number, number, number], pos: [number, number], rects: [number, number, number, number][]): Component {
  const c = new Component();
  c.color = color;
  c.position = pos;
  c.rects = rects;
  return c;
}

export class VanguardSpriteTemplate extends SpriteTemplate {
  static WIDTH = 64;
  static HEIGHT = 64;
  static DEFAULT_OUTPUT = "vanguard.png";

  COMPONENTS = [
    // horse body
    C(BROWN, [32, 42], [[-12, -6, 24, 12]]),
    // horse neck
    C(BROWN, [44, 34], [[-3, -6, 6, 8]]),
    // horse head
    C(BROWN, [48, 28], [[-4, -4, 8, 8]]),
    // horse ear
    C(DARK, [46, 24], [[0, -2, 2, 2]]),
    // horse eye
    C([20, 20, 20, 255], [50, 28], [[0, 0, 1, 1]]),
    // horse mane
    C(DARK, [40, 30], [[0, -4, 3, 6]]),
    // horse legs
    C(DARK, [24, 52], [[-2, 0, 3, 8]]),
    C(DARK, [30, 52], [[-2, 0, 3, 8]]),
    C(DARK, [40, 52], [[-2, 0, 3, 8]]),
    C(DARK, [46, 52], [[-2, 0, 3, 8]]),
    // horse tail
    C(DARK, [20, 40], [[-3, -2, 3, 6]]),
    // rider body
    C(BLUE, [32, 26], [[-5, -6, 10, 12]]),
    // rider head
    C(SKIN, [32, 16], [[-3, -3, 6, 6]]),
    // rider hair
    C(DARK, [32, 13], [[-3, -1, 6, 3]]),
    // rider eye
    C([20, 20, 20, 255], [31, 16], [[0, 0, 1, 1]]),
    C([20, 20, 20, 255], [34, 16], [[0, 0, 1, 1]]),
    // weapon shaft
    C(WOOD, [18, 20], [[0, 0, 3, 24]]),
    // weapon blade
    C(STEEL, [18, 16], [[-1, -6, 5, 8]]),
  ];
}