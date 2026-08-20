import { describe, expect, it } from "vitest";
import handler, { config } from "./trpc";

describe("Netlify tRPC function", () => {
  it("claims the existing public AI route and handles CORS preflight without a database", async () => {
    expect(config.path).toBe("/api/trpc/*");

    const response = await handler(new Request("https://stemquest.example/api/trpc/stem.generateQuestion", { method: "OPTIONS" }));

    expect(response.status).toBe(204);
    expect(response.headers.get("Allow")).toContain("POST");
  });
});
