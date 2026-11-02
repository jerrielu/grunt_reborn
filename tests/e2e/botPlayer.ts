import type { BattleSim } from "../../src/core/battle/BattleSim";
import { getCard } from "../../src/config/cards";

export function botPlay(sim: BattleSim): void {
  const s = sim.state;
  const heroHpRatio = s.hero.hp / s.hero.maxHp;
  // 1. emergency heal
  if (heroHpRatio < 0.4 && s.deck.some((c) => c.defId === "firstAid")) {
    const inst = s.deck.find((c) => c.defId === "firstAid")!;
    sim.playCard(inst.defId);
    sim.endDecide();
    return;
  }
  // 2. if no active tactic, play a tactic
  const activeTactics = s.buffs.filter((b) => b.kind === "tactic" && b.roundsRemaining > 0);
  if (activeTactics.length === 0) {
    const tacticInst = s.deck.find((c) => getCard(c.defId)?.type === "tactic");
    if (tacticInst) {
      sim.playCard(tacticInst.defId);
      sim.endDecide();
      return;
    }
  }
  // 3. summon if under cap
  const aliveSummons = s.summons.filter((x) => x.alive).length;
  if (aliveSummons < 4) {
    const summonInst = s.deck.find((c) => getCard(c.defId)?.type === "summon");
    if (summonInst) {
      sim.playCard(summonInst.defId);
      sim.endDecide();
      return;
    }
  }
  // 4. skip
  sim.skipCard();
}
