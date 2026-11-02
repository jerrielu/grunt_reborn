import type { SaveAdapter } from "./SaveAdapter";

export interface GlobalBonus { id: string; name: string; tier: number; maxTier: number; cost: (tier: number) => number; }

export interface MetaState {
  version: number;
  points: number;
  runs: number;
  bestLevel: number;
  totalPointsEarned: number;
  unlockedGenerals: string[];
  unlockedCards: string[];
  globalBonuses: Record<string, number>; // id -> tier
  tutorialDone: boolean;
}

const DEFAULT_META: MetaState = {
  version: 1,
  points: 0,
  runs: 0,
  bestLevel: 0,
  totalPointsEarned: 0,
  unlockedGenerals: ["shoucheng"],
  unlockedCards: ["steady", "guard", "heavyArmor", "firstAid", "summonFootman", "spear"],
  globalBonuses: {},
  tutorialDone: false,
};

export class MetaStore {
  state: MetaState;
  private adapter: SaveAdapter;

  constructor(adapter: SaveAdapter) {
    this.adapter = adapter;
    const raw = adapter.load();
    if (raw) {
      try { this.state = { ...DEFAULT_META, ...JSON.parse(raw) }; }
      catch { this.state = { ...DEFAULT_META }; }
    } else {
      this.state = { ...DEFAULT_META };
    }
  }

  persist(): void { this.adapter.save(JSON.stringify(this.state)); }

  addPoints(p: number): void { this.state.points += p; this.state.totalPointsEarned += p; }
  spendPoints(p: number): boolean {
    if (this.state.points < p) return false;
    this.state.points -= p;
    return true;
  }
  recordRun(levelReached: number): void {
    this.state.runs += 1;
    if (levelReached > this.state.bestLevel) this.state.bestLevel = levelReached;
  }
  unlockGeneral(id: string): void {
    if (!this.state.unlockedGenerals.includes(id)) this.state.unlockedGenerals.push(id);
  }
  unlockCard(id: string): void {
    if (!this.state.unlockedCards.includes(id)) this.state.unlockedCards.push(id);
  }
  setBonusTier(id: string, tier: number): void { this.state.globalBonuses[id] = tier; }
  getBonusTier(id: string): number { return this.state.globalBonuses[id] ?? 0; }
  markTutorialDone(): void { this.state.tutorialDone = true; }

  applyUnlock(def: { id: string; type: string }): void {
    if (def.type === "general") this.unlockGeneral(def.id);
    else if (def.type === "card") this.unlockCard(def.id);
    else if (def.type === "bonus") {
      const cur = this.getBonusTier(def.id);
      this.setBonusTier(def.id, cur + 1);
    }
  }

  globalMultiplier(kind: "damage" | "hp" | "points"): number {
    const tier = this.getBonusTier("bonus_" + (kind === "damage" ? "damage" : kind === "hp" ? "hp" : "points"));
    if (kind === "damage") return 1 + tier * 0.05;
    if (kind === "hp") return 1 + tier * 0.05;
    return 1 + tier * 0.1;
  }
}
