import type { RunState, Buff, Unit, SummonUnit } from "../types";
import { getCard } from "../../config/cards";
import { heal } from "../combat";

const MAX_SUMMONS = 4;

function makeBuff(cardId: string, name: string, rounds: number, partial: Partial<Buff>, rng: { int: (a: number, b: number) => number }): Buff {
  return {
    id: cardId + "_" + rng.int(1000, 9999),
    kind: "tactic",
    name,
    roundsRemaining: rounds,
    speedMul: 1, attackIntervalMul: 1, damageTakenMul: 1, damageDealtMul: 1, attackRangeAdd: 0,
    behavior: null, autoSkill: null, autoSkillUsedThisRound: false,
    ...partial,
  };
}

function activeTactics(state: RunState): Buff[] {
  return state.buffs.filter((b) => b.kind === "tactic" && b.roundsRemaining > 0);
}

export interface PlayResult { ok: boolean; reason?: string; }

export function playCard(state: RunState, cardId: string, rng: { int: (a: number, b: number) => number }, emit: (type: string, data: Record<string, unknown>) => void): PlayResult {
  const def = getCard(cardId);
  if (!def) return { ok: false, reason: "unknown" };
  if (state.phase !== "fight" && state.phase !== "decide") return { ok: false, reason: "not-fight" };

  // Tactic
  if (def.type === "tactic") {
    // same-type overwrite: remove existing tactic with same id
    state.buffs = state.buffs.filter((b) => !(b.kind === "tactic" && b.name === def.name));
    const rounds = def.durationRounds ?? 2;
    const buff = makeBuff(cardId, def.name, rounds, tacticMods(cardId), rng);
    state.buffs.push(buff);
    emit("card.played", { cardId, type: "tactic", name: def.name });
    emit("buff.applied", { name: def.name, rounds });
    return { ok: true };
  }

  // Equipment
  if (def.type === "equipment") {
    const slot = def.equipmentSlot!;
    state.equipment[slot] = cardId;
    applyEquipment(state, cardId, emit);
    emit("card.played", { cardId, type: "equipment", name: def.name, slot });
    emit("heroEquipmentChanged", { slot, cardId });
    return { ok: true };
  }

  // Instant
  if (def.type === "instant") {
    applyInstant(state, cardId, rng, emit);
    emit("card.played", { cardId, type: "instant", name: def.name });
    return { ok: true };
  }

  // Summon
  if (def.type === "summon") {
    const alive = state.summons.filter((s) => s.alive).length;
    const toSpawn = cardId === "summonRally" ? 2 : 1;
    if (alive + toSpawn > MAX_SUMMONS) {
      emit("card.rejected", { cardId, reason: "summon.full" });
      return { ok: false, reason: "summon.full" };
    }
    for (let i = 0; i < toSpawn; i++) {
      spawnSummon(state, cardId, emit);
    }
    if (cardId === "summonRally") {
      // hero takes +15% damage this round
      state.roundBuffs.heroDamageTakenBoost *= 1.15;
    }
    emit("card.played", { cardId, type: "summon", name: def.name, count: toSpawn });
    return { ok: true };
  }

  return { ok: false, reason: "unhandled" };
}

function tacticMods(cardId: string): Partial<Buff> {
  switch (cardId) {
    case "charge": return { behavior: "charge", speedMul: 1.3, attackRangeAdd: 8 };
    case "guard": return { behavior: "guard", damageTakenMul: 0.75 };
    case "assassinate": return { behavior: "assassinate" };
    case "frenzy": return { behavior: "frenzy", attackIntervalMul: 0.6, damageTakenMul: 1.2 };
    case "bait": return { behavior: "bait", speedMul: 1.1 };
    case "slowHit": return { behavior: "slowHit", attackIntervalMul: 1.6 };
    case "lurk": return { behavior: "lurk", damageDealtMul: 1.0 };
    case "steady": return { behavior: "steady", roundsRemaining: 3 };
    case "bloodbath": return { behavior: "bloodbath", autoSkill: "aoeSlamOnLowHp" };
    default: return {};
  }
}

