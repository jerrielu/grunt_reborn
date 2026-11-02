import type { GameEvent } from "./types";

export class EventEmitter {
  private handlers: Map<string, Set<(e: GameEvent) => void>> = new Map();
  private global: Set<(e: GameEvent) => void> = new Set();
  on(type: string, h: (e: GameEvent) => void): void {
    if (!this.handlers.has(type)) this.handlers.set(type, new Set());
    this.handlers.get(type)!.add(h);
  }
  onAll(h: (e: GameEvent) => void): void { this.global.add(h); }
  off(type: string, h: (e: GameEvent) => void): void { this.handlers.get(type)?.delete(h); }
  emit(e: GameEvent): void {
    this.handlers.get(e.type)?.forEach((h) => h(e));
    this.global.forEach((h) => h(e));
  }
}
