export const STEM_SUBJECTS = ["science", "technology", "engineering", "mathematics"] as const;
export const DIFFICULTY_LEVELS = ["foundation", "explorer", "challenge"] as const;
export const QUESTION_TYPES = ["multiple_choice", "short_answer", "true_false"] as const;

export type StemSubject = (typeof STEM_SUBJECTS)[number];
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];
export type QuestionType = (typeof QUESTION_TYPES)[number];

export type QuestionOption = {
  id: string;
  text: string;
};

export type QuestionAnswerKey = {
  correctAnswer: string;
  acceptableAnswers: string[];
};

export type GeneratedQuestion = {
  title: string;
  prompt: string;
  subject: StemSubject;
  topic: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  choices: QuestionOption[];
  answer: QuestionAnswerKey;
  hint: string;
  explanation: string;
};

export const SUBJECT_CONFIG: Record<
  StemSubject,
  { label: string; color: string; icon: string; topics: readonly string[] }
> = {
  science: {
    label: "Science",
    color: "violet",
    icon: "FlaskConical",
    topics: ["Chemical Reactions", "Forces & Energy", "Life Systems"],
  },
  technology: {
    label: "Technology",
    color: "cyan",
    icon: "Code2",
    topics: ["Programming Logic", "Cyber Security", "Digital Systems"],
  },
  engineering: {
    label: "Engineering",
    color: "amber",
    icon: "Wrench",
    topics: ["Structures & Forces", "Design Thinking", "Systems Engineering"],
  },
  mathematics: {
    label: "Mathematics",
    color: "fuchsia",
    icon: "Sigma",
    topics: ["Quadratic Equations", "Dimensional Analysis", "Algebraic Reasoning"],
  },
};

export const LEVELS = [
  { level: 1, name: "Curious Starter", minXp: 0, badge: "Orbit" },
  { level: 2, name: "Concept Scout", minXp: 250, badge: "Comet" },
  { level: 3, name: "STEM Solver", minXp: 700, badge: "Nova" },
  { level: 4, name: "Systems Thinker", minXp: 1400, badge: "Pulsar" },
  { level: 5, name: "Quest Architect", minXp: 2400, badge: "Supernova" },
] as const;
