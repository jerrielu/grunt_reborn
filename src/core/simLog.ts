import type { GameEvent } from "./types";
import { getCard } from "../config/cards";

function kindName(kind: unknown): string {
  switch (kind) {
    case "elite": return "敌将";
    case "boss": return "BOSS";
    default: return "敌卒";
  }
}

function cardName(id: unknown): string {
  if (typeof id !== "string") return String(id ?? "");
  const c = getCard(id);
  return c ? c.name : id;
}

export function formatSimEvent(e: GameEvent): string | null {
  const d = e.data ?? {};
  switch (e.type) {
    case "level.start":
      return `第 ${d.level} 关：战鼓擂响，${d.waves} 波敌军汹涌来袭！`;
    case "level.cleared":
      return `第 ${d.level} 关突破！主角恢复 ${d.heal} 点生命，整军再战！`;
    case "hero.died":
      return "主角力竭倒下，此局落幕……虽败犹荣！";
    case "unit.spawned": {
      const kind = d.kind;
      if (kind === "boss") return "BOSS现身，天地变色！全员戒备！";
      if (kind === "elite") return "敌将登场，威压全场！";
      return "敌卒从阵前压上，杀气腾腾！";
    }
    case "enemy.killed":
      return `一名${kindName(d.kind)}轰然倒地！`;
    case "hero.attack": {
      const dmg = d.dmg;
      if (d.omni) return `主角使出无敌斩，寒光连闪，连斩不止！（每击 ${dmg} 点伤害）`;
      if (d.killed) return `主角一剑封喉，斩杀一名${kindName(undefined)}！（${dmg} 点伤害）`;
      return `主角攻击造成 ${dmg} 点伤害`;
    }
    case "enemy.attack": {
      const dmg = d.dmg;
      if (d.killed) return `敌人反击，造成 ${dmg} 点伤害，目标阵亡！`;
      return `敌人攻击造成 ${dmg} 点伤害`;
    }
    case "summon.attack": {
      const dmg = d.dmg;
      if (d.killed) return `召唤物建功，击毙一名敌人！（${dmg} 点伤害）`;
      return `召唤物攻击造成 ${dmg} 点伤害`;
    }
    case "unit.died":
      if (d.side === "summon") return "一名召唤物不幸阵亡……";
      if (d.side === "hero") return "主角倒下，战局急转直下！";
      return null;
    case "card.played": {
      const base = `打出卡牌「${cardName(d.cardId)}」，战局再起波澜！`;
      if (d.type === "summon" && d.count) return `${base}（召唤 ${d.count} 个单位）`;
      return base;
    }
    case "card.rejected":
      return `出牌被拒：${String(d.reason ?? "")}`;
    case "card.drawn":
      return `抽到卡牌「${cardName(d.defId)}」，如虎添翼！`;
    case "round.start":
      return `第 ${d.round} 回合：整军再战！`;
    case "buff.applied":
      return `战法「${String(d.name ?? "")}」生效，持续 ${d.rounds} 回合！`;
    case "instant.shockwave":
      return `主角发出冲击波，造成 ${d.dmg} 点范围伤害！`;
    case "instant.firstAid":
      return `主角使用急救，恢复 ${d.heal} 点生命！`;
    case "instant.disrupt":
      return "主角施放扰乱，敌军移速减半！";
    case "instant.roar":
      return "主角怒吼，本回合伤害提升 50%！";
    case "instant.shenzhenLight":
      return "深圳之光！黄色电动车骑士从后方冲撞敌军！";
    case "rider.hit": {
      const dmg = d.dmg;
      if (d.killed) return `电动车骑士冲撞，击毙一名敌人！（${dmg} 点伤害）`;
      return `电动车骑士冲撞造成 ${dmg} 点伤害`;
    }
    case "summon.spawn":
      return `召唤出${String(d.name ?? "")}，场上现有 ${d.count} 个召唤物！`;
    default:
      return null;
  }
}

export function formatSimEvents(events: GameEvent[]): string[] {
  const out: string[] = [];
  for (const e of events) {
    const line = formatSimEvent(e);
    if (line) out.push(line);
  }
  return out;
}

export function formatSimLog(events: GameEvent[]): string[] {
  return formatSimEvents(events);
}

export function describeSimEvent(e: GameEvent): string | null {
  return formatSimEvent(e);
}

export function describeEvent(e: GameEvent): string | null {
  return formatSimEvent(e);
}

export default { formatSimEvent, formatSimEvents, formatSimLog, describeSimEvent, describeEvent };
