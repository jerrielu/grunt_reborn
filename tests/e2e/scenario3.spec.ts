import { describe, it, expect } from "vitest";
import { runHeadless } from "./headlessRunner";
import { botPlay } from "./botPlayer";

describe("E2E scenario 3: summon cap", () => {
  it("rejects 5th summon when 4 alive", () => {
    const { sim, transcript } = runHeadless(1, "summoner", { maxLevels: 0, maxRounds: 0 });
    for (let i = 0; i < 5; i++) {
      const inst = sim.state.deck.find((c) => c.defId.startsWith("summon")) ?? { defId: "summonFootman" };
      sim.playCard(inst.defId);
    }
    console.log("rejected count:", transcript.filter((l) => l.includes("summon.full")).length);
    expect(transcript.some((l) => l.includes("summon.full"))).toBe(true);
  });
});
