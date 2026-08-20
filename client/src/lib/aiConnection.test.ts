import { describe, expect, it } from "vitest";
import { clearAIConnection, getActiveAIConnection, loadAIConnection, saveAIConnection } from "./aiConnection";

describe("session AI connection", () => {
  it("stores a provider key only in session storage and removes it when cleared", () => {
    const entries = new Map<string, string>();
    const originalWindow = (globalThis as { window?: unknown }).window;
    Object.defineProperty(globalThis, "window", { configurable: true, value: { sessionStorage: { getItem: (key: string) => entries.get(key) ?? null, setItem: (key: string, value: string) => entries.set(key, value), removeItem: (key: string) => entries.delete(key) } } });
    try {
      saveAIConnection({ provider: "gemini", apiKey: "AIzaSyExampleKey12345", model: "gemini-3.6-flash" });
      expect(loadAIConnection().apiKey).toBe("AIzaSyExampleKey12345");
      expect(getActiveAIConnection()).toMatchObject({ provider: "gemini", model: "gemini-3.6-flash" });
      clearAIConnection();
      expect(getActiveAIConnection()).toBeUndefined();
    } finally {
      if (originalWindow === undefined) Reflect.deleteProperty(globalThis, "window");
      else Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }
  });
});
