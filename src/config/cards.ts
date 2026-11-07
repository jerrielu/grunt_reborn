import type { CardDef } from "../core/types";

export const CARDS: CardDef[] = [
  { id: "omnislash", name: "无敌斩", type: "equipment", equipmentSlot: "weapon", description: "攻击时有几率触发无敌斩：对单体快速连斩造成伤害" },
  { id: "shenzhenLight", name: "深圳之光", type: "instant", description: "S级：释放后，黄色电动车骑士从后方冲撞敌军" },
];

export function getCard(id: string): CardDef | undefined {
  return CARDS.find((c) => c.id === id);
}