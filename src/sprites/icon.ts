import { SpriteTemplate } from "./sprite_template";
import { GameIcon } from "./components/icon";

export class IconSpriteTemplate extends SpriteTemplate {
  static WIDTH = 64;
  static HEIGHT = 64;
  static DEFAULT_OUTPUT = "icon.png";

  COMPONENTS = [new GameIcon(64)];
}

export class AppIconSpriteTemplate extends IconSpriteTemplate {}
export class WebIconSpriteTemplate extends IconSpriteTemplate {}