import { describe, expect, it } from "vitest";
import { createQuestionSession, readQuestionSession } from "./questionSession";
import type { GeneratedQuestion } from "@shared/stem";

process.env.JWT_SECRET ??= "test-only-session-secret";

const question: GeneratedQuestion = {
  title: "Logic gate warm-up",
  prompt: "What is the output of an AND gate when both inputs are true?",
  subject: "technology",
  topic: "Digital Systems",
  difficulty: "foundation",
  questionType: "multiple_choice",
  choices: [
    { id: "A", text: "True" },
    { id: "B", text: "False" },
    { id: "C", text: "Undefined" },
    { id: "D", text: "Zero" },
  ],
  answer: { correctAnswer: "A", acceptableAnswers: ["A", "True"] },
  hint: "An AND gate needs both conditions to be true.",
  explanation: "When both AND inputs are true, the output is true.",
};

describe("stateless question session", () => {
  it("round-trips the hidden answer key through an encrypted expiring token", async () => {
    const token = await createQuestionSession(question);
    const session = await readQuestionSession(token);

    expect(token).not.toContain('"correctAnswer"');
    expect(session.question.answer.correctAnswer).toBe("A");
    expect(session.question.prompt).toBe(question.prompt);
  });
});
