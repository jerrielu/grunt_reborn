import type { CardDef } from "../core/types";

export const CARDS: CardDef[] = [
  { id: "omnislash", name: "无敌斩", type: "equipment", equipmentSlot: "weapon", description: "攻击时有几率触发无敌斩：对单体快速连斩造成伤害" },
  { id: "charge", name: "冲锋", type: "tactic", durationRounds: 2, description: "提高移速与攻击范围" },
  { id: "guard", name: "守御", type: "tactic", durationRounds: 2, description: "降低受到的伤害" },
  { id: "assassinate", name: "刺杀", type: "tactic", durationRounds: 2, description: "优先攻击精英/BOSS" },
  { id: "frenzy", name: "狂暴", type: "tactic", durationRounds: 2, description: "攻速提升，承伤增加" },
  { id: "bait", name: "诱敌", type: "tactic", durationRounds: 2, description: "轻微提升移速" },
  { id: "slowHit", name: "重击", type: "tactic", durationRounds: 2, description: "攻速降低" },
  { id: "lurk", name: "潜袭", type: "tactic", durationRounds: 2, description: "背刺伤害提升" },
  { id: "steady", name: "稳健", type: "tactic", durationRounds: 3, description: "攻击回复生命" },
  { id: "bloodbath", name: "血浴", type: "tactic", durationRounds: 2, description: "低血时释放范围斩" },
  { id: "spear", name: "长矛", type: "equipment", equipmentSlot: "weapon", description: "增加攻击范围" },
  { id: "dagger", name: "匕首", type: "equipment", equipmentSlot: "weapon", description: "提升攻速" },
  { id: "heavyArmor", name: "重甲", type: "equipment", equipmentSlot: "armor", description: "增加生命与减伤，降低移速" },
  { id: "swiftBoots", name: "疾靴", type: "equipment", equipmentSlot: "boots", description: "提升移速" },
  { id: "shockwave", name: "冲击波", type: "instant", description: "对周围敌人造成伤害并击退" },
  { id: "firstAid", name: "急救", type: "instant", description: "恢复生命" },
  { id: "disrupt", name: "扰乱", type: "instant", description: "敌军移速减半" },
  { id: "roar", name: "怒吼", type: "instant", description: "本回合伤害提升" },
  { id: "summonSpearman", name: "矛手", type: "summon", description: "召唤矛手" },
  { id: "summonShieldman", name: "盾兵", type: "summon", description: "召唤盾兵" },
  { id: "summonRally", name: "集结", type: "summon", description: "召唤两名步卒" },
  { id: "shenzhenLight", name: "深圳之光", type: "instant", description: "S级：释放后，黄色电动车骑士从后方冲撞敌军" },
];

export function getCard(id: string): CardDef | undefined {
  return CARDS.find((c) => c.id === id);
}