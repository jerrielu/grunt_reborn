// Minimal tutorial step machine (core-level, testable). Steps advance based on sim events.
export interface TutorialStep {
  id: string;
  message: string;
  // forced allowed card ids during decide (empty = all allowed)
  allowedCards: string[];
  // if true, this step expects a death to complete
  expectDeath?: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: "intro", message: "小兵会自己移动、自动打怪，你不用控制它。", allowedCards: [] },
  { id: "firstCard", message: "第一次出牌窗口：打出一张战法卡，演示主角 AI 行为变化。", allowedCards: ["omnislash"] },
  { id: "defeat", message: "打输本局清零，但带着轮回积分重生，换别的武将再战。", allowedCards: [], expectDeath: true },
];

export class TutorialScript {
  stepIndex = 0;
  get current(): TutorialStep | null { return TUTORIAL_STEPS[this.stepIndex] ?? null; }
  allowedCards(): string[] { return this.current?.allowedCards ?? []; }
  isLocked(cardId: string): boolean {
    const allowed = this.allowedCards();
    if (allowed.length === 0) return false;
    return !allowed.includes(cardId);
  }
  advance(): void { if (this.stepIndex < TUTORIAL_STEPS.length - 1) this.stepIndex++; }
  isDone(): boolean { return this.stepIndex >= TUTORIAL_STEPS.length; }
}
