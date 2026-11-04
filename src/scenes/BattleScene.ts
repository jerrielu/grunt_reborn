import Phaser from "phaser";
import type { BattleSim } from "../core/battle/BattleSim";
import type { Unit } from "../core/types";
import { TileFactory } from "../tiles/TileFactory";

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
    const w = 180, h = 390;
    // reusable ground texture
    const key = TileFactory.ensureGroundTexture(this, w, h);
    const ground = this.add.image(0, 0, key).setOrigin(0, 0);
    const border = this.add.graphics();
    border.lineStyle(4, 0x6a5a3a, 1);
    border.strokeRect(2, 2, w - 4, h - 4);
    // camera
    this.cameras.main.setBounds(0, 0, w, h);
    this.cameras.main.setZoom(1);
    // listen to sim events for damage numbers
    this.sim.events.on("unit.died", (e) => {
      const u = this.findUnit(e.data.id as number);
      if (u) this.spawnDamageText(u.x, u.y, "💀", "#ff6666");
    });
    this.sim.events.on("hero.attack", (e) => {
      const tgt = this.findUnit(e.data.targetId as number);
      if (tgt) this.spawnDamageText(tgt.x, tgt.y, `-${e.data.dmg}`, "#ffff88");
      const hero = this.sim.state.hero;
      const hc = this.unitSprites.get(hero.id);
      if (hc && tgt) this.playAttack(hc, tgt.x, tgt.y);
      const tc = tgt ? this.unitSprites.get(tgt.id) : undefined;
      if (tc) this.playHit(tc);
    });
    this.sim.events.on("enemy.attack", (e) => {
      const tgt = this.findUnit(e.data.targetId as number);
      if (tgt) this.spawnDamageText(tgt.x, tgt.y, `-${e.data.dmg}`, "#ff8888");
      const atk = this.findUnit(e.data.attackerId as number);
      const ac = atk ? this.unitSprites.get(atk.id) : undefined;
      if (ac && tgt) this.playAttack(ac, tgt.x, tgt.y);
      const tc = tgt ? this.unitSprites.get(tgt.id) : undefined;
      if (tc) this.playHit(tc);
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

  playAttack(c: Phaser.GameObjects.Container, tx: number, ty: number): void {
    const proj = this.add.rectangle(c.x, c.y, 6, 24, 0xc8c8d2);
    proj.setOrigin(0.5, 1);
    const angle = Phaser.Math.Angle.Between(c.x, c.y, tx, ty);
    proj.setRotation(angle + Math.PI / 2);
    this.tweens.add({
      targets: proj,
      x: tx,
      y: ty,
      duration: 180,
      ease: "Quad.easeOut",
      onComplete: () => proj.destroy(),
    });
    this.tweens.add({ targets: c, scaleX: 1.15, scaleY: 1.15, duration: 80, yoyo: true, ease: "Quad.easeOut" });
  }

  playHit(c: Phaser.GameObjects.Container): void {
    const img = c.list[0] as Phaser.GameObjects.Image;
    if (img) img.setTint(0xffffff);
    this.tweens.add({ targets: c, x: c.x + 4, duration: 40, yoyo: true, repeat: 1, onComplete: () => { if (img) { img.clearTint(); } } });
  }

  update(_time: number, delta: number): void {
    const sim = this.sim;
    if (sim.state.phase === "fight") {
      // sim.update is driven by controller or here; drive here
      sim.update(delta / 1000);
    }
    this.syncUnits();
    const hero = sim.state.hero;
    const t = _time / 1000;
    for (const [id, c] of this.unitSprites) {
      const bob = Math.sin(t * 6 + id) * 1.5;
      const u = this.findUnit(id);
      if (u) c.setY(u.y + bob);
    }
    // fixed camera: no follow, view stays within arena bounds
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
