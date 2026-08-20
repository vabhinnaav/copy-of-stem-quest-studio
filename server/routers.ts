import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { aiConnectionSchema, mentorMessageSchema } from "./aiProvider";
import { answerQuestionFollowUp, chatWithMentor, evaluateStemAnswer, generateQuestionInputSchema, generateStemQuestion } from "./gemini";
import { createQuestionSession, readQuestionSession } from "./questionSession";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  stem: router({
    generateQuestion: publicProcedure
      .input(z.object({ request: generateQuestionInputSchema, connection: aiConnectionSchema.optional() }))
      .mutation(async ({ input }) => {
        const generated = await generateStemQuestion(input.request, input.connection);
        const questionToken = await createQuestionSession(generated);
        const { answer: _answer, ...safeQuestion } = generated;
        return { ...safeQuestion, questionToken };
      }),
    submitAnswer: publicProcedure
      .input(z.object({ questionToken: z.string().min(20).max(12_000), answer: z.string().min(1).max(1_000), connection: aiConnectionSchema.optional() }))
      .mutation(async ({ input }) => {
        const { question } = await readQuestionSession(input.questionToken);
        const evaluation = await evaluateStemAnswer({ question, answer: input.answer, connection: input.connection });

        return {
          ...evaluation,
          correctAnswer: question.answer.correctAnswer,
          canonicalExplanation: question.explanation,
        };
      }),
    followUp: publicProcedure
      .input(z.object({
        questionToken: z.string().min(20).max(12_000),
        answer: z.string().min(1).max(1_000),
        evaluation: z.object({ isCorrect: z.boolean(), feedback: z.string().min(1).max(4_000), explanation: z.string().min(1).max(4_000) }),
        followUp: z.string().min(1).max(2_000),
        connection: aiConnectionSchema.optional(),
      }))
      .mutation(async ({ input }) => {
        const { question } = await readQuestionSession(input.questionToken);
        return {
          reply: await answerQuestionFollowUp({
            question,
            learnerAnswer: input.answer,
            evaluation: input.evaluation,
            followUp: input.followUp,
            connection: input.connection,
          }),
        };
      }),
  }),
  mentor: router({
    chat: publicProcedure
      .input(z.object({
        connection: aiConnectionSchema,
        performanceContext: z.string().min(1).max(8_000),
        messages: z.array(mentorMessageSchema).min(1).max(12),
      }))
      .mutation(async ({ input }) => ({
        reply: await chatWithMentor(input),
      })),
  }),
});

export type AppRouter = typeof appRouter;
