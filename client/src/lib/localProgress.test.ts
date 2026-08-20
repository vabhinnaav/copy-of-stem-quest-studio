import { describe, expect, it } from "vitest";
import { clearLocalLearner, createLocalLearner, loadLocalLearner, loadOrCreateLocalLearner, recordLocalAttempt, saveLocalLearner, signOutLocalLearner } from "./localProgress";

describe("device-local STEM progress", () => {
  it("records rewards and subject progress without a user account or database", () => {
    const learner = createLocalLearner("Ada");
    const result = recordLocalAttempt(learner, {
      subject: "mathematics",
      topic: "Quadratic Equations",
      difficulty: "challenge",
      isCorrect: true,
    });
    const mathematics = result.learner.progress.find(item => item.subject === "mathematics");

    expect(result.reward.earnedXp).toBeGreaterThan(30);
    expect(result.learner.totalXp).toBe(result.reward.earnedXp);
    expect(result.learner.streak).toBe(1);
    expect(mathematics).toMatchObject({ questionsAttempted: 1, questionsCorrect: 1 });
    expect(result.learner.activity).toHaveLength(1);
  });

  it("restores a named learner’s progress after switching to another on-device profile", () => {
    const entries = new Map<string, string>();
    const fakeWindow = {
      localStorage: {
        getItem: (key: string) => entries.get(key) ?? null,
        setItem: (key: string, value: string) => entries.set(key, value),
        removeItem: (key: string) => entries.delete(key),
      },
      dispatchEvent: () => true,
    };
    const originalWindow = (globalThis as { window?: unknown }).window;
    Object.defineProperty(globalThis, "window", { value: fakeWindow, configurable: true });

    try {
      const Ada = loadOrCreateLocalLearner("Ada");
      const improvedAda = recordLocalAttempt(Ada, { subject: "science", topic: "Chemical Reactions", difficulty: "explorer", isCorrect: true }).learner;
      saveLocalLearner(improvedAda);
      signOutLocalLearner();

      const Grace = loadOrCreateLocalLearner("Grace");
      expect(Grace).toMatchObject({ name: "Grace", totalXp: 0, streak: 0 });
      signOutLocalLearner();

      expect(loadOrCreateLocalLearner("ada")).toMatchObject({ name: "Ada", totalXp: improvedAda.totalXp, streak: 1 });
      clearLocalLearner();
      expect(loadLocalLearner().name).toBe("");
      expect(loadOrCreateLocalLearner("Ada").totalXp).toBe(0);
      expect(loadOrCreateLocalLearner("Grace").name).toBe("Grace");
    } finally {
      if (originalWindow === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        Object.defineProperty(globalThis, "window", { value: originalWindow, configurable: true });
      }
    }
  });
});
