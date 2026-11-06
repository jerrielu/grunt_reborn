import Phaser from "phaser";
import type { BattleSim } from "../core/battle/BattleSim";
import type { Unit } from "../core/types";
import { TileFactory } from "../tiles/TileFactory";

export class BattleScene extends Phaser.Scene {
  sim!: BattleSim;
  unitSprites: Map<number, Phaser.GameObjects.Container> = new Map();
  riderSprites: Map<number, Phaser.GameObjects.Container> = new Map();
  crashFlyers: { c: Phaser.GameObjects.Container; vx: number; vy: number }[] = [];
  freezeTimer: number = 0;
  heroShadow!: Phaser.GameObjects.Ellipse;
  arenaGfx!: Phaser.GameObjects.Graphics;
  hpBars: Map<number, Phaser.GameObjects.Graphics> = new Map();

  constructor() { super({ key: "BattleScene" }); }

  init(data: { sim: BattleSim }): void {
    this.sim = data.sim;
  }

  create(): void {
    const w = 180, h = 335;
    const key = TileFactory.ensureGroundTexture(this, w, h);
    const ground = this.add.image(0, 0, key).setOrigin(0, 0);
    const border = this.add.graphics();
    border.lineStyle(4, 0xc9a86a, 1);
    border.strokeRect(2, 2, w - 4, h - 4);
    this.cameras.main.setBounds(0, 0, w, h);
    this.cameras.main.setZoom(1);
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
    this.sim.events.on("summon.attack", (e) => {
      const tgt = this.findUnit(e.data.targetId as number);
      if (tgt) this.spawnDamageText(tgt.x, tgt.y, `-${e.data.dmg}`, "#88ff88");
      const atk = this.findUnit(e.data.attackerId as number);
      const ac = atk ? this.unitSprites.get(atk.id) : undefined;
      if (ac && tgt) this.playAttack(ac, tgt.x, tgt.y);
      const tc = tgt ? this.unitSprites.get(tgt.id) : undefined;
      if (tc) this.playHit(tc);
    });
    this.sim.events.on("instant.shenzhenLight", () => this.playShenzhenLightEffect());
    this.sim.events.on("rider.crash", (e) => this.playRiderCrash(e.data.x as number, e.data.y as number));
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

  playShenzhenLightEffect(): void {
    const flash = this.add.rectangle(90, 167, 180, 335, 0xffffaa, 0.45);
    this.tweens.add({ targets: flash, alpha: 0, duration: 320, onComplete: () => flash.destroy() });

    const riders = this.sim.state.riders ?? [];
    for (const r of riders) {
      const g = this.add.graphics();
      g.setAlpha(1);
      // main lightning bolt
      g.lineStyle(2, 0xffff66, 1);
      g.beginPath();
      let x = r.x;
      let y = 0;
      g.moveTo(x, y);
      const steps = 14;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        x = r.x + (Math.random() - 0.5) * 22;
        y = r.y * t;
        g.lineTo(x, y);
      }
      g.strokePath();
      // branches
      for (let b = 0; b < 3; b++) {
        const by = r.y * (0.2 + Math.random() * 0.6);
        const bx = r.x + (Math.random() - 0.5) * 16;
        g.lineStyle(1, 0xaaeeff, 0.8);
        g.beginPath();
        g.moveTo(bx, by);
        g.lineTo(bx + (Math.random() - 0.5) * 24, by + 10 + Math.random() * 20);
        g.strokePath();
      }
      this.tweens.add({ targets: g, alpha: 0, duration: 420, delay: 80, onComplete: () => g.destroy() });

      // sparks
      for (let k = 0; k < 4; k++) {
        const sx = r.x + (Math.random() - 0.5) * 26;
        const sy = Math.random() * r.y;
        const spark = this.add.rectangle(sx, sy, 2, 2, 0xffffff);
        this.tweens.add({
          targets: spark,
          y: sy + 15 + Math.random() * 25,
          x: sx + (Math.random() - 0.5) * 12,
          alpha: 0,
          duration: 300 + Math.random() * 200,
          onComplete: () => spark.destroy(),
        });
      }
    }
  }

