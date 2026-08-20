import { LEVELS, STEM_SUBJECTS, type DifficultyLevel, type StemSubject } from "@shared/stem";

export type LocalSubjectProgress = {
  subject: StemSubject;
  totalXp: number;
  questionsAttempted: number;
  questionsCorrect: number;
};

export type LocalActivity = {
  id: string;
  subject: StemSubject;
  title: string;
  detail: string;
  xpChange: number;
  createdAt: string;
};

export type LocalAttempt = {
  id: string;
  subject: StemSubject;
  topic: string;
  difficulty: DifficultyLevel;
  isCorrect: boolean;
  createdAt: string;
};

export type LocalLearner = {
  version: 1;
  deviceId: string;
  name: string;
  totalXp: number;
  streak: number;
  lastActivityAt: string | null;
  progress: LocalSubjectProgress[];
  activity: LocalActivity[];
  attempts: LocalAttempt[];
};

const LEGACY_STORAGE_KEY = "stem-quest-device-profile-v1";
const ACTIVE_PROFILE_KEY = "stem-quest-active-profile-v2";
const PROFILE_PREFIX = "stem-quest-profile-v2:";

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createLocalLearner(name = ""): LocalLearner {
  return {
    version: 1,
    deviceId: createId(),
    name,
    totalXp: 0,
    streak: 0,
    lastActivityAt: null,
    progress: STEM_SUBJECTS.map(subject => ({ subject, totalXp: 0, questionsAttempted: 0, questionsCorrect: 0 })),
    activity: [],
    attempts: [],
  };
}

function normalizeProfileName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

function profileStorageKey(name: string) {
  return `${PROFILE_PREFIX}${normalizeProfileName(name)}`;
}

function parseLearner(raw: string | null) {
  if (!raw) return null;
  try {
    const stored = JSON.parse(raw) as Partial<LocalLearner>;
    if (stored.version !== 1 || !stored.name || !Array.isArray(stored.progress) || !Array.isArray(stored.activity) || !Array.isArray(stored.attempts)) return null;
    return { ...createLocalLearner(stored.name), ...stored } as LocalLearner;
  } catch {
    return null;
  }
}

function migrateLegacyProfile() {
  const legacy = parseLearner(window.localStorage.getItem(LEGACY_STORAGE_KEY));
  if (!legacy) return;
  const key = profileStorageKey(legacy.name);
  if (!window.localStorage.getItem(key)) window.localStorage.setItem(key, JSON.stringify(legacy));
  if (!window.localStorage.getItem(ACTIVE_PROFILE_KEY)) window.localStorage.setItem(ACTIVE_PROFILE_KEY, normalizeProfileName(legacy.name));
  window.localStorage.removeItem(LEGACY_STORAGE_KEY);
}

export function loadLocalLearner() {
  migrateLegacyProfile();
  const activeName = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (!activeName) return createLocalLearner();
  return parseLearner(window.localStorage.getItem(`${PROFILE_PREFIX}${activeName}`)) ?? createLocalLearner();
}

export function loadOrCreateLocalLearner(name: string) {
  migrateLegacyProfile();
  const displayName = name.trim().replace(/\s+/g, " ");
  const profileName = normalizeProfileName(displayName);
  if (!profileName) return createLocalLearner();
  window.localStorage.setItem(ACTIVE_PROFILE_KEY, profileName);
  const stored = parseLearner(window.localStorage.getItem(profileStorageKey(displayName)));
  if (stored) return stored;
  const created = createLocalLearner(displayName);
  window.localStorage.setItem(profileStorageKey(displayName), JSON.stringify(created));
  window.dispatchEvent(new Event("stem-profile-updated"));
  return created;
}

export function saveLocalLearner(learner: LocalLearner) {
  const profileName = normalizeProfileName(learner.name);
  if (!profileName) return;
  window.localStorage.setItem(ACTIVE_PROFILE_KEY, profileName);
  window.localStorage.setItem(profileStorageKey(learner.name), JSON.stringify(learner));
  window.dispatchEvent(new Event("stem-profile-updated"));
}

export function signOutLocalLearner() {
  window.localStorage.removeItem(ACTIVE_PROFILE_KEY);
  window.dispatchEvent(new Event("stem-profile-updated"));
}

export function clearLocalLearner() {
  const activeName = window.localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (activeName) window.localStorage.removeItem(`${PROFILE_PREFIX}${activeName}`);
  window.localStorage.removeItem(ACTIVE_PROFILE_KEY);
  window.dispatchEvent(new Event("stem-profile-updated"));
}

function getStreak(lastActivityAt: string | null, currentStreak: number, now: Date) {
  if (!lastActivityAt) return 1;
  const previous = new Date(lastActivityAt);
  const previousDay = Date.UTC(previous.getUTCFullYear(), previous.getUTCMonth(), previous.getUTCDate());
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const difference = Math.round((today - previousDay) / 86_400_000);
  if (difference === 0) return currentStreak || 1;
  return difference === 1 ? currentStreak + 1 : 1;
}

export function getLevel(totalXp: number) {
  return [...LEVELS].reverse().find(level => totalXp >= level.minXp) ?? LEVELS[0];
}

export function recordLocalAttempt(
  learner: LocalLearner,
  input: { subject: StemSubject; topic: string; difficulty: DifficultyLevel; isCorrect: boolean }
) {
  const now = new Date();
  const streak = getStreak(learner.lastActivityAt, learner.streak, now);
  const difficultyBonus = { foundation: 5, explorer: 15, challenge: 30 }[input.difficulty];
  const earnedXp = (input.isCorrect ? 30 : 8) + difficultyBonus + (input.isCorrect ? Math.min(streak, 10) * 2 : 0);
  const totalXp = learner.totalXp + earnedXp;
  const progress = learner.progress.map(item => item.subject === input.subject ? {
    ...item,
    totalXp: item.totalXp + earnedXp,
    questionsAttempted: item.questionsAttempted + 1,
    questionsCorrect: item.questionsCorrect + (input.isCorrect ? 1 : 0),
  } : item);
  const activity: LocalActivity = {
    id: createId(),
    subject: input.subject,
    title: input.isCorrect ? "Correct answer" : "Learning moment",
    detail: `${input.topic} · ${input.difficulty}`,
    xpChange: earnedXp,
    createdAt: now.toISOString(),
  };
  const attempt: LocalAttempt = { id: createId(), ...input, createdAt: now.toISOString() };
  const updated = {
    ...learner,
    totalXp,
    streak,
    lastActivityAt: now.toISOString(),
    progress,
    activity: [activity, ...learner.activity].slice(0, 20),
    attempts: [attempt, ...learner.attempts].slice(0, 120),
  };
  return { learner: updated, reward: { earnedXp, streak, totalXp, level: getLevel(totalXp) } };
}
