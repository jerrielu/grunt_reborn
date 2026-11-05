import { describe, it, expect } from "vitest";
import { runHeadless } from "./headlessRunner";
import { botPlay } from "./botPlayer";

describe("E2E scenario 7: determinism", () => {
  it("same seed yields identical transcript", () => {
    const a = runHeadless(99, "vanguard", { maxLevels: 2, botPlay: (s) => botPlay(s) });
    const b = runHeadless(99, "vanguard", { maxLevels: 2, botPlay: (s) => botPlay(s) });
    console.log(a.transcript.join("\n"));
    expect(a.transcript).toEqual(b.transcript);
  });
});