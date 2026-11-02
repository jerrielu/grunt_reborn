import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 480,
  height: 640,
  backgroundColor: "#1a1a2e",
  pixelArt: true,
  roundPixels: true,
  physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  scene: [BootScene],
};

new Phaser.Game(config);
