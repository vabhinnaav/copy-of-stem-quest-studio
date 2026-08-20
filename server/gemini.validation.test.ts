import { describe, expect, it } from "vitest";
import { generateQuestionInputSchema } from "./gemini";

describe("STEM question request validation", () => {
  it("accepts an approved topic for its selected STEM subject", () => {
    expect(() => generateQuestionInputSchema.parse({
      subject: "technology",
      topic: "Programming Logic",
      difficulty: "explorer",
      questionType: "multiple_choice",
    })).not.toThrow();
  });

  it("rejects a topic from another STEM subject", () => {
    expect(() => generateQuestionInputSchema.parse({
      subject: "science",
      topic: "Programming Logic",
      difficulty: "foundation",
      questionType: "true_false",
    })).toThrow("selected topic does not belong");
  });
});