  playRiderCrash(x: number, y: number): void {
    this.freezeTimer = 0.12;
    // spectacular crash: tumbling scooter + explosion
    const flash = this.add.circle(x, y, 8, 0xff6600, 0.9);
    this.tweens.add({ targets: flash, radius: 60, alpha: 0, duration: 420, ease: "Cubic.easeOut", onComplete: () => flash.destroy() });
    const ring = this.add.graphics();
    ring.lineStyle(3, 0xffaa00, 1);
    ring.strokeCircle(x, y, 6);
    this.tweens.add({ targets: ring, alpha: 0, scaleX: 4, scaleY: 4, duration: 360, onComplete: () => ring.destroy() });
    // debris particles
    for (let k = 0; k < 18; k++) {
      const ang = (k / 18) * Math.PI * 2;
      const sp = this.add.rectangle(x, y, 3, 3, k % 2 === 0 ? 0xffff66 : 0xff4400);
      this.tweens.add({
        targets: sp,
        x: x + Math.cos(ang) * (30 + Math.random() * 25),
        y: y + Math.sin(ang) * (30 + Math.random() * 25),
        alpha: 0,
        angle: Math.random() * 360,
        duration: 420 + Math.random() * 200,
        onComplete: () => sp.destroy(),
      });
    }
    // tumbling scooter silhouette
    const debris = this.add.rectangle(x, y, 18, 7, 0x50505a);
    this.tweens.add({ targets: debris, angle: 720, x: x + 20, y: y + 10, alpha: 0, duration: 500, onComplete: () => debris.destroy() });
    this.cameras.main.shake(120, 0.008);
    // knocked-away motorcycle flies around the battlefield like a ping-pong ball, then exits top
    const flyer = this.add.container(x, y);
    const fw = this.add.rectangle(0, 0, 16, 6, 0x1e1e23);
    const fh = this.add.rectangle(0, -2, 16, 2, 0x9696a0);
    const fb = this.add.rectangle(0, 2, 10, 8, 0x50505a);
    const fhl = this.add.ellipse(0, -6, 10, 8, 0xffcc00);
    flyer.add([fw, fh, fb, fhl]);
    flyer.setAngle(Math.random() * 360);
    const vx = (Math.random() < 0.5 ? -1 : 1) * (90 + Math.random() * 60);
    const vy = -(150 + Math.random() * 80);
    this.crashFlyers.push({ c: flyer, vx, vy });
  }

  playAttack(c: Phaser.GameObjects.Container, tx: number, ty: number): void {
    const sw = c.getData("sword") as Phaser.GameObjects.Image | undefined;
    if (sw) {
      const sx = sw.x, sy = sw.y;
      const dx = tx - c.x, dy = ty - c.y;
      const dist = Math.hypot(dx, dy) || 1;
      const tipPx = 28 * sw.scaleX;
      const txr = dx - (dx / dist) * tipPx;
      const tyr = dy - (dy / dist) * tipPx;
      const angle = Math.atan2(dy, dx);
      sw.setRotation(angle + Math.PI / 2);
      this.tweens.add({
        targets: sw,
        x: txr,
        y: tyr,
        duration: 120,
        ease: "Cubic.easeOut",
        onComplete: () => {
          this.tweens.add({
            targets: sw,
            x: sx,
            y: sy,
            duration: 180,
            ease: "Cubic.easeIn",
            onComplete: () => { sw.setRotation(0); },
          });
        },
      });
    } else {
      const angle = Phaser.Math.Angle.Between(c.x, c.y, tx, ty);
      const sword = this.add.container(c.x, c.y);
      const handle = this.add.rectangle(0, 8, 4, 10, 0x8b5a2b);
      const blade = this.add.rectangle(0, -6, 6, 24, 0xdcdcdc);
      sword.add([handle, blade]);
      sword.setRotation(angle - Math.PI / 3);
      this.tweens.add({
        targets: sword,
        rotation: angle + Math.PI / 3,
        alpha: 0,
        duration: 220,
        ease: "Cubic.easeOut",
        onComplete: () => sword.destroy(),
      });
    }
    this.tweens.add({ targets: c, scaleX: 1.15, scaleY: 1.15, duration: 80, yoyo: true, ease: "Quad.easeOut" });
  }

  playHit(c: Phaser.GameObjects.Container): void {
    const img = c.getData("lower") as Phaser.GameObjects.Image;
    if (img) img.setTint(0xffffff);
    this.tweens.add({ targets: c, x: c.x + 4, duration: 40, yoyo: true, repeat: 1, onComplete: () => { const l = c.getData("lower") as Phaser.GameObjects.Image; if (l) l.clearTint(); const u = c.getData("upper") as Phaser.GameObjects.Image; if (u) u.clearTint(); } });
  }

