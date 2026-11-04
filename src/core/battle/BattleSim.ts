import type { RunState, HeroUnit, EnemyUnit, SummonUnit, Unit } from "../types";
import { EventEmitter } from "../events";
import { Rng } from "../rng";
import { applyDamage, heal, knockback, distance, findNearest } from "../combat";
import { playCard as playCardImpl } from "../cards/CardEngine";
import { CARDS } from "../../config/cards";

const ARENA = { w: 180, h: 288 };
const WALL = 12;

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

function makeHero(id: number, generalId: string): HeroUnit {
  const base: HeroUnit = {
    id, side: "hero", name: "主角", x: ARENA.w / 2, y: ARENA.h / 2, hp: 120, maxHp: 120,
    speed: 90, attackDamage: 12, attackRange: 46, attackInterval: 0.7, attackCooldown: 0,
    radius: 14, alive: true, targetId: null, facing: 0,
    damageTakenMul: 1, damageDealtMul: 1, speedMul: 1, attackIntervalMul: 1,
    knockVx: 0, knockVy: 0, lowHpThreshold: 0.3, retreating: false,
  };
  if (generalId === "vanguard") { base.speed = 105; base.attackDamage = 13; base.maxHp = 110; base.hp = 110; }
  if (generalId === "summoner") { base.maxHp = 115; base.hp = 115; }
  return base;
}

export function createRunState(seed: number, generalId: string): RunState {
  const rng = new Rng(seed);
  const hero = makeHero(1, generalId);
  const wavesTotal = 3 + Math.min(2, Math.floor(0 / 2));
  const starterMap: Record<string, string[]> = {
    shoucheng: ["steady", "guard", "heavyArmor", "firstAid", "summonFootman", "spear"],
    vanguard: ["charge", "frenzy", "assassinate", "dagger", "swiftBoots", "shockwave"],
    summoner: ["summonFootman", "summonShieldman", "summonSpearman", "summonRally", "guard", "disrupt"],
  };
  const starterIds = starterMap[generalId] ?? starterMap.shoucheng;
  const deck = starterIds.map((defId, i) => ({ instanceId: 100 + i, defId }));
  const state: RunState = {
    seed, generalId, level: 1, round: 0, phase: "fight", timer: 10, fightSeconds: 10,
    hero, enemies: [], summons: [],
    deck, equipment: { weapon: null, armor: null, boots: null },
    buffs: [], roundBuffs: { slowEnemies: 1, heroDamageBoost: 1, heroDamageTakenBoost: 1 },
    kills: 0, elitesKilled: 0, bossesKilled: 0, levelsCleared: 0,
    nextUnitId: 2, spawnQueue: [], roundTime: 0, levelTime: 0, nextDrawAt: 0, waveIndex: 0, wavesTotal,
    eliteSpawned: false, bossSpawned: false, rewardChoices: [],
    rngState: rng.getState(), tutorial: false, tutorialStep: 0,
  };
  return state;
}

export class BattleSim {
  state: RunState;
  events: EventEmitter;
  rng: Rng;

  constructor(state: RunState) {
    this.state = state;
    this.events = new EventEmitter();
    this.rng = new Rng(state.seed);
    this.rng.setState(state.rngState);
    this.startLevel();
  }

  private emit(type: string, data: Record<string, unknown> = {}): void {
    this.events.emit({ type, data, t: this.state.roundTime });
  }

  startLevel(): void {
    const s = this.state;
    s.enemies = []; s.summons = []; s.spawnQueue = [];
    s.round = s.round + 1;
    s.roundTime = 0;
    s.levelTime = 0;
    s.phase = "fight";
    s.eliteSpawned = false; s.bossSpawned = false;
    s.waveIndex = 0;
    s.wavesTotal = 3 + Math.min(2, Math.floor((s.level - 1) / 2));
    s.fightSeconds = 10;
    // schedule waves
    const perWave = 3 + Math.floor((s.level - 1) / 1);
    const hpMul = 1 + 0.25 * (s.level - 1);
    const atkMul = 1 + 0.12 * (s.level - 1);
    for (let w = 0; w < s.wavesTotal; w++) {
      const t = 1 + w * 6;
      for (let i = 0; i < perWave; i++) {
        s.spawnQueue.push({ kind: "grunt", at: t + i * 0.3 });
      }
    }
    // store scaling on state via a side channel (balance): recompute in spawn
    (s as any)._hpMul = hpMul;
    (s as any)._atkMul = atkMul;
    this.emit("level.start", { level: s.level, waves: s.wavesTotal });
    s.nextDrawAt = 5;
    this.drawCard();
    this.emit("phase.changed", { phase: "fight" });
  }

