export interface SaveAdapter {
  load(): string | null;
  save(data: string): void;
}
