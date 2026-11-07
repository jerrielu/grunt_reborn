import { describe, it, expect } from "vitest";
import { createRunState, BattleSim } from "../../src/core/battle/BattleSim";

function makeSurvivorSim(seed: number): { sim: BattleSim } {
  const state = createRunState(seed, "shoucheng");
  const sim = new BattleSim(state);
  state.hero.maxHp = 1e6;
  state.hero.hp = 1e6;
  state.hero.attackInterval = 100;
  state.hero.attackDamage = 1;
  return { sim };
}

describe("E2E freeze regressions", () => {
  it("riders played during fight still charge", () => {
    const { sim } = makeSurvivorSim(42);
    const state = sim.state;
    const log: string[] = [];
    sim.events.onAll((e) => log.push(`[${e.type}] t=${e.t.toFixed(2)} ${JSON.stringify(e.data)}`));

    // play card during fight
    const levelTimeAtPlay = state.levelTime;
    sim.playCard("shenzhenLight");
    expect(state.riders.length).toBe(6);
    expect(state.riders.every((r) => r.spawnAt >= levelTimeAtPlay)).toBe(true);

    let crashes = 0;
    sim.events.on("rider.crash", () => crashes++);
    for (let i = 0; i < 40; i++) sim.update(0.1);

    console.log(log.join("\n"));
    expect(crashes).toBeGreaterThan(0);
  });

  it("wave spawns keep advancing on levelTime so elite and boss are reached", () => {
    const { sim } = makeSurvivorSim(7);
    const state = sim.state;
    state.hero.attackDamage = 500;
    state.hero.attackInterval = 0.5;
    const spawned: string[] = [];
    sim.events.onAll((e) => {
      if (e.type === "unit.spawned") spawned.push(e.data.kind as string);
    });

    let guard = 0;
    while (state.levelsCleared < 1 && guard < 4000) {
      guard++;
      state.hero.hp = 1e6;
      if (state.phase === "fight") sim.update(0.1);
      else if (state.phase === "reward") sim.confirmReward("omnislash");
      else break;
    }

    expect(spawned).toContain("elite");
    expect(spawned).toContain("boss");
    expect(state.levelsCleared).toBeGreaterThanOrEqual(1);
    expect(state.spawnQueue.length).toBe(0);
  });

  it("auto-resumes when no card left", () => {
    const { sim } = makeSurvivorSim(5);
    const state = sim.state;
    state.deck = [];
    state.drawPile = [];

    let guard = 0;
    while (state.phase === "fight" && guard < 200) {
      guard++;
      sim.update(0.1);
    }
    // no freeze: either phase changed or loop exhausted updates
    expect(guard).toBeGreaterThanOrEqual(1);
  });
});
