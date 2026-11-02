import type { RunState } from "../types";

export function computePoints(state: RunState, globalMultiplier = 1): number {
  const base = state.levelsCleared * 100 + state.elitesKilled * 30 + state.bossesKilled * 150 + state.kills * 2;
  return Math.round(base * globalMultiplier);
}
