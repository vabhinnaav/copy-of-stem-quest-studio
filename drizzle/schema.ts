import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";
import type { DifficultyLevel, QuestionAnswerKey, QuestionOption, QuestionType, StemSubject } from "../shared/stem";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const stemSubjectEnum = mysqlEnum("stemSubject", ["science", "technology", "engineering", "mathematics"]);
export const difficultyEnum = mysqlEnum("difficulty", ["foundation", "explorer", "challenge"]);
export const questionTypeEnum = mysqlEnum("questionType", ["multiple_choice", "short_answer", "true_false"]);
export const activityTypeEnum = mysqlEnum("activityType", ["question_answered", "level_up", "streak_milestone"]);

export const quizQuestions = mysqlTable("quizQuestions", {
  id: varchar("id", { length: 32 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: stemSubjectEnum.notNull().$type<StemSubject>(),
  topic: varchar("topic", { length: 100 }).notNull(),
  difficulty: difficultyEnum.notNull().$type<DifficultyLevel>(),
  questionType: questionTypeEnum.notNull().$type<QuestionType>(),
  title: varchar("title", { length: 120 }).notNull(),
  prompt: text("prompt").notNull(),
  choices: json("choices").$type<QuestionOption[]>().notNull(),
  answer: json("answer").$type<QuestionAnswerKey>().notNull(),
  hint: text("hint").notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("quizQuestions_user_created_idx").on(table.userId, table.createdAt),
  index("quizQuestions_subject_idx").on(table.subject),
]);

export const quizAttempts = mysqlTable("quizAttempts", {
  id: varchar("id", { length: 32 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  questionId: varchar("questionId", { length: 32 }).notNull().references(() => quizQuestions.id, { onDelete: "cascade" }),
  answer: text("answer").notNull(),
  isCorrect: int("isCorrect").notNull(),
  feedback: text("feedback").notNull(),
  earnedXp: int("earnedXp").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("quizAttempts_user_created_idx").on(table.userId, table.createdAt),
  index("quizAttempts_question_idx").on(table.questionId),
]);

export const subjectProgress = mysqlTable("subjectProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: stemSubjectEnum.notNull().$type<StemSubject>(),
  totalXp: int("totalXp").default(0).notNull(),
  questionsAttempted: int("questionsAttempted").default(0).notNull(),
  questionsCorrect: int("questionsCorrect").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("subjectProgress_user_subject_unique").on(table.userId, table.subject),
]);

export const userRewards = mysqlTable("userRewards", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  totalXp: int("totalXp").default(0).notNull(),
  currentLevel: int("currentLevel").default(1).notNull(),
  badge: varchar("badge", { length: 64 }).default("Orbit").notNull(),
  streak: int("streak").default(0).notNull(),
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const learningActivity = mysqlTable("learningActivity", {
  id: varchar("id", { length: 32 }).primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  subject: stemSubjectEnum.$type<StemSubject>(),
  type: activityTypeEnum.notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  detail: varchar("detail", { length: 300 }).notNull(),
  xpChange: int("xpChange").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("learningActivity_user_created_idx").on(table.userId, table.createdAt),
]);
