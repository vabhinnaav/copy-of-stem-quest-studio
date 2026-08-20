import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { createQuestionSession } from "./questionSession";
import type { GeneratedQuestion } from "@shared/stem";

process.env.JWT_SECRET ??= "follow-up-router-test-secret";

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

describe("stem.followUp", () => {
  it("uses the supplied provider connection and carries the graded assessment context", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: "An object can continue moving at a constant velocity without accelerating." } }] }) });
    vi.stubGlobal("fetch", fetchMock);
    const token = await createQuestionSession(question);
    const caller = appRouter.createCaller({ user: null, req: {} as never, res: {} as never });

    try {
      const result = await caller.stem.followUp({
        questionToken: token,
        answer: "B",
        evaluation: { isCorrect: false, feedback: "Review net force.", explanation: "No net force means no acceleration." },
        followUp: "Why does the object not stop?",
        connection: { provider: "openai_compatible", apiKey: "sk-example-provider-key", model: "example-chat-1", endpoint: "https://provider.example/v1/chat/completions" },
      });

      expect(result.reply).toContain("constant velocity");
      const sentPayload = JSON.parse(fetchMock.mock.calls[0]?.[1].body as string) as { messages: Array<{ content: string }> };
      const requestContext = sentPayload.messages.map(message => message.content).join("\n");
      expect(requestContext).toContain(question.prompt);
      expect(requestContext).toContain("Learner answer: B");
      expect(requestContext).toContain("Why does the object not stop?");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
