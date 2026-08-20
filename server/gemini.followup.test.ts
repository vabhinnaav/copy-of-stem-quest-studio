import { describe, expect, it } from "vitest";
import { buildQuestionFollowUpPrompt } from "./gemini";
import type { GeneratedQuestion } from "@shared/stem";

const question: GeneratedQuestion = {
  title: "Force and motion",
  prompt: "What happens to an object when the net force on it is zero?",
  subject: "science",
  topic: "Forces & Energy",
  difficulty: "foundation",
  questionType: "multiple_choice",
  choices: [{ id: "A", text: "It keeps its current state of motion." }, { id: "B", text: "It must speed up." }],
  answer: { correctAnswer: "A", acceptableAnswers: ["A"] },
  hint: "Think about Newton's first law.",
  explanation: "A zero net force means there is no acceleration, so motion stays unchanged.",
};

describe("graded-question follow-up context", () => {
  it("includes the question, learner answer, grading, and follow-up request", () => {
    const prompt = buildQuestionFollowUpPrompt({
      question,
      learnerAnswer: "B",
      evaluation: { isCorrect: false, feedback: "Review net force.", explanation: "No net force means no acceleration." },
      followUp: "Why does no acceleration not mean the object stops?",
    });

    expect(prompt).toContain(question.prompt);
    expect(prompt).toContain("Learner answer: B");
    expect(prompt).toContain("Grading result: Not correct");
    expect(prompt).toContain("Why does no acceleration");
  });
});