function applyEquipment(state: RunState, cardId: string, emit: (t: string, d: Record<string, unknown>) => void): void {
  const hero = state.hero;
  if (cardId === "spear") {
    hero.attackRange += 12;
  } else if (cardId === "dagger") {
    hero.attackInterval *= 0.8;
  } else if (cardId === "heavyArmor") {
    const add = Math.round(hero.maxHp * 0.2);
    hero.maxHp += add;
    hero.hp += add;
    hero.damageTakenMul *= 0.88;
    hero.speedMul *= 0.9;
  } else if (cardId === "swiftBoots") {
    hero.speedMul *= 1.25;
  }
}

function applyInstant(state: RunState, cardId: string, rng: { int: (a: number, b: number) => number }, emit: (t: string, d: Record<string, unknown>) => void): void {
  const hero = state.hero;
  if (cardId === "shockwave") {
    const dmg = 15;
    for (const e of state.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - hero.x, e.y - hero.y) <= 90) {
        e.hp = Math.max(0, e.hp - dmg);
        // knockback
        const dx = e.x - hero.x; const dy = e.y - hero.y; const len = Math.hypot(dx, dy) || 1;
        e.knockVx += (dx / len) * 200;
        e.knockVy += (dy / len) * 200;
        if (e.hp <= 0) { e.alive = false; emit("unit.died", { id: e.id, side: "enemy" }); }
      }
    }
    emit("instant.shockwave", { dmg });
  } else if (cardId === "firstAid") {
    const amt = Math.round(hero.maxHp * 0.25);
    heal(hero, amt);
    emit("instant.firstAid", { heal: amt });
  } else if (cardId === "disrupt") {
    state.roundBuffs.slowEnemies = 0.5;
    emit("instant.disrupt", {});
  } else if (cardId === "roar") {
    state.roundBuffs.heroDamageBoost = 1.5;
    emit("instant.roar", {});
  } else if (cardId === "shenzhenLight") {
    const count = 6;
    // spawn in small batches from left and right sides, staggered, not neatly
    const batches: { side: "left" | "right"; offset: number; n: number }[] = [
      { side: "left", offset: 0, n: 2 },
      { side: "right", offset: 0.18, n: 2 },
      { side: "left", offset: 0.36, n: 1 },
      { side: "right", offset: 0.54, n: 1 },
    ];
    for (const b of batches) {
      for (let i = 0; i < b.n; i++) {
        const id = state.nextUnitId++;
        const x = b.side === "left" ? rng.int(12, 58) : rng.int(122, 168);
        state.riders.push({
          id,
          x,
          baseX: x,
          y: 335 - 10,
          speed: 260,
          damage: 18,
          radius: 10,
          alive: true,
          hitIds: [],
          crashed: false,
          explodeRadius: 46,
          explodeDamage: 28,
          spawnAt: state.roundTime + b.offset,
        });
      }
    }
    emit("instant.shenzhenLight", { count });
  }
}

function spawnSummon(state: RunState, cardId: string, emit: (t: string, d: Record<string, unknown>) => void): void {
  const id = state.nextUnitId++;
  let name = "步卒"; let hp = 40; let dmg = 6; let range = 34; let speed = 70; let interval = 0.9;
  if (cardId === "summonSpearman") { name = "矛手"; hp = 25; dmg = 10; range = 56; speed = 60; interval = 1.0; }
  else if (cardId === "summonShieldman") { name = "盾兵"; hp = 80; dmg = 4; range = 30; speed = 50; interval = 1.1; }
  const sm: SummonUnit = {
    id, side: "summon", name, x: state.hero.x + 20, y: state.hero.y + 20,
    hp, maxHp: hp, speed, attackDamage: dmg, attackRange: range, attackInterval: interval, attackCooldown: 0,
    radius: 12, alive: true, targetId: null, facing: 0,
    damageTakenMul: 1, damageDealtMul: 1, speedMul: 1, attackIntervalMul: 1, knockVx: 0, knockVy: 0,
  };
  state.summons.push(sm);
  emit("summon.spawn", { id, name, count: state.summons.filter((s) => s.alive).length });
}

export { MAX_SUMMONS };
