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
  it("riders played during the decide window still charge once the next round starts", () => {
    const { sim } = makeSurvivorSim(42);
    const state = sim.state;
    const log: string[] = [];
    sim.events.onAll((e) => log.push(`[${e.type}] t=${e.t.toFixed(2)} ${JSON.stringify(e.data)}`));

    let t = 0;
    while (state.phase === "fight" && t < 20) {
      sim.update(0.1);
      t += 0.1;
    }
    expect(state.phase).toBe("decide");

    const levelTimeAtPlay = state.levelTime;
    sim.playCard("shenzhenLight");
    expect(state.riders.length).toBe(6);
    expect(state.riders.every((r) => r.spawnAt >= levelTimeAtPlay)).toBe(true);
    expect(state.riders.some((r) => r.spawnAt > state.roundTime)).toBe(true);
    sim.endDecide();

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
      else if (state.phase === "decide") sim.skipCard();
      else if (state.phase === "reward") sim.confirmReward("omnislash");
      else break;
    }

    expect(spawned).toContain("elite");
    expect(spawned).toContain("boss");
    expect(state.levelsCleared).toBeGreaterThanOrEqual(1);
    expect(state.spawnQueue.length).toBe(0);
  });

  it("auto-resumes the decide window when there is no card left to play", () => {
    const { sim } = makeSurvivorSim(5);
    const state = sim.state;
    state.deck = [];
    state.drawPile = [];

    let guard = 0;
    while (state.round === 1 && guard < 500) {
      guard++;
      sim.update(0.1);
    }

    expect(state.round).toBeGreaterThanOrEqual(2);
    expect(state.phase).toBe("fight");
  });
});
