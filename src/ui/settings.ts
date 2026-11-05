import { GameController } from "../game";
import { createRunState, BattleSim } from "../core/battle/BattleSim";
import { getCard } from "../config/cards";
import { mountScreen } from "./screen";
import type { GameEvent } from "../core/types";
import { formatSimEvents } from "../core/simLog";

function botPlay(sim: BattleSim): void {
  const s = sim.state;
  // simulate a draw before deciding, like the real player
  sim.drawCard();
  const heroHpRatio = s.hero.hp / s.hero.maxHp;
  if (heroHpRatio < 0.4 && s.deck.some((c) => c.defId === "firstAid")) {
    const inst = s.deck.find((c) => c.defId === "firstAid")!;
    sim.playCard(inst.defId);
    sim.endDecide();
    return;
  }
  const activeTactics = s.buffs.filter((b) => b.kind === "tactic" && b.roundsRemaining > 0);
  if (activeTactics.length === 0) {
    const tacticInst = s.deck.find((c) => getCard(c.defId)?.type === "tactic");
    if (tacticInst) {
      sim.playCard(tacticInst.defId);
      sim.endDecide();
      return;
    }
  }
  const aliveSummons = s.summons.filter((x) => x.alive).length;
  if (aliveSummons < 4) {
    const summonInst = s.deck.find((c) => getCard(c.defId)?.type === "summon");
    if (summonInst) {
      sim.playCard(summonInst.defId);
      sim.endDecide();
      return;
    }
  }
  if (s.equipment.weapon !== "omnislash") {
    const equipInst = s.deck.find((c) => getCard(c.defId)?.type === "equipment");
    if (equipInst) {
      sim.playCard(equipInst.defId);
      sim.endDecide();
      return;
    }
  }
  sim.skipCard();
}

export function openSettings(controller: GameController): void {
  document.querySelectorAll(".settings").forEach((e) => e.remove());

  const overlay = mountScreen(
    "settings",
    "z-index:20;display:flex;flex-direction:column;background:#1a1408;font-family:monospace;color:#e8d9a8;overflow:hidden;",
  );

  const top = document.createElement("div");
  top.style.cssText = "position:relative;z-index:2;display:flex;align-items:center;justify-content:space-between;padding-top:calc(6px + env(safe-area-inset-top));padding-right:8px;padding-bottom:6px;padding-left:8px;min-height:44px;background:#2a1a0a;border-bottom:2px solid #0a0604;box-sizing:border-box;flex:0 0 auto;";
  const mkPlaque = (label: string, onClick: () => void) => {
    const b = document.createElement("button");
    b.textContent = label;
    b.style.cssText = "background:#3a2410;color:#e8d9a8;border:2px solid #0a0604;padding:4px 8px;font-family:monospace;font-size:11px;cursor:pointer;image-rendering:pixelated;";
    b.onclick = onClick;
    return b;
  };
  const backBtn = mkPlaque("← 返回", () => close());
  backBtn.style.background = "#8b6914";
  backBtn.style.color = "#fff3d0";
  backBtn.style.fontWeight = "bold";
  backBtn.style.fontSize = "12px";
  backBtn.style.padding = "6px 10px";
  const title = document.createElement("div");
  title.style.cssText = "flex:1;text-align:center;font-size:12px;font-weight:bold;";
  title.textContent = "设置";
  top.appendChild(backBtn);
  top.appendChild(title);
  overlay.appendChild(top);

  const body = document.createElement("div");
  body.style.cssText = "position:relative;z-index:2;flex:1;display:flex;flex-direction:column;gap:8px;padding:8px;min-height:0;";

  const runBtn = mkPlaque("模拟游戏", () => runSim());
  runBtn.style.background = "#c9a86a";
  runBtn.style.color = "#1a1408";
  runBtn.style.fontWeight = "bold";
  runBtn.style.fontSize = "12px";
  runBtn.style.padding = "6px 12px";
  body.appendChild(runBtn);

  const log = document.createElement("div");
  log.style.cssText = "flex:1;min-height:0;overflow:auto;background:#0a0604;color:#c9a86a;font-size:9px;line-height:1.3;white-space:pre-wrap;word-break:break-all;padding:6px;border:1px solid #3a2410;";
  log.textContent = "点击「模拟游戏」开始模拟...";
  body.appendChild(log);

  overlay.appendChild(body);

  function close() {
    overlay.remove();
  }

  function appendLine(line: string) {
    log.textContent += (log.textContent.endsWith("\n") || log.textContent === "" ? "" : "\n") + line;
    log.scrollTop = log.scrollHeight;
  }

  function runSim() {
    log.textContent = "模拟中...\n";
    const seed = Math.floor(Math.random() * 1e9);
    const state = createRunState(seed, "shoucheng");
    const sim = new BattleSim(state);
    const events: GameEvent[] = [];
    sim.events.onAll((e) => events.push(e));

    let rounds = 0;
    let levelsDone = 0;
    const maxLevels = 2;
    const maxRounds = 200;
    while (state.phase !== "over" && levelsDone < maxLevels && rounds < maxRounds) {
      if (state.phase === "fight") {
        sim.update(0.1);
        continue;
      }
      if (state.phase === "decide") {
        botPlay(sim);
        rounds++;
        continue;
      }
      if (state.phase === "reward") {
        const choices = state.rewardChoices.length ? state.rewardChoices : ["omnislash"];
        sim.confirmReward(choices[0] ?? "omnislash");
        levelsDone++;
        continue;
      }
      break;
    }
    formatSimEvents(events).forEach((l) => appendLine(l));
    appendLine(`\n模拟结束：关卡=${state.levelsCleared ?? 0} 回合=${rounds}`);
  }
}