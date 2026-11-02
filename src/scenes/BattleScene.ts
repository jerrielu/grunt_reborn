import Phaser from "phaser";
import type { BattleSim } from "../core/battle/BattleSim";
import type { Unit } from "../core/types";

export class BattleScene extends Phaser.Scene {
  sim!: BattleSim;
  unitSprites: Map<number, Phaser.GameObjects.Container> = new Map();
  heroShadow!: Phaser.GameObjects.Ellipse;
  arenaGfx!: Phaser.GameObjects.Graphics;
  hpBars: Map<number, Phaser.GameObjects.Graphics> = new Map();

  constructor() { super({ key: "BattleScene" }); }

  init(data: { sim: BattleSim }): void {
    this.sim = data.sim;
  }

  create(): void {
    const w = 900, h = 900;
    // ground
    const g = this.add.graphics();
    g.fillStyle(0x2a3a2a, 1);
    g.fillRect(0, 0, w, h);
    g.lineStyle(4, 0x6a5a3a, 1);
    g.strokeRect(2, 2, w - 4, h - 4);
    // camera
    this.cameras.main.setBounds(0, 0, w, h);
    this.cameras.main.setZoom(1.4);
    // listen to sim events for damage numbers
    this.sim.events.on("unit.died", (e) => {
      const u = this.findUnit(e.data.id as number);
      if (u) this.spawnDamageText(u.x, u.y, "💀", "#ff6666");
    });
    this.sim.events.on("hero.attack", (e) => {
      const tgt = this.findUnit(e.data.targetId as number);
      if (tgt) this.spawnDamageText(tgt.x, tgt.y, `-${e.data.dmg}`, "#ffff88");
    });
    this.sim.events.on("enemy.attack", (e) => {
      const tgt = this.findUnit(e.data.targetId as number);
      if (tgt) this.spawnDamageText(tgt.x, tgt.y, `-${e.data.dmg}`, "#ff8888");
    });
  }

  findUnit(id: number): Unit | undefined {
    const s = this.sim.state;
    if (s.hero.id === id) return s.hero;
    return [...s.enemies, ...s.summons].find((u) => u.id === id);
  }

  spawnDamageText(x: number, y: number, text: string, color: string): void {
    const t = this.add.text(x, y - 10, text, { color, fontSize: "12px", fontStyle: "bold" });
    t.setOrigin(0.5);
    this.tweens.add({ targets: t, y: y - 40, alpha: 0, duration: 600, onComplete: () => t.destroy() });
  }

  update(_time: number, delta: number): void {
    const sim = this.sim;
    if (sim.state.phase === "fight") {
      // sim.update is driven by controller or here; drive here
      sim.update(delta / 1000);
    }
    this.syncUnits();
    const hero = sim.state.hero;
    this.cameras.main.centerOn(hero.x, hero.y);
  }

  syncUnits(): void {
    const s = this.sim.state;
    const all: Unit[] = [s.hero, ...s.enemies, ...s.summons].filter((u) => u.alive);
    // remove dead
    for (const [id, c] of this.unitSprites) {
      if (!all.find((u) => u.id === id)) { c.destroy(); this.unitSprites.delete(id); this.hpBars.get(id)?.destroy(); this.hpBars.delete(id); }
    }
    for (const u of all) {
      let c = this.unitSprites.get(u.id);
      if (!c) {
        c = this.add.container(u.x, u.y);
        const texKey = (u.side === "hero" && this.sim.state.generalId === "vanguard") ? "vanguard" : "hero";
        const sprite = this.add.image(0, 0, texKey);
         sprite.setScale(0.64);
        if (u.side === "enemy") sprite.setTint(0xaa4444);
        else if (u.side === "summon") sprite.setTint(0x44aa44);
        c.add(sprite);
        const label = this.add.text(0, -18, u.name, { fontSize: "8px", color: "#fff", fontFamily: "monospace" }).setOrigin(0.5);
        c.add(label);
        this.unitSprites.set(u.id, c);
        const hb = this.add.graphics();
        this.hpBars.set(u.id, hb);
      }
      c.setPosition(u.x, u.y);
      const hb = this.hpBars.get(u.id)!;
      hb.clear();
      hb.fillStyle(0x222222, 0.8);
      hb.fillRect(u.x - 12, u.y - 26, 24, 4);
      hb.fillStyle(0x44ff44, 1);
      hb.fillRect(u.x - 12, u.y - 26, 24 * (u.hp / u.maxHp), 4);
    }
  }
}
