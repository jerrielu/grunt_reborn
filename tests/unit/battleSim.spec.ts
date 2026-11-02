import { describe, it, expect } from "vitest";
import { createRunState, BattleSim } from "../../src/core/battle/BattleSim";

describe("BattleSim smoke", () => {
  it("runs a fight and reaches decide phase", () => {
    const state = createRunState(42, "shoucheng");
    const sim = new BattleSim(state);
    const events: string[] = [];
    sim.events.onAll((e) => events.push(e.type));
    // tick 12 seconds of game time
    let t = 0;
    while (t < 12 && state.phase === "fight") {
      sim.update(0.1);
      t += 0.1;
    }
    expect(state.phase).toBe("decide");
    expect(events).toContain("phase.changed");
    console.log("events:", events.slice(0, 20).join(", "));
  });

  it("deterministic with same seed", () => {
    const s1 = createRunState(7, "shoucheng");
    const sim1 = new BattleSim(s1);
    const ev1: string[] = [];
    sim1.events.onAll((e) => ev1.push(`${e.type}@${e.t.toFixed(2)}`));
    let t = 0;
    while (t < 8 && s1.phase === "fight") { sim1.update(0.1); t += 0.1; }

    const s2 = createRunState(7, "shoucheng");
    const sim2 = new BattleSim(s2);
    const ev2: string[] = [];
    sim2.events.onAll((e) => ev2.push(`${e.type}@${e.t.toFixed(2)}`));
    t = 0;
    while (t < 8 && s2.phase === "fight") { sim2.update(0.1); t += 0.1; }

    expect(ev1).toEqual(ev2);
  });
});
