import type { RunState, Buff } from "../types";
import { getCard } from "../../config/cards";


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


  return { ok: false, reason: "unhandled" };
}

function tacticMods(cardId: string): Partial<Buff> {
  return {};
}

function applyEquipment(state: RunState, cardId: string, emit: (t: string, d: Record<string, unknown>) => void): void {
  // omnislash has no stat mods; effect handled in BattleSim
}

function applyInstant(state: RunState, cardId: string, rng: { int: (a: number, b: number) => number }, emit: (t: string, d: Record<string, unknown>) => void): void {
  const hero = state.hero;
  if (cardId === "shenzhenLight") {
    const count = 6;
    let cursor = state.roundTime;
    for (let i = 0; i < count; i++) {
      const id = state.nextUnitId++;
      const side = i % 2 === 0 ? "left" : "right";
      const x = side === "left" ? rng.int(12, 58) : rng.int(122, 168);
      cursor += 0.1 + (rng.int(0, 4) / 10); // 0.1..0.5
      state.riders.push({
        id,
        x,
        baseX: x,
        y: 335 - 10,
        speed: 360,
        damage: 18,
        radius: 10,
        alive: true,
        hitIds: [],
        crashed: false,
        explodeRadius: 46,
        explodeDamage: 28,
        spawnAt: cursor,
        vx: 0,
        vy: -360,
      });
    }
    emit("instant.shenzhenLight", { count });
  }
}

