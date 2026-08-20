const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is unavailable in the server environment.");
}

const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{
          text: "You create concise STEM learning questions. Return only JSON matching the supplied schema.",
        }],
      },
      contents: [{
        role: "user",
        parts: [{ text: "Create one foundation multiple-choice question about Programming Logic." }],
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            prompt: { type: "STRING" },
            correctAnswer: { type: "STRING" },
          },
          required: ["prompt", "correctAnswer"],
        },
      },
    }),
  }
);

if (!response.ok) {
  throw new Error(`Gemini generation validation failed with HTTP ${response.status}.`);
}

const payload = await response.json();
const text = payload.candidates?.[0]?.content?.parts?.map(part => part.text ?? "").join("");
const question = JSON.parse(text);

if (!question.prompt || !question.correctAnswer) {
  throw new Error("Gemini did not return the required structured question fields.");
}

console.log("Gemini structured question generation verified.");
