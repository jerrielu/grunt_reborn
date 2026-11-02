import type { Unit, EnemyUnit, HeroUnit, SummonUnit } from "./types";

export interface DamageResult { target: Unit; amount: number; killed: boolean; }

export function applyDamage(target: Unit, rawAmount: number, sourceMul = 1): DamageResult {
  const takenMul = target.damageTakenMul ?? 1;
  const amount = Math.max(1, Math.round(rawAmount * sourceMul * takenMul));
  target.hp = Math.max(0, target.hp - amount);
  const killed = target.hp <= 0;
  if (killed) target.alive = false;
  return { target, amount, killed };
}

export function heal(target: Unit, amount: number): number {
  const before = target.hp;
  target.hp = Math.min(target.maxHp, target.hp + amount);
  return target.hp - before;
}

export function knockback(target: Unit, fromX: number, fromY: number, strength: number): void {
  const dx = target.x - fromX;
  const dy = target.y - fromY;
  const len = Math.hypot(dx, dy) || 1;
  target.knockVx += (dx / len) * strength;
  target.knockVy += (dy / len) * strength;
}

export function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function findNearest<T extends { x: number; y: number; alive: boolean }>(
  from: { x: number; y: number },
  candidates: T[],
  filter?: (c: T) => boolean,
): T | null {
  let best: T | null = null;
  let bestD = Infinity;
  for (const c of candidates) {
    if (!c.alive) continue;
    if (filter && !filter(c)) continue;
    const d = distance(from, c);
    if (d < bestD) { bestD = d; best = c; }
  }
  return best;
}
