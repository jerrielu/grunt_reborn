import { describe, it, expect } from "vitest";
import { runHeadless } from "./headlessRunner";
import { botPlay } from "./botPlayer";

describe("E2E scenario 1: auto-battle full run", () => {
  it("runs to death or 3 levels and logs transcript", () => {
    const { sim, transcript } = runHeadless(42, "shoucheng", { maxLevels: 2, botPlay: (s) => botPlay(s) });
    console.log(transcript.join("\n"));
    expect(transcript.length).toBeGreaterThan(0);
    expect(transcript.some((l) => l.includes("unit.spawned") || l.includes("hero.attack"))).toBe(true);
  });
});
