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
  { id: "frenzy", type: "card", name: "狂攻", cost: 60, description: "解锁卡牌" },
  { id: "assassinate", type: "card", name: "袭杀", cost: 60, description: "解锁卡牌" },
  { id: "bait", type: "card", name: "诱敌", cost: 60, description: "解锁卡牌" },
  { id: "slowHit", type: "card", name: "缓击", cost: 60, description: "解锁卡牌" },
  { id: "lurk", type: "card", name: "寻隙", cost: 60, description: "解锁卡牌" },
  { id: "bloodbath", type: "card", name: "浴血", cost: 80, description: "解锁卡牌" },
  { id: "shockwave", type: "card", name: "震敌", cost: 50, description: "解锁卡牌" },
  { id: "disrupt", type: "card", name: "扰阵", cost: 50, description: "解锁卡牌" },
  { id: "roar", type: "card", name: "怒吼", cost: 50, description: "解锁卡牌" },
  { id: "summonSpearman", type: "card", name: "召矛手", cost: 50, description: "解锁卡牌" },
  { id: "summonShieldman", type: "card", name: "召盾兵", cost: 50, description: "解锁卡牌" },
  { id: "summonRally", type: "card", name: "集结号", cost: 70, description: "解锁卡牌" },
  { id: "dagger", type: "card", name: "短刃", cost: 40, description: "解锁卡牌" },
  { id: "swiftBoots", type: "card", name: "快靴", cost: 40, description: "解锁卡牌" },
  { id: "bonus_damage", type: "bonus", name: "伤害加成", cost: 100, description: "全武将伤害+5% (可升3档)" },
  { id: "bonus_hp", type: "bonus", name: "生命加成", cost: 100, description: "全武将生命+5% (可升3档)" },
  { id: "bonus_points", type: "bonus", name: "积分加成", cost: 100, description: "轮回积分+10% (可升3档)" },
];

export function canPurchase(meta: { unlockedGenerals: string[]; unlockedCards: string[]; globalBonuses: Record<string, number>; points: number }, def: UnlockDef): boolean {
  if (meta.points < def.cost) return false;
  if (def.type === "general" && meta.unlockedGenerals.includes(def.id)) return false;
  if (def.type === "card" && meta.unlockedCards.includes(def.id)) return false;
  return true;
}
