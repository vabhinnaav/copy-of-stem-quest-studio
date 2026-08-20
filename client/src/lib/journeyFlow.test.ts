import { describe, expect, it } from "vitest";
import { canEnterWorkspace, normalizeJourneyName } from "./journeyContract";
import { loadOrCreateLocalLearner, recordLocalAttempt, saveLocalLearner, signOutLocalLearner } from "./localProgress";

describe("landing to workspace learner flow", () => {
  it("enters the workspace for a valid name and restores that learner after a switch", () => {
    const values = new Map<string, string>();
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, "window", { configurable: true, value: {
      localStorage: { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key) },
      dispatchEvent: () => true,
    } });
    try {
      const name = normalizeJourneyName("  Ada  ");
      expect(canEnterWorkspace(name)).toBe(true);
      const entered = loadOrCreateLocalLearner(name);
      const progressed = recordLocalAttempt(entered, { subject: "technology", topic: "Programming Logic", difficulty: "foundation", isCorrect: true }).learner;
      saveLocalLearner(progressed);
      signOutLocalLearner();

      loadOrCreateLocalLearner("Grace");
      signOutLocalLearner();
      const restored = loadOrCreateLocalLearner("ada");

      expect(restored).toMatchObject({ name: "Ada", totalXp: progressed.totalXp, streak: 1 });
      expect(restored.progress.find(item => item.subject === "technology")).toMatchObject({ questionsAttempted: 1, questionsCorrect: 1 });
    } finally {
      Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }
  });
});
