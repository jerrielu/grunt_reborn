export interface UnlockDef {
  id: string;
  type: "general" | "card" | "bonus";
  name: string;
  cost: number;
  description: string;
}

export const UNLOCKS: UnlockDef[] = [
  { id: "vanguard", type: "general", name: "先锋骑将", cost: 200, description: "冲阵型：移速+15%、攻击+8%" },
  { id: "summoner", type: "general", name: "招魂将", cost: 200, description: "召唤型：召唤上限+1" },
  { id: "bonus_damage", type: "bonus", name: "伤害加成", cost: 100, description: "全武将伤害+5% (可升3档)" },
  { id: "bonus_hp", type: "bonus", name: "生命加成", cost: 100, description: "全武将生命+5% (可升3档)" },
  { id: "bonus_points", type: "bonus", name: "积分加成", cost: 100, description: "轮回积分+10% (可升3档)" },
];

export function canPurchase(meta: { unlockedGenerals: string[]; unlockedCards: string[]; globalBonuses: Record<string, number>; points: number }, def: UnlockDef): boolean {
  if (def.type !== "card" && meta.points < def.cost) return false;
  if (def.type === "general" && meta.unlockedGenerals.includes(def.id)) return false;
  if (def.type === "card" && meta.unlockedCards.includes(def.id)) return false;
  return true;
}
