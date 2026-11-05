import type { CardDef } from "../core/types";

export const CARDS: CardDef[] = [
  // Tactics
  { id: "charge", name: "冲锋", type: "tactic", durationRounds: 2, description: "提升移速与攻击距离" },
  { id: "guard", name: "防御", type: "tactic", durationRounds: 2, description: "减少所受伤害" },
  { id: "assassinate", name: "刺杀", type: "tactic", durationRounds: 2, description: "背刺造成额外伤害" },
  { id: "frenzy", name: "狂暴", type: "tactic", durationRounds: 2, description: "攻速提升但更易受伤" },
  { id: "bait", name: "诱饵", type: "tactic", durationRounds: 2, description: "吸引敌人注意" },
  { id: "slowHit", name: "重击", type: "tactic", durationRounds: 2, description: "重击减缓敌人" },
  { id: "lurk", name: "潜伏", type: "tactic", durationRounds: 2, description: "潜伏背刺" },
  { id: "steady", name: "稳守", type: "tactic", durationRounds: 3, description: "稳固防守" },
  { id: "bloodbath", name: "血浴", type: "tactic", durationRounds: 2, description: "低血时释放AOE" },
  // Equipment
  { id: "omnislash", name: "无敌斩", type: "equipment", equipmentSlot: "weapon", description: "攻击时触发无敌斩：对单体快速连斩造成伤害" },
  { id: "spear", name: "长矛", type: "equipment", equipmentSlot: "weapon", description: "攻击距离+12" },
  { id: "dagger", name: "匕首", type: "equipment", equipmentSlot: "weapon", description: "攻速提升" },
  { id: "heavyArmor", name: "重甲", type: "equipment", equipmentSlot: "armor", description: "生命+20%,减伤,移速-10%" },
  { id: "swiftBoots", name: "疾靴", type: "equipment", equipmentSlot: "boots", description: "移速+25%" },
  // Instant
  { id: "shockwave", name: "冲击波", type: "instant", description: "范围冲击波" },
  { id: "firstAid", name: "急救", type: "instant", description: "恢复生命" },
  { id: "disrupt", name: "扰乱", type: "instant", description: "减缓敌人" },
  { id: "roar", name: "咆哮", type: "instant", description: "提升伤害" },
  // Summon
  { id: "summonFootman", name: "召唤步兵", type: "summon", description: "召唤步兵" },
  { id: "summonSpearman", name: "召唤枪兵", type: "summon", description: "召唤枪兵" },
  { id: "summonShieldman", name: "召唤盾兵", type: "summon", description: "召唤盾兵" },
  { id: "summonRally", name: "集结", type: "summon", description: "召唤两步兵并承受更多伤害" },
];

export function getCard(id: string): CardDef | undefined {
  return CARDS.find((c) => c.id === id);
}