  update(_time: number, delta: number): void {
    const dt = delta / 1000;
    const sim = this.sim;
    if (this.freezeTimer > 0) {
      this.freezeTimer = Math.max(0, this.freezeTimer - dt);
    } else if (sim.state.phase === "fight") {
      sim.update(dt);
    }
    this.syncUnits();
    this.syncRiders();
    // move knocked-away crashed motorcycles bouncing around battlefield, exit top
    const W = 180, H = 335;
    for (let i = this.crashFlyers.length - 1; i >= 0; i--) {
      const f = this.crashFlyers[i];
      f.c.x += f.vx * dt;
      f.c.y += f.vy * dt;
      f.c.angle += 360 * dt;
      if (f.c.x < 6) { f.c.x = 6; f.vx = Math.abs(f.vx); }
      if (f.c.x > W - 6) { f.c.x = W - 6; f.vx = -Math.abs(f.vx); }
      if (f.c.y > H - 6) { f.c.y = H - 6; f.vy = -Math.abs(f.vy); }
      if (f.c.y < -20) {
        f.c.destroy();
        this.crashFlyers.splice(i, 1);
      }
    }
    for (const r of this.sim.state.riders ?? []) {
      if (Math.random() < 0.08) {
        const spark = this.add.rectangle(r.x + (Math.random() - 0.5) * 14, r.y + (Math.random() - 0.5) * 10, 2, 2, 0xffff66);
        spark.setAlpha(0.9);
        this.tweens.add({ targets: spark, alpha: 0, y: spark.y - 8 - Math.random() * 8, duration: 180, onComplete: () => spark.destroy() });
      }
    }
    const t = _time / 1000;
    for (const [id, c] of this.unitSprites) {
      const upper = c.getData("upper") as Phaser.GameObjects.Image | undefined;
      if (upper) {
        const bob = Math.sin(t * 4 + id) * 1.2;
        upper.setY(bob);
      }
      const sw = c.getData("sword") as Phaser.GameObjects.Image | undefined;
      if (sw && this.tweens.getTweensOf(sw).length === 0) {
        sw.x = 16 + Math.sin(t * 2 + id) * 1.5;
        sw.y = -4 + Math.sin(t * 4 + id) * 4;
        sw.setRotation(0);
      }
    }
  }

  dirFromFacing(facing: number): string {
    const deg = ((facing * 180 / Math.PI) % 360 + 360) % 360;
    if (deg >= 315 || deg < 45) return "right";
    if (deg >= 45 && deg < 135) return "down";
    if (deg >= 135 && deg < 225) return "left";
    return "up";
  }

  syncUnits(): void {
    const s = this.sim.state;
    const all: Unit[] = [s.hero, ...s.enemies, ...s.summons].filter((u) => u.alive);
    for (const [id, c] of this.unitSprites) {
      if (!all.find((u) => u.id === id)) {
        this.tweens.killTweensOf(c);
        c.list.forEach((ch: any) => this.tweens.killTweensOf(ch));
        c.destroy();
        this.unitSprites.delete(id);
        this.hpBars.get(id)?.destroy();
        this.hpBars.delete(id);
      }
    }
    for (const u of all) {
      let c = this.unitSprites.get(u.id);
      if (!c) {
        c = this.add.container(u.x, u.y);
        const base = u.side === "enemy" ? "soldier" : (u.side === "hero" && this.sim.state.generalId === "vanguard" ? "vanguard" : "hero");
        const shadow = this.add.ellipse(0, 14, 26, 8, 0x000000, 0.35);
        c.add(shadow);
        c.setData("shadow", shadow);
        const lower = this.add.image(0, 0, `${base}_down`, "lower");
        lower.setData("base", base);
        lower.setScale(0.448);
        if (u.side === "enemy") lower.setTint(0xaa4444);
        else if (u.side === "summon") lower.setTint(0x44aa44);
        c.add(lower);
        const upper = this.add.image(0, 0, `${base}_down`, "upper");
        upper.setData("base", base);
        upper.setScale(0.448);
        if (u.side === "enemy") upper.setTint(0xaa4444);
        else if (u.side === "summon") upper.setTint(0x44aa44);
        c.add(upper);
        c.setData("upper", upper);
        c.setData("lower", lower);
        const label = this.add.text(0, -13, u.name, { fontSize: "8px", color: "#fff", fontFamily: "monospace" }).setOrigin(0.5);
        c.add(label);
        if (u.side === "hero") {
          const sw = this.add.image(16, -4, "sword");
          sw.setScale(0.448);
          c.add(sw);
          c.setData("sword", sw);
        }
        this.unitSprites.set(u.id, c);
        const hb = this.add.graphics();
        this.hpBars.set(u.id, hb);
      }
      c.setPosition(u.x, u.y);
      const upper = c.getData("upper") as Phaser.GameObjects.Image;
      const lower = c.getData("lower") as Phaser.GameObjects.Image;
      if (upper && lower) {
        const base = (upper.getData("base") as string) || (u.side === "enemy" ? "soldier" : (u.side === "hero" && this.sim.state.generalId === "vanguard" ? "vanguard" : "hero"));
        upper.setData("base", base);
        lower.setData("base", base);
        const dir = this.dirFromFacing(u.facing);
        upper.setTexture(`${base}_${dir}`, "upper");
        lower.setTexture(`${base}_${dir}`, "lower");
      }
      const hb = this.hpBars.get(u.id)!;
      hb.clear();
      hb.fillStyle(0x222222, 0.8);
      hb.fillRect(u.x - 8, u.y - 18, 17, 3);
      hb.fillStyle(0x44ff44, 1);
      hb.fillRect(u.x - 8, u.y - 18, 17 * (u.hp / u.maxHp), 3);
    }
  }

