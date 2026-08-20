import { describe, expect, it } from "vitest";
import { createLocalLearner, recordLocalAttempt } from "./localProgress";
import { buildMentorPerformanceContext } from "./mentorContext";

describe("mentor performance context", () => {
  it("summarizes local XP, streak, accuracy, subject records, and recent activity without credentials", () => {
    const learner = createLocalLearner("Ada");
    const updated = recordLocalAttempt(learner, { subject: "science", topic: "Chemical Reactions", difficulty: "explorer", isCorrect: true }).learner;
    const context = buildMentorPerformanceContext(updated);

    expect(context).toContain("Learner: Ada");
    expect(context).toContain(`Total XP: ${updated.totalXp}`);
    expect(context).toContain("Streak: 1 days");
    expect(context).toContain("Overall accuracy: 100% across 1 attempts");
    expect(context).toContain("science: 1/1 correct");
    expect(context).toContain("Chemical Reactions");
    expect(context).not.toContain("AIza");
  });
});
