import { describe, expect, it, vi } from "vitest";
import { aiConnectionSchema, callAIProvider } from "./aiProvider";

describe("provider-neutral AI connection validation", () => {
  it("accepts direct Gemini and HTTPS OpenAI-compatible connections", () => {
    expect(aiConnectionSchema.parse({ provider: "gemini", apiKey: "AIzaSyExampleKey12345", model: "gemini-3.6-flash" })).toMatchObject({ provider: "gemini" });
    expect(aiConnectionSchema.parse({ provider: "anthropic", apiKey: "sk-ant-example-provider-key", model: "claude-3-5-haiku-latest" })).toMatchObject({ provider: "anthropic" });
    expect(aiConnectionSchema.parse({ provider: "openai_compatible", apiKey: "sk-example-provider-key", model: "example-chat-1", endpoint: "https://provider.example/v1/chat/completions" })).toMatchObject({ provider: "openai_compatible" });
  });

  it("rejects insecure custom endpoints", () => {
    expect(() => aiConnectionSchema.parse({ provider: "openai_compatible", apiKey: "sk-example-provider-key", model: "example-chat-1", endpoint: "http://provider.example/v1/chat/completions" })).toThrow("HTTPS");
  });

  it("maps an OpenAI-compatible session connection into a chat-completions request", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ choices: [{ message: { content: "Mentor response" } }] }) });
    vi.stubGlobal("fetch", fetchMock);

    try {
      await expect(callAIProvider({
        connection: { provider: "openai_compatible", apiKey: "sk-example-provider-key", model: "example-chat-1", endpoint: "https://provider.example/v1/chat/completions" },
        system: "You are a mentor.",
        messages: [{ role: "user", content: "What should I practice?" }],
      })).resolves.toBe("Mentor response");
      expect(fetchMock).toHaveBeenCalledWith("https://provider.example/v1/chat/completions", expect.objectContaining({ method: "POST" }));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
