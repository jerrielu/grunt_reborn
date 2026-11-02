// Browser save adapter
import type { SaveAdapter } from "../core/meta/SaveAdapter";

export class LocalStorageAdapter implements SaveAdapter {
  constructor(private key: string) {}
  load(): string | null {
    try { return localStorage.getItem(this.key); } catch { return null; }
  }
  save(data: string): void {
    try { localStorage.setItem(this.key, data); } catch { /* ignore */ }
  }
}