  update(dt: number): void {
    const s = this.state;
    if (s.phase !== "fight") return;
    s.roundTime += dt;
    s.levelTime += dt;
    s.timer = s.fightSeconds - s.roundTime;

    // process spawns
    const remaining: typeof s.spawnQueue = [];
    for (const sp of s.spawnQueue) {
      if (s.roundTime >= sp.at) {
        this.spawnEnemy(sp.kind);
      } else {
        remaining.push(sp);
      }
    }
    s.spawnQueue = remaining;

    // elite spawn after all waves + delay
    if (!s.eliteSpawned && s.spawnQueue.length === 0 && s.enemies.filter(e => e.alive).length === 0) {
      if (s.levelTime > (s.wavesTotal * 6 + 2)) {
        this.spawnEnemy("elite");
        s.eliteSpawned = true;
      }
    }
    // boss spawn after elite dead
    if (s.eliteSpawned && !s.bossSpawned && s.enemies.filter(e => e.alive && e.isElite).length === 0 && s.enemies.filter(e => e.alive).length === 0) {
      if (s.levelTime > (s.wavesTotal * 6 + 6)) {
        this.spawnEnemy("boss");
        s.bossSpawned = true;
        s.roundTime = 0;
        s.fightSeconds = 7;
        s.timer = 7;
      }
    }

    // tick units
    this.tickHero(dt);
    for (const e of s.enemies) if (e.alive) this.tickEnemy(e, dt);
    for (const sm of s.summons) if (sm.alive) this.tickSummon(sm, dt);

    // knockback decay + apply
    for (const u of this.allUnits()) {
      if (!u.alive) continue;
      u.x += u.knockVx * dt;
      u.y += u.knockVy * dt;
      u.knockVx *= Math.pow(0.1, dt);
      u.knockVy *= Math.pow(0.1, dt);
      u.x = clamp(u.x, WALL, ARENA.w - WALL);
      u.y = clamp(u.y, WALL, ARENA.h - WALL);
    }

    // separation
    this.separate();

    // deaths handling
    this.handleDeaths();

    // level clear check
    if (s.bossSpawned && s.enemies.filter(e => e.alive && e.isBoss).length === 0 && s.enemies.filter(e => e.alive).length === 0) {
      this.levelClear();
    }

    // automatic card draw every 5s
    if (s.levelTime >= s.nextDrawAt) {
      this.drawCard();
      s.nextDrawAt += 5;
    }
  }

  private allUnits(): Unit[] {
    const s = this.state;
    return [s.hero, ...s.enemies, ...s.summons];
  }

  private spawnEnemy(kind: "grunt" | "elite" | "boss"): void {
    const s = this.state;
    const id = s.nextUnitId++;
    const hpMul = (s as any)._hpMul ?? 1;
    const atkMul = (s as any)._atkMul ?? 1;
    const edge = this.rng.int(0, 3);
    let x = 0, y = 0;
    if (edge === 0) { x = this.rng.int(WALL, ARENA.w - WALL); y = WALL + 20; }
    else if (edge === 1) { x = ARENA.w - WALL - 20; y = this.rng.int(WALL, ARENA.h - WALL); }
    else if (edge === 2) { x = this.rng.int(WALL, ARENA.w - WALL); y = ARENA.h - WALL - 20; }
    else { x = WALL + 20; y = this.rng.int(WALL, ARENA.h - WALL); }

    if (kind === "grunt") {
      const e: EnemyUnit = {
        id, side: "enemy", name: "敌卒", x, y, hp: Math.round(30 * hpMul), maxHp: Math.round(30 * hpMul),
        speed: 55, attackDamage: Math.round(6 * atkMul), attackRange: 34, attackInterval: 0.9, attackCooldown: 0,
        radius: 12, alive: true, targetId: null, facing: 0,
        damageTakenMul: 1, damageDealtMul: 1, speedMul: 1, attackIntervalMul: 1, knockVx: 0, knockVy: 0,
        kind: "grunt", isElite: false, isBoss: false,
      };
      s.enemies.push(e);
      this.emit("unit.spawned", { id, side: "enemy", kind: "grunt", x, y });
    } else if (kind === "elite") {
      const e: EnemyUnit = {
        id, side: "enemy", name: "敌将", x, y, hp: Math.round(120 * hpMul), maxHp: Math.round(120 * hpMul),
        speed: 65, attackDamage: Math.round(12 * atkMul), attackRange: 40, attackInterval: 0.8, attackCooldown: 0,
        radius: 16, alive: true, targetId: null, facing: 0,
        damageTakenMul: 1, damageDealtMul: 1, speedMul: 1, attackIntervalMul: 1, knockVx: 0, knockVy: 0,
        kind: "elite", isElite: true, isBoss: false,
      };
      s.enemies.push(e);
      this.emit("unit.spawned", { id, side: "enemy", kind: "elite", x, y });
    } else {
      const e: EnemyUnit = {
        id, side: "enemy", name: "BOSS", x: ARENA.w / 2, y: WALL + 40, hp: Math.round(400 * hpMul), maxHp: Math.round(400 * hpMul),
        speed: 50, attackDamage: Math.round(18 * atkMul), attackRange: 50, attackInterval: 1.0, attackCooldown: 0,
        radius: 24, alive: true, targetId: null, facing: 0,
        damageTakenMul: 1, damageDealtMul: 1, speedMul: 1, attackIntervalMul: 1, knockVx: 0, knockVy: 0,
        kind: "boss", isElite: false, isBoss: true,
      };
      s.enemies.push(e);
      this.emit("unit.spawned", { id, side: "enemy", kind: "boss", x: e.x, y: e.y });
    }
  }

