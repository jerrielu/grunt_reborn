import { createRunState, BattleSim } from "../../src/core/battle/BattleSim";
import type { RunState } from "../../src/core/types";

export interface TranscriptLine { text: string; }

export function runHeadless(seed: number, generalId: string, opts: { maxLevels?: number; maxRounds?: number; botPlay?: (sim: BattleSim) => void } = {}): { sim: BattleSim; transcript: string[] } {
  const maxLevels = opts.maxLevels ?? 3;
  const maxRounds = opts.maxRounds ?? 200;
  const state = createRunState(seed, generalId);
  const sim = new BattleSim(state);
  const transcript: string[] = [];
  sim.events.onAll((e) => transcript.push(`[${e.type}] t=${e.t.toFixed(2)} ${JSON.stringify(e.data)}`));

  let levelsDone = 0;
  let guard = 0;
  while (state.phase !== "over" && levelsDone < maxLevels && guard < 100000) {
    guard++;
    // fight phase: tick
    if (state.phase === "fight") {
      sim.update(0.1);
      continue;
    }
    if (state.phase === "reward") {
      const choices = state.rewardChoices.length ? state.rewardChoices : ["omnislash"];
      const pick = choices[0] ?? "omnislash";
      sim.confirmReward(pick);
      levelsDone++;
      continue;
    }
    break;
  }
  return { sim, transcript };
}
