import type { CardDef } from "../core/types";

export const CARDS: CardDef[] = [
  // Tactics (9)
  { id: "charge", name: "猛冲", type: "tactic", durationRounds: 2, description: "无视后撤，冲向敌群，移速+30%、射程+" },
  { id: "guard", name: "固守", type: "tactic", durationRounds: 2, description: "不移动，只打近身敌人，受伤-25%" },
  { id: "assassinate", name: "袭杀", type: "tactic", durationRounds: 2, description: "忽略普通小兵，锁定敌将/BOSS" },
  { id: "frenzy", name: "狂攻", type: "tactic", durationRounds: 2, description: "攻速+40%、受伤+20%" },
  { id: "bait", name: "诱敌", type: "tactic", durationRounds: 2, description: "扩大仇恨，敌人优先追主角" },
  { id: "slowHit", name: "缓击", type: "tactic", durationRounds: 2, description: "攻击变慢，每击击退" },
  { id: "lurk", name: "寻隙", type: "tactic", durationRounds: 2, description: "绕背攻击，背击+35%" },
  { id: "steady", name: "稳扎", type: "tactic", durationRounds: 3, description: "就近逻辑不变，后撤距离加大，普攻回血" },
  { id: "bloodbath", name: "浴血", type: "tactic", durationRounds: 2, description: "附加技能：血量<20% 自动范围重击" },
  // Equipment (4)
  { id: "spear", name: "长枪", type: "equipment", equipmentSlot: "weapon", description: "普攻射程变长，范围小幅+" },
  { id: "heavyArmor", name: "重铠", type: "equipment", equipmentSlot: "armor", description: "最大生命+20%，受伤-12%，移速-10%" },
  { id: "swiftBoots", name: "快靴", type: "equipment", equipmentSlot: "boots", description: "移速+25%" },
  { id: "dagger", name: "短刃", type: "equipment", equipmentSlot: "weapon", description: "攻速+20%" },
  // Instant (4)
  { id: "shockwave", name: "震敌", type: "instant", description: "周围敌人击退+范围伤害" },
  { id: "firstAid", name: "急救", type: "instant", description: "恢复25%最大生命" },
  { id: "disrupt", name: "扰阵", type: "instant", description: "全场敌人减速1回合" },
  { id: "roar", name: "怒吼", type: "instant", description: "下回合伤害+50%" },
  // Summon (4)
  { id: "summonFootman", name: "召步卒", type: "summon", description: "召唤1名步卒" },
  { id: "summonSpearman", name: "召矛手", type: "summon", description: "召唤1名矛手（射程远、伤害高、血量低）" },
  { id: "summonShieldman", name: "召盾兵", type: "summon", description: "召唤1名盾兵（高血、低伤、仇恨）" },
  { id: "summonRally", name: "集结号", type: "summon", description: "召唤2名步卒，主角本回合受伤+15%" },
];

export function getCard(id: string): CardDef | undefined {
  return CARDS.find((c) => c.id === id);
}
