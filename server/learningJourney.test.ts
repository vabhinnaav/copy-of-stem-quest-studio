import { describe, expect, it, vi } from "vitest";
import { prepareSectorEntry } from "../client/src/lib/challengeLifecycle";
import { createLocalLearner, recordLocalAttempt } from "../client/src/lib/localProgress";
import { buildMentorPerformanceContext } from "../client/src/lib/mentorContext";
import { buildQuestionFollowUpPrompt } from "./gemini";
import { createQuestionSession } from "./questionSession";
import { appRouter } from "./routers";
import type { GeneratedQuestion } from "@shared/stem";

process.env.JWT_SECRET ??= "learning-journey-test-secret";

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

describe("updated learning journey", () => {
  it("keeps settings-first entry, local learning progress, mentor context, and provider-backed follow-up aligned", async () => {
    const entry = prepareSectorEntry("science");
    expect(entry.shouldGenerateQuestion).toBe(false);
    expect(entry.challenge.question).toBeNull();

    const learner = createLocalLearner("Ada");
    const recorded = recordLocalAttempt(learner, { subject: entry.subject, topic: entry.topic, difficulty: "foundation", isCorrect: false }).learner;
    const mentorContext = buildMentorPerformanceContext(recorded);
    const followUpContext = buildQuestionFollowUpPrompt({
      question,
      learnerAnswer: "B",
      evaluation: { isCorrect: false, feedback: "Review net force.", explanation: "No net force means no acceleration." },
      followUp: "Why does the object keep moving?",
    });

    expect(recorded.progress.find(item => item.subject === "science")).toMatchObject({ questionsAttempted: 1, questionsCorrect: 0 });
    expect(mentorContext).toContain("Learner: Ada");
    expect(mentorContext).toContain("science: 0/1 correct");
    expect(followUpContext).toContain(question.prompt);
    expect(followUpContext).toContain("Learner answer: B");
    expect(followUpContext).toContain("Why does the object keep moving?");

    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: "A constant velocity does not require a net force." } }] }) });
    vi.stubGlobal("fetch", fetchMock);
    try {
      const token = await createQuestionSession(question);
      const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });
      const result = await caller.stem.followUp({
        questionToken: token,
        answer: "B",
        evaluation: { isCorrect: false, feedback: "Review net force.", explanation: "No net force means no acceleration." },
        followUp: "Why does the object keep moving?",
        connection: { provider: "openai_compatible", apiKey: "sk-example-provider-key", model: "example-chat-1", endpoint: "https://provider.example/v1/chat/completions" },
      });
      const payload = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string) as { messages: Array<{ content: string }> };

      expect(result.reply).toContain("constant velocity");
      expect(payload.messages.map(message => message.content).join("\n")).toContain("Why does the object keep moving?");
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("submits a graded answer and continues into provider-backed follow-up and mentor chat", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: JSON.stringify({ isCorrect: false, feedback: "Review net force.", explanation: "No net force means no acceleration." }) } }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: "A zero net force permits constant velocity." } }] }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ choices: [{ message: { content: "Practice another forces question next." } }] }) });
    vi.stubGlobal("fetch", fetchMock);
    const connection = { provider: "openai_compatible" as const, apiKey: "sk-example-provider-key", model: "example-chat-1", endpoint: "https://provider.example/v1/chat/completions" };
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });

    try {
      const token = await createQuestionSession(question);
      const evaluation = await caller.stem.submitAnswer({ questionToken: token, answer: "B", connection });
      const followUp = await caller.stem.followUp({
        questionToken: token,
        answer: "B",
        evaluation: { isCorrect: evaluation.isCorrect, feedback: evaluation.feedback, explanation: evaluation.explanation },
        followUp: "Why can the object keep moving?",
        connection,
      });
      const mentor = await caller.mentor.chat({
        connection,
        performanceContext: "Learner: Ada. Total XP: 25. Streak: 2 days. Overall accuracy: 50% across 2 attempts.",
        messages: [{ role: "user", content: "What should I practice next?" }],
      });

      expect(evaluation).toMatchObject({ isCorrect: false, correctAnswer: "A" });
      expect(followUp.reply).toContain("constant velocity");
      expect(mentor.reply).toContain("forces question");
      expect(fetchMock).toHaveBeenCalledTimes(3);
      const mentorPayload = JSON.parse(fetchMock.mock.calls[2]?.[1].body as string) as { messages: Array<{ content: string }> };
      expect(mentorPayload.messages.map(message => message.content).join("\n")).toContain("What should I practice next?");
      expect(mentorPayload.messages[0]?.content).toContain("Total XP: 25");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
