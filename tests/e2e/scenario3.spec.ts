import { describe, it, expect } from "vitest";
import { runHeadless } from "./headlessRunner";
import { botPlay } from "./botPlayer";

describe("E2E scenario 3: summon cap", () => {
  it("rejects 5th summon when 4 alive", () => {
    const { sim, transcript } = runHeadless(1, "summoner", {
      maxLevels: 1, maxRounds: 5,
      botPlay: (s) => {
        // play summon every round
        const inst = s.state.deck.find((c) => c.defId.startsWith("summon"));
        if (inst) s.playCard(inst.defId);
        s.endDecide();
      },
    });
    const rejected = transcript.filter((l) => l.includes("card.rejected") && l.includes("summon.full"));
    console.log("rejected count:", rejected.length);
    // at least one rejection expected once cap hit
    expect(transcript.some((l) => l.includes("summon.full"))).toBe(true);
  });
});
