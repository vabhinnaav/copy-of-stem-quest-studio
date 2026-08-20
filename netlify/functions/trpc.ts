import type { Config } from "@netlify/functions";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../../server/routers";

/**
 * Database-free Netlify function wrapper for the public STEM AI endpoints.
 * Learner data remains in the browser; this function only proxies short-lived
 * question generation, evaluation, and mentor-chat requests.
 */
export default async (request: Request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: { Allow: "POST, OPTIONS" } });
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: async () => ({ user: null, req: {} as never, res: {} as never }),
  });
};

export const config: Config = { path: "/api/trpc/*" };
