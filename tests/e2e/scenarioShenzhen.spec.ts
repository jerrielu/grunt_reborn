import { describe, it, expect } from "vitest";
import { createRunState, BattleSim } from "../../src/core/battle/BattleSim";

describe("E2E shenzhen light rider", () => {
  it("spawns riders and crashes into enemies", () => {
    const state = createRunState(42, "shoucheng");
    const sim = new BattleSim(state);
    const types: string[] = [];
    sim.events.onAll((e) => types.push(e.type));
    // play card during first fight
    sim.playCard("shenzhenLight");
    let t = 0;
    while (t < 6 && !types.includes("rider.crash")) {
      sim.update(0.1);
      t += 0.1;
    }
    expect(types).toContain("instant.shenzhenLight");
    expect(types).toContain("rider.crash");
  });
});