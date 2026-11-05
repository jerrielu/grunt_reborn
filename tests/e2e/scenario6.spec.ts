import { describe, it, expect } from "vitest";
import { runHeadless } from "./headlessRunner";

describe("E2E scenario 6: summon cap rejection", () => {
  it("rejects summon when cap reached", () => {
    const { sim, transcript } = runHeadless(3, "shoucheng", { maxLevels: 0, maxRounds: 0 });
    for (let i = 0; i < 5; i++) sim.playCard("summonShieldman");
    const res = sim.playCard("summonShieldman");
    console.log(transcript.join("\n"));
    expect(res.ok === false || transcript.some((l) => l.includes("summon.full"))).toBe(true);
  });
});