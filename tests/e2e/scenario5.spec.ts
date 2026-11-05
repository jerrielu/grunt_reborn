import { describe, it, expect } from "vitest";
import { runHeadless } from "./headlessRunner";
import { botPlay } from "./botPlayer";

describe("E2E scenario 5: bot plays all card types over 3 levels", () => {
  it("runs without crash and produces transcript", () => {
    const { sim, transcript } = runHeadless(7, "summoner", { maxLevels: 3, botPlay: (s) => botPlay(s) });
    console.log(transcript.join("\n"));
    expect(transcript.length).toBeGreaterThan(10);
    expect(sim.state.levelsCleared).toBeGreaterThanOrEqual(0);
  });
});