 syncRiders(): void {
   const riders = this.sim.state.riders ?? [];
   const ids = new Set(riders.map((r: any) => r.id));
   for (const [id, c] of this.riderSprites) {
     if (!ids.has(id)) {
       this.tweens.killTweensOf(c);
       c.list.forEach((ch: any) => this.tweens.killTweensOf(ch));
       c.destroy();
       this.riderSprites.delete(id);
     }
   }
   const roundTime = this.sim.state.roundTime;
   for (const r of riders) {
     if (r.spawnAt > roundTime) continue;
     let c = this.riderSprites.get(r.id);
     if (!c) {
       c = this.add.container(r.x, r.y);
       // ground shadow
       const shadow = this.add.ellipse(0, 16, 26, 7, 0x000000, 0.35);
       c.add(shadow);
       // rear wheel (bottom)
       const rearWheel = this.add.rectangle(0, 12, 16, 6, 0x1e1e23);
       const rearWheelHi = this.add.rectangle(0, 9, 16, 2, 0x9696a0);
       // front wheel (top)
       const frontWheel = this.add.rectangle(0, -10, 14, 6, 0x1e1e23);
       const frontWheelHi = this.add.rectangle(0, -13, 14, 2, 0x9696a0);
       // frame (vertical)
       const frame = this.add.rectangle(0, 2, 8, 20, 0x50505a);
       const frameHi = this.add.rectangle(-2, 2, 2, 20, 0x9696a0);
       const frameShade = this.add.rectangle(2, 2, 2, 20, 0x1e1e23);
       // seat
       const seat = this.add.rectangle(0, 4, 10, 3, 0x1e1e23);
       // handlebars (top)
       const handleL = this.add.rectangle(-6, -8, 6, 2, 0x9696a0);
       const handleR = this.add.rectangle(6, -8, 6, 2, 0x9696a0);
       // rider legs
       const legL = this.add.rectangle(-3, 6, 3, 8, 0xc8a000);
       const legR = this.add.rectangle(3, 6, 3, 8, 0xc8a000);
       // rider body (sitting)
       const body = this.add.rectangle(0, -1, 10, 8, 0xffcc00);
       const bodyShade = this.add.rectangle(0, 2, 10, 2, 0xc8a000);
       // bag
       const bag = this.add.rectangle(6, -1, 5, 5, 0xffffff);
       const bagShade = this.add.rectangle(6, 1, 5, 1, 0xdcdcdc);
       // helmet
       const helmet = this.add.ellipse(0, -9, 12, 10, 0xffcc00);
       const helmetHi = this.add.rectangle(0, -13, 12, 2, 0xffe650);
       const helmetShade = this.add.rectangle(0, -5, 12, 2, 0xc8a000);
       // ears/antennae
       const earL = this.add.rectangle(-4, -13, 2, 5, 0xffffff);
       const earR = this.add.rectangle(4, -13, 2, 5, 0xffffff);
       // top lamp on head (chases)
       const lampGlow = this.add.rectangle(0, -15, 6, 2, 0xc8f0ff, 0.7);
       const lamp = this.add.rectangle(0, -15, 4, 2, 0x78dcff);
       c.add([rearWheel, rearWheelHi, frontWheel, frontWheelHi, frame, frameHi, frameShade, seat, handleL, handleR, legL, legR, body, bodyShade, bag, bagShade, helmet, helmetHi, helmetShade, earL, earR, lampGlow, lamp]);
       // pulsing lamp chase effect
       this.tweens.add({ targets: [lamp, lampGlow], alpha: { from: 1, to: 0.4 }, duration: 300, yoyo: true, repeat: -1 });
       this.riderSprites.set(r.id, c);
     }
     c.setPosition(r.x, r.y);
   }
 }
}