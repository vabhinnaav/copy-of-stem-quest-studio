import { appRouter } from "../server/routers";

const caller = appRouter.createCaller({ user: null } as never);

const question = await caller.stem.generateQuestion({
  request: {
    subject: "technology",
    topic: "Programming Logic",
    difficulty: "foundation",
    questionType: "true_false",
  },
});

if (!question.questionToken || "answer" in question) {
  throw new Error("The public question endpoint did not return a safe stateless question payload.");
}

const evaluation = await caller.stem.submitAnswer({
  questionToken: question.questionToken,
  answer: "A",
});

if (typeof evaluation.isCorrect !== "boolean" || !evaluation.correctAnswer) {
  throw new Error("The public answer endpoint did not return a valid evaluation.");
}

console.log("No-login stateless question generation and evaluation verified.");