  private tickHero(dt: number): void {
    const s = this.state;
    const h = s.hero;
    if (!h.alive) return;
    // active tactic buffs
    const tactics = s.buffs.filter(b => b.kind === "tactic" && b.roundsRemaining > 0);
    const activeBehavior = tactics.length ? tactics[tactics.length - 1].behavior : null;

    // low hp retreat flag
    const lowHp = h.hp / h.maxHp < h.lowHpThreshold;
    let retreating = lowHp && activeBehavior !== "charge" && activeBehavior !== "guard";
    h.retreating = retreating;

    // target selection
    let target: Unit | null = null;
    const enemies = s.enemies.filter(e => e.alive);
    const assaultFilter = activeBehavior === "assassinate" ? (e: EnemyUnit) => e.isElite || e.isBoss : undefined;
    if (activeBehavior === "guard") {
      // only close enemies
      target = findNearest(h, enemies, (e) => distance(h, e) <= h.attackRange + 20);
    } else if (assaultFilter) {
      const elites = enemies.filter(e => (e as EnemyUnit).isElite || (e as EnemyUnit).isBoss);
      target = elites.length ? findNearest(h, elites) : findNearest(h, enemies);
    } else {
      target = findNearest(h, enemies);
    }

    // movement
    const speed = h.speed * h.speedMul * (activeBehavior === "charge" ? 1.3 : 1);
    if (target && activeBehavior !== "guard") {
      const d = distance(h, target);
      if (d > h.attackRange * 0.9) {
        if (retreating && d > h.attackRange * 1.5) {
          // retreat: move away from target slightly
          const dx = h.x - target.x; const dy = h.y - target.y; const len = Math.hypot(dx, dy) || 1;
          h.x += (dx / len) * speed * 0.4 * dt;
          h.y += (dy / len) * speed * 0.4 * dt;
        } else {
          const dx = target.x - h.x; const dy = target.y - h.y; const len = Math.hypot(dx, dy) || 1;
          h.x += (dx / len) * speed * dt;
          h.y += (dy / len) * speed * dt;
        }
      }
    }
    // charge: bias toward densest cluster
    if (activeBehavior === "charge" && enemies.length > 0) {
      const cx = enemies.reduce((a, e) => a + e.x, 0) / enemies.length;
      const cy = enemies.reduce((a, e) => a + e.y, 0) / enemies.length;
      const dx = cx - h.x; const dy = cy - h.y; const len = Math.hypot(dx, dy) || 1;
      if (len > h.attackRange) {
        h.x += (dx / len) * speed * dt;
        h.y += (dy / len) * speed * dt;
      }
    }

    // attack
    h.attackCooldown = Math.max(0, h.attackCooldown - dt);
    if (target && distance(h, target) <= h.attackRange + 4 && h.attackCooldown <= 0) {
      const intervalMul = h.attackIntervalMul * (tactics.some(t => t.name === "狂攻") ? 0.6 : 1); // simplified; real via buff mods
      const dmgMul = h.damageDealtMul * s.roundBuffs.heroDamageBoost;
      // backstab check for 寻隙
      let backstab = false;
      if (activeBehavior === "lurk") {
        // enemy facing points toward hero; back = opposite. Check if hero is behind target
        const ex = target.x, ey = target.y;
        const fx = Math.cos(target.facing), fy = Math.sin(target.facing);
        // vector from enemy to hero
        const vx = h.x - ex, vy = h.y - ey;
        const dot = vx * fx + vy * fy;
        if (dot < 0) backstab = true; // hero is behind (opposite facing)
      }
      const dmg = Math.round(h.attackDamage * dmgMul * (backstab ? 1.35 : 1));
      const res = applyDamage(target, dmg, 1);
      h.attackCooldown = h.attackInterval * intervalMul;
      // lifesteal for 稳扎
      if (tactics.some(t => t.behavior === "steady")) {
        heal(h, Math.max(1, Math.round(dmg * 0.05)));
      }
      this.emit("hero.attack", { targetId: target.id, dmg, killed: res.killed, backstab });
      if (res.killed) {
        this.onEnemyKilled(target as EnemyUnit);
      }
      // 浴血 auto-skill: low hp aoe slam once per round
      const bath = tactics.find(t => t.autoSkill === "aoeSlamOnLowHp");
      if (bath && !bath.autoSkillUsedThisRound && h.hp / h.maxHp < 0.2) {
        bath.autoSkillUsedThisRound = true;
        // aoe damage to enemies within 80
        for (const e of s.enemies) {
          if (!e.alive) continue;
          if (distance(h, e) <= 80) {
            const r = applyDamage(e, h.attackDamage * 2, 1);
            this.emit("hero.autoSkill", { skill: "aoeSlam", targetId: e.id, dmg: h.attackDamage * 2, killed: r.killed });
            if (r.killed) this.onEnemyKilled(e);
          }
        }
      }
    }
    h.targetId = target ? target.id : null;
  }

