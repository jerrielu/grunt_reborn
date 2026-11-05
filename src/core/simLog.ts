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
      if (d.omni) return "主角使出无敌斩，寒光连闪，连斩不止！";
      if (d.killed) return `主角一剑封喉，斩杀一名${kindName(undefined)}！`;
      return null;
    }
    case "summon.attack":
      return d.killed ? "召唤物建功，击毙一名敌人！" : null;
    case "unit.died":
      if (d.side === "summon") return "一名召唤物不幸阵亡……";
      if (d.side === "hero") return "主角倒下，战局急转直下！";
      return null;
    case "card.played":
      return `打出卡牌「${cardName(d.cardId)}」，战局再起波澜！`;
    case "card.rejected":
      return `出牌被拒：${String(d.reason ?? "")}`;
    case "card.drawn":
      return `抽到卡牌「${cardName(d.defId)}」，如虎添翼！`;
    case "round.start":
      return `第 ${d.round} 回合：整军再战！`;
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
