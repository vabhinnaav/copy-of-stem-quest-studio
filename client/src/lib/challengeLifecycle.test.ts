import { describe, expect, it } from "vitest";
import { prepareSectorEntry } from "./challengeLifecycle";

describe("STEM sector entry lifecycle", () => {
  it("opens each sector with its default topic and no generated or retained challenge", () => {
    const science = prepareSectorEntry("science");
    const mathematics = prepareSectorEntry("mathematics");

    expect(science).toMatchObject({
      subject: "science",
      topic: "Chemical Reactions",
      shouldGenerateQuestion: false,
      challenge: { question: null, selectedAnswer: "", shortAnswer: "", evaluation: null, hintOpen: false },
    });
    expect(mathematics).toMatchObject({
      subject: "mathematics",
      topic: "Quadratic Equations",
      shouldGenerateQuestion: false,
      challenge: { question: null, selectedAnswer: "", shortAnswer: "", evaluation: null, hintOpen: false },
    });
  });
});