  private tickEnemy(e: EnemyUnit, dt: number): void {
    const s = this.state;
    // target: hero or summons (summons with threat bonus for shield)
    let target: Unit = s.hero;
    let bestD = distance(e, s.hero);
    for (const sm of s.summons) {
      if (!sm.alive) continue;
      const d = distance(e, sm);
      // shield taunt: if summon is shield (name contains 盾) and within 120, prefer
      const taunt = sm.name.includes("盾") && d <= 120;
      const effD = taunt ? d * 0.5 : d;
      if (effD < bestD) { bestD = effD; target = sm; }
    }
    e.targetId = target.id;
    // facing
    const dx = target.x - e.x; const dy = target.y - e.y;
    e.facing = Math.atan2(dy, dx);
    // slow
    const slowMul = s.roundBuffs.slowEnemies;
    const speed = e.speed * e.speedMul * slowMul;
    const d = distance(e, target);
    if (d > e.attackRange * 0.9) {
      const len = Math.hypot(dx, dy) || 1;
      e.x += (dx / len) * speed * dt;
      e.y += (dy / len) * speed * dt;
    }
    e.attackCooldown = Math.max(0, e.attackCooldown - dt);
    if (d <= e.attackRange + 4 && e.attackCooldown <= 0) {
      const dmgMul = e.damageDealtMul;
      const res = applyDamage(target as any, e.attackDamage, dmgMul);
      e.attackCooldown = e.attackInterval * e.attackIntervalMul;
      this.emit("enemy.attack", { attackerId: e.id, targetId: target.id, dmg: e.attackDamage, killed: res.killed });
      if (res.killed && target.side === "hero") {
        this.heroDied();
      }
      if (res.killed && target.side === "summon") {
        // remove summon
        const sm = s.summons.find(x => x.id === target.id);
        if (sm) sm.alive = false;
        this.emit("unit.died", { id: target.id, side: "summon" });
      }
    }
  }

  private tickSummon(sm: SummonUnit, dt: number): void {
    const s = this.state;
    const enemies = s.enemies.filter(e => e.alive);
    const target = findNearest(sm, enemies);
    if (!target) { sm.targetId = null; return; }
    sm.targetId = target.id;
    const dx = target.x - sm.x; const dy = target.y - sm.y;
    const d = distance(sm, target);
    const speed = sm.speed * sm.speedMul;
    if (d > sm.attackRange * 0.9) {
      const len = Math.hypot(dx, dy) || 1;
      sm.x += (dx / len) * speed * dt;
      sm.y += (dy / len) * speed * dt;
    }
    sm.attackCooldown = Math.max(0, sm.attackCooldown - dt);
    if (d <= sm.attackRange + 4 && sm.attackCooldown <= 0) {
      const res = applyDamage(target, sm.attackDamage, sm.damageDealtMul);
      sm.attackCooldown = sm.attackInterval * sm.attackIntervalMul;
      this.emit("summon.attack", { attackerId: sm.id, targetId: target.id, dmg: sm.attackDamage, killed: res.killed });
      if (res.killed) this.onEnemyKilled(target);
    }
  }

