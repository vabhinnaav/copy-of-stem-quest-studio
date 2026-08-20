import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { learningActivity, quizAttempts, quizQuestions, subjectProgress, userRewards, type InsertUser, users } from "../drizzle/schema";
import type { GeneratedQuestion, StemSubject } from "../shared/stem";
import { ENV } from './_core/env';
import { calculateEarnedXp, calculateUpdatedStreak, getLevelForXp } from "./gamification";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function saveGeneratedQuestion(userId: number, question: GeneratedQuestion) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");

  const id = nanoid();
  await db.insert(quizQuestions).values({ id, userId, ...question });
  return { id, ...question };
}

export async function getQuestionForUser(userId: number, questionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");

  const result = await db
    .select()
    .from(quizQuestions)
    .where(and(eq(quizQuestions.id, questionId), eq(quizQuestions.userId, userId)))
    .limit(1);
  return result[0];
}

export async function recordAttemptAndProgress({
  userId,
  question,
  learnerAnswer,
  evaluation,
}: {
  userId: number;
  question: typeof quizQuestions.$inferSelect;
  learnerAnswer: string;
  evaluation: { isCorrect: boolean; feedback: string; explanation: string };
}) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");

  const now = new Date();
  return db.transaction(async tx => {
    const [reward] = await tx.select().from(userRewards).where(eq(userRewards.userId, userId)).limit(1);
    const nextStreakMarker = calculateUpdatedStreak(reward?.lastActivityAt, now);
    const nextStreak = nextStreakMarker === null
      ? (reward?.streak ?? 1)
      : nextStreakMarker === "increment"
        ? (reward?.streak ?? 0) + 1
        : 1;
    const earnedXp = calculateEarnedXp({
      isCorrect: evaluation.isCorrect,
      difficulty: question.difficulty,
      currentStreak: nextStreak,
    });

    await tx.insert(quizAttempts).values({
      id: nanoid(),
      userId,
      questionId: question.id,
      answer: learnerAnswer,
      isCorrect: evaluation.isCorrect ? 1 : 0,
      feedback: evaluation.feedback,
      earnedXp,
    });

    const [progress] = await tx
      .select()
      .from(subjectProgress)
      .where(and(eq(subjectProgress.userId, userId), eq(subjectProgress.subject, question.subject)))
      .limit(1);

    const updatedProgress = {
      totalXp: (progress?.totalXp ?? 0) + earnedXp,
      questionsAttempted: (progress?.questionsAttempted ?? 0) + 1,
      questionsCorrect: (progress?.questionsCorrect ?? 0) + (evaluation.isCorrect ? 1 : 0),
    };

    if (progress) {
      await tx.update(subjectProgress).set(updatedProgress).where(eq(subjectProgress.id, progress.id));
    } else {
      await tx.insert(subjectProgress).values({ userId, subject: question.subject, ...updatedProgress });
    }

    const totalXp = (reward?.totalXp ?? 0) + earnedXp;
    const level = getLevelForXp(totalXp);
    const rewardUpdate = {
      totalXp,
      currentLevel: level.level,
      badge: level.badge,
      streak: nextStreak,
      lastActivityAt: now,
    };

    if (reward) {
      await tx.update(userRewards).set(rewardUpdate).where(eq(userRewards.id, reward.id));
    } else {
      await tx.insert(userRewards).values({ userId, ...rewardUpdate });
    }

    await tx.insert(learningActivity).values({
      id: nanoid(),
      userId,
      subject: question.subject,
      type: "question_answered",
      title: evaluation.isCorrect ? "Correct answer" : "Learning moment",
      detail: `${question.topic} · ${question.difficulty}`,
      xpChange: earnedXp,
    });

    return {
      earnedXp,
      streak: nextStreak,
      totalXp,
      level,
      subjectProgress: updatedProgress,
    };
  });
}

export async function getLearningOverview(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");

  const [rewards] = await db.select().from(userRewards).where(eq(userRewards.userId, userId)).limit(1);
  const progress = await db.select().from(subjectProgress).where(eq(subjectProgress.userId, userId));
  const activity = await db
    .select()
    .from(learningActivity)
    .where(eq(learningActivity.userId, userId))
    .orderBy(desc(learningActivity.createdAt))
    .limit(6);

  return { rewards: rewards ?? null, progress, activity };
}

export async function getQuestionHistory(userId: number, subject?: StemSubject) {
  const db = await getDb();
  if (!db) throw new Error("Database is not available.");

  const filters = subject
    ? and(eq(quizAttempts.userId, userId), eq(quizQuestions.subject, subject))
    : eq(quizAttempts.userId, userId);

  return db
    .select({
      id: quizAttempts.id,
      isCorrect: quizAttempts.isCorrect,
      earnedXp: quizAttempts.earnedXp,
      createdAt: quizAttempts.createdAt,
      topic: quizQuestions.topic,
      subject: quizQuestions.subject,
      difficulty: quizQuestions.difficulty,
      title: quizQuestions.title,
    })
    .from(quizAttempts)
    .innerJoin(quizQuestions, eq(quizAttempts.questionId, quizQuestions.id))
    .where(filters)
    .orderBy(desc(quizAttempts.createdAt))
    .limit(30);
}
