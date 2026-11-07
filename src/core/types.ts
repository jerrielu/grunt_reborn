// Core simulation types. No Phaser, no DOM, no Math.random/Date.now.

export type Vec2 = { x: number; y: number };

export type Side = "hero" | "enemy" | "summon";

export interface Unit {
  id: number;
  side: Side;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackRange: number;
  attackInterval: number; // seconds between attacks
  attackCooldown: number; // remaining seconds until next attack
  radius: number; // collision/separation radius
  alive: boolean;
  // AI state
  targetId: number | null;
  facing: number; // radians
  // status
  damageTakenMul: number;
  damageDealtMul: number;
  speedMul: number;
  attackIntervalMul: number;
  // knockback
  knockVx: number;
  knockVy: number;
}

export interface HeroUnit extends Unit {
  side: "hero";
  lowHpThreshold: number; // fraction
  retreating: boolean;
}

export interface SummonUnit extends Unit {
  side: "summon";
  // summons use same AI as enemies (nearest enemy)
}

export interface EnemyUnit extends Unit {
  side: "enemy";
  kind: "grunt" | "elite" | "boss";
  isElite: boolean;
  isBoss: boolean;
}

export interface EnemyHeroUnit extends Unit {
  side: "enemy";
  lowHpThreshold: number;
  retreating: boolean;
  isHero: true;
}

export interface FlyerUnit {
  id: number;
  kind: "person" | "car";
  x: number;
  y: number;
  vx: number;
  vy: number;
  damage: number;
  radius: number;
  alive: boolean;
  hitIds: number[];
  bounces: number;
}

export interface RiderUnit {
  id: number;
  x: number;
  y: number;
  baseX: number;
  speed: number;
  damage: number;
  radius: number;
  alive: boolean;
  hitIds: number[];
  crashed: boolean;
  explodeRadius: number;
  explodeDamage: number;
  spawnAt: number; // levelTime at which this rider appears
  vx: number; // horizontal velocity (inertia)
  vy: number; // vertical velocity (inertia)
}

export type BuffKind = "tactic" | "equipment" | "instant";

export interface Buff {
  id: string;
  kind: BuffKind;
  name: string;
  roundsRemaining: number; // decremented each round start; 0 = expired
  // numeric mods
  speedMul: number;
  attackIntervalMul: number;
  damageTakenMul: number;
  damageDealtMul: number;
  attackRangeAdd: number;
  // behavior override token (tactics)
  behavior: string | null; // e.g. "charge", "guard", "assassinate", ...
  // auto-skill
  autoSkill: string | null; // e.g. "aoeSlamOnLowHp"
  autoSkillUsedThisRound: boolean;
}

export interface CardDef {
  id: string;
  name: string;
  type: "tactic" | "equipment" | "instant" | "summon";
  equipmentSlot?: "weapon" | "armor" | "boots";
  durationRounds?: number;
  description: string;
}

export interface CardInstance {
  instanceId: number;
  defId: string;
}

export type Phase = "fight" | "reward" | "over";

export interface RunState {
  seed: number;
  generalId: string;
  level: number;
  round: number;
  phase: Phase;
  timer: number; // seconds remaining in fight phase
  fightSeconds: number; // 10 normally, 7 for boss
  hero: HeroUnit;
  enemyHero: EnemyHeroUnit;
  enemies: EnemyUnit[];
  summons: SummonUnit[];
  riders: RiderUnit[];
  flyers: FlyerUnit[];
  deck: CardInstance[]; // cards currently in hand
  drawPile: string[]; // card def ids available to draw from (deck builder selection)
  equipment: { weapon: string | null; armor: string | null; boots: string | null };
  buffs: Buff[]; // active tactic buffs
  // opponent hero state (mirrors player)
  enemyHand: CardInstance[];
  enemyDrawPile: string[];
  enemyEquipment: { weapon: string | null; armor: string | null; boots: string | null };
  enemyBuffs: Buff[];
  enemyNextDrawAt: number;
  roundBuffs: { slowEnemies: number; heroDamageBoost: number; heroDamageTakenBoost: number }; // instant round-scoped
  kills: number;
  elitesKilled: number;
  bossesKilled: number;
  levelsCleared: number;
  nextUnitId: number;
  spawnQueue: { kind: "grunt" | "elite" | "boss"; at: number }[]; // scheduled spawns (time in levelTime)
  roundTime: number; // elapsed seconds in current fight phase (resets each round)
  levelTime: number; // elapsed seconds since level start (cumulative across rounds)
  nextDrawAt: number; // levelTime threshold for next automatic card draw
  waveIndex: number;
  wavesTotal: number;
  eliteSpawned: boolean;
  bossSpawned: boolean;
  rewardChoices: string[]; // card def ids
  rngState: number; // serialized PRNG state
  tutorial: boolean;
  tutorialStep: number;
}

export interface GameEvent {
  type: string;
  data: Record<string, unknown>;
  t: number; // round time
}

export type EventHandler = (e: GameEvent) => void;
