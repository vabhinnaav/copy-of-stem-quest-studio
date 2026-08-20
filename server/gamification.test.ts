import { describe, expect, it } from "vitest";
import { calculateEarnedXp, calculateUpdatedStreak, getLevelForXp, getXpToNextLevel } from "./gamification";

describe("STEM Quest rewards", () => {
  it("awards more XP for correct challenge questions and active streaks", () => {
    const foundationMiss = calculateEarnedXp({ isCorrect: false, difficulty: "foundation", currentStreak: 0 });
    const challengeWin = calculateEarnedXp({ isCorrect: true, difficulty: "challenge", currentStreak: 5 });

    expect(challengeWin).toBeGreaterThan(foundationMiss);
    expect(challengeWin).toBe(70);
  });

  it("maps XP into the correct progression level", () => {
    expect(getLevelForXp(0)).toMatchObject({ level: 1, name: "Curious Starter" });
    expect(getLevelForXp(900)).toMatchObject({ level: 3, name: "STEM Solver" });
    expect(getXpToNextLevel(250)).toMatchObject({ progress: 0, remainingXp: 450 });
  });

  it("increments only consecutive UTC-day activity and resets a broken streak", () => {
    const now = new Date("2026-08-18T10:00:00.000Z");

    expect(calculateUpdatedStreak(new Date("2026-08-18T01:00:00.000Z"), now)).toBeNull();
    expect(calculateUpdatedStreak(new Date("2026-08-17T22:00:00.000Z"), now)).toBe("increment");
    expect(calculateUpdatedStreak(new Date("2026-08-15T22:00:00.000Z"), now)).toBe(1);
  });
});
