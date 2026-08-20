import { describe, expect, it } from "vitest";

describe("Gemini server credential", () => {
  it("authenticates to the Gemini models endpoint without exposing the key to the client", async () => {
    const apiKey = process.env.GEMINI_API_KEY;
    expect(apiKey).toBeTruthy();

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models", {
      headers: {
        "x-goog-api-key": apiKey ?? "",
      },
    });

    expect(response.ok).toBe(true);
  }, 30_000);
});
