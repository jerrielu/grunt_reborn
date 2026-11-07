import { describe, it, expect } from "vitest";
import { createRunState, BattleSim } from "../../src/core/battle/BattleSim";

describe("E2E scenario: draw pile is finite", () => {
  it("draws only the cards present in the draw pile then stops", () => {
    const state = createRunState(1, "shoucheng");
    state.drawPile = ["omnislash", "omnislash", "omnislash"];
    const sim = new BattleSim(state);
    const before = state.drawPile.length;
    expect(before).toBe(3);

    // draw all 3
    for (let i = 0; i < 3; i++) {
      const lenBefore = state.drawPile.length;
      sim.drawCard();
      expect(state.drawPile.length).toBe(lenBefore - 1);
      expect(state.deck.length).toBe(i + 1);
    }
    expect(state.drawPile.length).toBe(0);

    // 4th draw does nothing
    const deckBefore = state.deck.length;
    sim.drawCard();
    expect(state.drawPile.length).toBe(0);
    expect(state.deck.length).toBe(deckBefore);
  });
});