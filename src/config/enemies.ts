import type { CardDef } from "../core/types";

export interface EnemyConfig {
  id: string;
  name: string;
  generalId: string;
  // card def ids available to build deck from (random)
  cardPool: string[];
  deckSize: number;
  stats?: { hp?: number; attackDamage?: number; attackRange?: number; attackInterval?: number };
}

export const ENEMIES: EnemyConfig[] = [
  {
    id: "default",
    name: "敌方主角",
    generalId: "shoucheng",
    cardPool: ["omnislash", "shenzhenLight"],
    deckSize: 3,
  },
];

export function getEnemy(id: string): EnemyConfig | undefined {
  return ENEMIES.find((e) => e.id === id);
}

export function buildEnemyDeck(cfg: EnemyConfig, rngInt: (a: number, b: number) => number): string[] {
  const pool = [...cfg.cardPool];
  const size = Math.min(cfg.deckSize, pool.length);
  const picks: string[] = [];
  const avail = [...pool];
  while (picks.length < size && avail.length) {
    const i = rngInt(0, avail.length - 1);
    picks.push(avail.splice(i, 1)[0]);
  }
  return picks;
}