  private separate(): void {
    const units = this.allUnits().filter(u => u.alive);
    for (let i = 0; i < units.length; i++) {
      for (let j = i + 1; j < units.length; j++) {
        const a = units[i], b = units[j];
        const d = distance(a, b);
        const minD = a.radius + b.radius;
        if (d < minD && d > 0) {
          const push = (minD - d) * 0.3;
          const dx = (b.x - a.x) / d; const dy = (b.y - a.y) / d;
          a.x -= dx * push; a.y -= dy * push;
          b.x += dx * push; b.y += dy * push;
        }
      }
    }
  }

  private handleDeaths(): void {
    const s = this.state;
    for (const e of s.enemies) {
      if (!e.alive && !(e as any)._deathHandled) {
        (e as any)._deathHandled = true;
        this.emit("unit.died", { id: e.id, side: "enemy", kind: e.kind });
      }
    }
    for (const sm of s.summons) {
      if (!sm.alive && !(sm as any)._deathHandled) {
        (sm as any)._deathHandled = true;
        this.emit("unit.died", { id: sm.id, side: "summon" });
      }
    }
  }

  private onEnemyKilled(e: EnemyUnit): void {
    const s = this.state;
    s.kills++;
    if (e.isElite) s.elitesKilled++;
    if (e.isBoss) s.bossesKilled++;
    this.emit("enemy.killed", { id: e.id, kind: e.kind });
  }

  private heroDied(): void {
    const s = this.state;
    s.hero.alive = false;
    s.phase = "over";
    this.emit("hero.died", {});
    this.emit("phase.changed", { phase: "over" });
  }

  private levelClear(): void {
    const s = this.state;
    s.levelsCleared++;
    s.phase = "reward";
    const healAmt = Math.round(s.hero.maxHp * 0.3);
    heal(s.hero, healAmt);
    // reward choices: 3 distinct cards from a small pool
    const pool = ["charge", "guard", "assassinate", "frenzy", "spear", "firstAid", "summonFootman", "shockwave"];
    const rng = this.rng;
    const picks: string[] = [];
    const avail = [...pool];
    while (picks.length < 3 && avail.length) {
      const i = rng.int(0, avail.length - 1);
      picks.push(avail.splice(i, 1)[0]);
    }
    s.rewardChoices = picks;
    this.emit("level.cleared", { level: s.level, heal: healAmt, choices: picks });
    this.emit("phase.changed", { phase: "reward" });
  }

  // Public helpers for external control
  drawCard(): void {
    const s = this.state;
    const pool = CARDS.map((c) => c.id);
    const id = pool[this.rng.int(0, pool.length - 1)];
    const inst = { instanceId: s.nextUnitId++, defId: id };
    s.deck.push(inst);
    this.emit("card.drawn", { defId: id, instanceId: inst.instanceId });
  }

  playCard(cardId: string): { ok: boolean; reason?: string } {
    const res = playCardImpl(this.state, cardId, this.rng, (type, data) => this.emit(type, data));
    if (res.ok) {
      // consume the played card from hand/deck
      const s = this.state;
      const idx = s.deck.findIndex((c) => c.defId === cardId);
      if (idx >= 0) s.deck.splice(idx, 1);
      this.emit("card.played", { cardId, ok: true });
    } else this.emit("card.rejected", { cardId, reason: res.reason });
    return res;
  }

  skipCard(): void { this.endDecide(); }

  endDecide(): void { this.nextRoundStart(); }

  confirmReward(choiceCardId: string): void {
    const s = this.state;
    // add card to deck
    s.deck.push({ instanceId: s.nextUnitId++, defId: choiceCardId });
    s.level += 1;
    this.startLevel();
  }

  nextRoundStart(): void {
    const s = this.state;
    s.round += 1;
    // decrement tactic buffs
    for (const b of s.buffs) {
      if (b.kind === "tactic") b.roundsRemaining -= 1;
      b.autoSkillUsedThisRound = false;
    }
    s.buffs = s.buffs.filter(b => b.roundsRemaining > 0 || b.kind !== "tactic");
    // reset round-scoped
    s.roundBuffs = { slowEnemies: 1, heroDamageBoost: 1, heroDamageTakenBoost: 1 };
    s.roundTime = 0;
    s.timer = s.fightSeconds;
    s.phase = "fight";
    this.emit("round.start", { round: s.round });
    this.emit("phase.changed", { phase: "fight" });
  }
}
