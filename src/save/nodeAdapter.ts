import type { SaveAdapter } from "../core/meta/SaveAdapter";
import { writeFileSync, readFileSync, existsSync } from "node:fs";

export class NodeAdapter implements SaveAdapter {
  constructor(private path: string) {}
  load(): string | null {
    try { if (!existsSync(this.path)) return null; return readFileSync(this.path, "utf8"); }
    catch { return null; }
  }
  save(data: string): void {
    try { writeFileSync(this.path, data, "utf8"); } catch { /* ignore */ }
  }
}
