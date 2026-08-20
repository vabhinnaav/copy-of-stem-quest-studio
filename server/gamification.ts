import { LEVELS, type DifficultyLevel } from "@shared/stem";

export function getLevelForXp(totalXp: number) {
  return [...LEVELS].reverse().find(level => totalXp >= level.minXp) ?? LEVELS[0];
}

export function getXpToNextLevel(totalXp: number) {
  const current = getLevelForXp(totalXp);
  const next = LEVELS.find(level => level.level === current.level + 1);

  if (!next) {
    return { current, next: null, progress: 100, remainingXp: 0 };
  }

  const progress = Math.round(
    ((totalXp - current.minXp) / (next.minXp - current.minXp)) * 100
  );

  return {
    current,
    next,
    progress: Math.max(0, Math.min(100, progress)),
    remainingXp: Math.max(0, next.minXp - totalXp),
  };
}

export function calculateEarnedXp({
  isCorrect,
  difficulty,
  currentStreak,
}: {
  isCorrect: boolean;
  difficulty: DifficultyLevel;
  currentStreak: number;
}) {
  const difficultyBonus = { foundation: 5, explorer: 15, challenge: 30 }[difficulty];
  const streakBonus = isCorrect ? Math.min(currentStreak, 10) * 2 : 0;
  return (isCorrect ? 30 : 8) + difficultyBonus + streakBonus;
}

export function calculateUpdatedStreak(
  lastActivityAt: Date | null | undefined,
  now: Date
) {
  if (!lastActivityAt) return 1;

  const previousDay = Date.UTC(
    lastActivityAt.getUTCFullYear(),
    lastActivityAt.getUTCMonth(),
    lastActivityAt.getUTCDate()
  );
  const currentDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dayDifference = Math.round((currentDay - previousDay) / 86_400_000);

  if (dayDifference === 0) return null;
  if (dayDifference === 1) return "increment" as const;
  return 1;
}
