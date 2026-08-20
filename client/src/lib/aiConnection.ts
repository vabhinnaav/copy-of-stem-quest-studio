export type AIProvider = "gemini" | "openai_compatible" | "anthropic";

export type SessionAIConnection = {
  provider: AIProvider;
  apiKey: string;
  model: string;
  endpoint?: string;
};

const STORAGE_KEY = "stem-quest-ai-connection-v1";

export const defaultAIConnection: SessionAIConnection = {
  provider: "gemini",
  apiKey: "",
  model: "gemini-3.6-flash",
};

export function loadAIConnection(): SessionAIConnection {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultAIConnection;
    const parsed = JSON.parse(raw) as Partial<SessionAIConnection>;
    if ((parsed.provider !== "gemini" && parsed.provider !== "openai_compatible" && parsed.provider !== "anthropic") || typeof parsed.apiKey !== "string" || typeof parsed.model !== "string") return defaultAIConnection;
    return { provider: parsed.provider, apiKey: parsed.apiKey, model: parsed.model, endpoint: parsed.endpoint };
  } catch {
    return defaultAIConnection;
  }
}

export function saveAIConnection(connection: SessionAIConnection) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(connection));
}

export function clearAIConnection() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function getActiveAIConnection() {
  const connection = loadAIConnection();
  return connection.apiKey.trim().length >= 10 ? { ...connection, apiKey: connection.apiKey.trim(), endpoint: connection.endpoint?.trim() || undefined } : undefined;
}
