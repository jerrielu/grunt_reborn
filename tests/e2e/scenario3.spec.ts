import { describe, it, expect } from "vitest";
import { runHeadless } from "./headlessRunner";

describe("E2E scenario 3: omnislash card", () => {
  it("plays omnislash without rejection", () => {
    const { sim, transcript } = runHeadless(1, "shoucheng", { maxLevels: 0, maxRounds: 0 });
    const inst = sim.state.deck.find((c) => c.defId === "omnislash") ?? { defId: "omnislash" };
    const res = sim.playCard(inst.defId);
    expect(res.ok).toBe(true);
    expect(transcript.some((l) => l.includes("omnislash"))).toBe(true);
  });
});