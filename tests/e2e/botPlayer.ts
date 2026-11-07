import type { BattleSim } from "../../src/core/battle/BattleSim";
import { getCard } from "../../src/config/cards";

export function botPlay(sim: BattleSim): void {
  const s = sim.state;
  // simulate a draw before deciding, like the real player
  sim.drawCard();
  // 2. if no active tactic, play a tactic
  const activeTactics = s.buffs.filter((b) => b.kind === "tactic" && b.roundsRemaining > 0);
  if (activeTactics.length === 0) {
    const tacticInst = s.deck.find((c) => getCard(c.defId)?.type === "tactic");
    if (tacticInst) {
      sim.playCard(tacticInst.defId);
      return;
    }
  }
  // 3. summon if under cap
  const aliveSummons = s.summons.filter((x) => x.alive).length;
  if (aliveSummons < 4) {
    const summonInst = s.deck.find((c) => getCard(c.defId)?.type === "summon");
    if (summonInst) {
      sim.playCard(summonInst.defId);
      return;
    }
  }
  // 4. equip omnislash if not equipped
  if (s.equipment.weapon !== "omnislash") {
    const equipInst = s.deck.find((c) => getCard(c.defId)?.type === "equipment");
    if (equipInst) {
      sim.playCard(equipInst.defId);
      return;
    }
  }
  // 5. skip
  // no-op
}
