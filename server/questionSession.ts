import { createHash } from "crypto";
import { EncryptJWT, jwtDecrypt } from "jose";
import type { GeneratedQuestion } from "@shared/stem";

type QuestionSession = {
  question: GeneratedQuestion;
};

function getEncryptionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("The server signing secret is not configured.");
  return createHash("sha256").update(secret).digest();
}

export async function createQuestionSession(question: GeneratedQuestion) {
  return new EncryptJWT({ question })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .encrypt(getEncryptionKey());
}

export async function readQuestionSession(token: string): Promise<QuestionSession> {
  const { payload } = await jwtDecrypt(token, getEncryptionKey());
  const question = payload.question as GeneratedQuestion | undefined;

  if (!question?.answer?.correctAnswer || !question.prompt || !question.subject) {
    throw new Error("This question session is invalid or has expired. Generate a new question to continue.");
  }

  return { question };
}
