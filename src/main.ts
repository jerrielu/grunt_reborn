import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { BattleScene } from "./scenes/BattleScene";
import { GameController } from "./game";
import { showMenu } from "./ui/menu";
import { attachHandPanel } from "./ui/handPanel";

const controller = new GameController();

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: 393,
  height: 852,
  backgroundColor: "#1a1a2e",
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 393,
    height: 852,
  },
  physics: { default: "arcade", arcade: { gravity: { x: 0, y: 0 }, debug: false } },
  scene: [BootScene, BattleScene],
};

const game = new Phaser.Game(config);

function startRun(generalId: string): void {
  const sim = controller.startRun(generalId);
  attachHandPanel(sim, (cardId) => sim.confirmReward(cardId));
  const scene = game.scene.start("BattleScene", { sim });
  const bs = game.scene.getScene("BattleScene") as BattleScene;
  bs.sim.events.on("hero.died", () => {
    const { points, level } = controller.endRun();
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:rgba(10,10,30,0.9);color:#fff;font-family:sans-serif;z-index:10;";
    overlay.innerHTML = `<h2>战败</h2><p>通关关卡: ${level}</p><p>获得轮回积分: ${points}</p><p>总积分: ${controller.meta.state.points}</p>`;
    const btn = document.createElement("button");
    btn.textContent = "返回轮回殿";
    btn.style.cssText = "margin:6px;padding:10px 20px;font-size:16px;cursor:pointer;";
    btn.onclick = () => { overlay.remove(); game.scene.stop("BattleScene"); showMenu(startRun); };
    overlay.appendChild(btn);
    document.getElementById("game")!.appendChild(overlay);
  });
}

showMenu(startRun);
export { controller };
