import { z } from "zod";

const secureEndpointSchema = z.string().url().max(500).refine(value => new URL(value).protocol === "https:", {
  message: "A custom provider endpoint must use HTTPS.",
});

export const aiConnectionSchema = z.object({
  provider: z.enum(["gemini", "openai_compatible", "anthropic"]),
  apiKey: z.string().min(10).max(1_000),
  model: z.string().min(1).max(160).regex(/^[A-Za-z0-9._:/-]+$/, "Use a valid provider model name."),
  endpoint: secureEndpointSchema.optional(),
});

export type AIConnection = z.infer<typeof aiConnectionSchema>;

export const mentorMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4_000),
});

type ProviderMessage = z.infer<typeof mentorMessageSchema>;

function getGeminiEndpoint(connection: AIConnection) {
  if (connection.endpoint) return connection.endpoint;
  return `https://generativelanguage.googleapis.com/v1beta/models/${connection.model}:generateContent`;
}

function getOpenAIEndpoint(connection: AIConnection) {
  return connection.endpoint ?? "https://api.openai.com/v1/chat/completions";
}

function getAnthropicEndpoint(connection: AIConnection) {
  return connection.endpoint ?? "https://api.anthropic.com/v1/messages";
}

export async function callAIProvider({
  connection,
  system,
  messages,
  responseSchema,
}: {
  connection: AIConnection;
  system: string;
  messages: ProviderMessage[];
  responseSchema?: object;
}) {
  if (connection.provider === "gemini") {
    const response = await fetch(getGeminiEndpoint(connection), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": connection.apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map(message => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [{ text: message.content }],
        })),
        generationConfig: responseSchema ? { responseMimeType: "application/json", responseSchema, temperature: 0.5 } : { temperature: 0.5 },
      }),
    });
    if (!response.ok) throw new Error(`Your Gemini provider request failed (${response.status}). Check the key, model, and available quota.`);
    const payload = (await response.json()) as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const text = payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("");
    if (!text) throw new Error("Your Gemini provider returned no usable response.");
    return responseSchema ? JSON.parse(text) : text;
  }

  if (connection.provider === "anthropic") {
    const response = await fetch(getAnthropicEndpoint(connection), {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": connection.apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: connection.model,
        max_tokens: 2_000,
        system: responseSchema ? `${system}\nReturn only valid JSON with the required response fields.` : system,
        messages,
        temperature: 0.5,
      }),
    });
    if (!response.ok) throw new Error(`Your Anthropic provider request failed (${response.status}). Check the key, model, endpoint, and available quota.`);
    const payload = (await response.json()) as { content?: Array<{ type?: string; text?: string }> };
    const text = payload.content?.filter(part => part.type === "text").map(part => part.text ?? "").join("");
    if (!text) throw new Error("Your Anthropic provider returned no usable response.");
    return responseSchema ? JSON.parse(text) : text;
  }

  const response = await fetch(getOpenAIEndpoint(connection), {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${connection.apiKey}` },
    body: JSON.stringify({
      model: connection.model,
      messages: [{ role: "system", content: system }, ...messages],
      temperature: 0.5,
      ...(responseSchema ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!response.ok) throw new Error(`Your provider request failed (${response.status}). Check the endpoint, key, model, and available quota.`);
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error("Your provider returned no usable response.");
  return responseSchema ? JSON.parse(text) : text;
}
