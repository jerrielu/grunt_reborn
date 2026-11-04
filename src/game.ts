import Phaser from "phaser";
import { MetaStore } from "./core/meta/MetaStore";
import { LocalStorageAdapter } from "./save/localStorageAdapter";
import { createRunState, BattleSim } from "./core/battle/BattleSim";
import { computePoints } from "./core/meta/settlement";
import { UNLOCKS, canPurchase } from "./config/unlocks";
import { CARDS } from "./config/cards";

export class GameController {
  meta: MetaStore;
  sim: BattleSim | null = null;
  scene: Phaser.Scene | null = null;
  onStateChange: (() => void) | null = null;

  constructor() {
    this.meta = new MetaStore(new LocalStorageAdapter("grunt_reborn_save_v1"));
  }

  startRun(generalId: string): BattleSim {
    const seed = Math.floor(Math.random() * 1e9);
    const state = createRunState(seed, generalId);
    // apply global bonuses to hero
    const hpMul = this.meta.globalMultiplier("hp");
    const dmgMul = this.meta.globalMultiplier("damage");
    state.hero.maxHp = Math.round(state.hero.maxHp * hpMul);
    state.hero.hp = state.hero.maxHp;
    state.hero.attackDamage = Math.round(state.hero.attackDamage * dmgMul);
    // build deck from saved deck (or starter) filtered to unlocked
    const starterMap: Record<string, string[]> = {
      shoucheng: ["steady", "guard", "heavyArmor", "firstAid", "summonFootman", "spear"],
      vanguard: ["charge", "frenzy", "assassinate", "dagger", "swiftBoots", "shockwave"],
      summoner: ["summonFootman", "summonShieldman", "summonSpearman", "summonRally", "guard", "disrupt"],
    };
    const base = (this.meta.state.deck && this.meta.state.deck.length > 0) ? this.meta.state.deck : (starterMap[generalId] ?? starterMap.shoucheng);
    const ids = base.filter((id) => this.meta.state.unlockedCards.includes(id));
    state.deck = ids.map((defId, i) => ({ instanceId: 100 + i, defId }));
    const sim = new BattleSim(state);
    this.sim = sim;
    return sim;
  }

  endRun(): { points: number; level: number } {
    const sim = this.sim;
    if (!sim) return { points: 0, level: 0 };
    const mult = this.meta.globalMultiplier("points");
    const pts = computePoints(sim.state, mult);
    this.meta.addPoints(pts);
    this.meta.recordRun(sim.state.levelsCleared);
    if (!this.meta.state.tutorialDone && sim.state.tutorial) this.meta.markTutorialDone();
    this.meta.persist();
    const level = sim.state.levelsCleared;
    this.sim = null;
    return { points: pts, level };
  }

  buyUnlock(id: string): boolean {
    const def = UNLOCKS.find((u) => u.id === id);
    if (!def) return false;
    if (!canPurchase(this.meta.state, def)) return false;
    if (!this.meta.spendPoints(def.cost)) return false;
    this.meta.applyUnlock(def);
    this.meta.persist();
    return true;
  }

  availableCards(): string[] { return this.meta.state.unlockedCards; }
  availableGenerals(): string[] { return this.meta.state.unlockedGenerals; }
}
