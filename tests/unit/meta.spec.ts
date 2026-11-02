import { describe, it, expect } from "vitest";
import { MetaStore } from "../../src/core/meta/MetaStore";
import { NodeAdapter } from "../../src/save/nodeAdapter";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

describe("MetaStore isolation & persistence", () => {
  it("round-trips via NodeAdapter", () => {
    const dir = mkdtempSync(join(tmpdir(), "grunt-"));
    const path = join(dir, "save.json");
    const adapter = new NodeAdapter(path);
    const m1 = new MetaStore(adapter);
    m1.addPoints(150);
    m1.unlockCard("frenzy");
    m1.persist();
    const m2 = new MetaStore(adapter);
    expect(m2.state.points).toBe(150);
    expect(m2.state.unlockedCards).toContain("frenzy");
    rmSync(dir, { recursive: true });
  });
});
