import { describe, it, expect } from "vitest";
import { runHeadless } from "./headlessRunner";

describe("E2E scenario 4: tactic overwrite", () => {
  it("last tactic wins behavior", () => {
    const { sim, transcript } = runHeadless(2, "shoucheng", { maxLevels: 1, maxRounds: 1 });
    sim.playCard("omnislash");
    expect(transcript.some((l) => l.includes("omnislash"))).toBe(true);
  });
});
