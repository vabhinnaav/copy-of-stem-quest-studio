# STEM Quest Studio

STEM Quest Studio is a dark, mobile-first STEM practice platform. Learners enter a display name on their device, launch a subject arena, and receive a freshly generated AI question without entering their own prompt. The application records answers, explanations, XP, levels, streaks, badges, subject progress, activity, and quiz history inside that browser.

## Architecture

| Layer | Responsibility |
| --- | --- |
| `client/` | The responsive browser interface: local-name onboarding, dashboard, subject arenas, answer flow, progress visualizations, reset option, and error states. |
| `server/gemini.ts` | The server-only Gemini request service, including the master assessment instruction, structured response schema, and validation. |
| `server/routers.ts` | Public, database-free endpoints for question generation and answer submission. |
| `server/questionSession.ts` | Stateless encrypted question sessions that keep answer keys off the client until submission, without storing the question in a database. |
| `client/src/lib/localProgress.ts` | Device-local learner identity, XP, streak, activity, attempts, and per-subject analytics. |
| `client/src/lib/aiConnection.ts` | Browser-session connection settings for a learner-supplied AI provider key. |
| `client/src/components/DeviceAIMentor.tsx` | Provider settings and an AI chat that derives concise context from local performance and activity. |
| `server/aiProvider.ts` | Server-side adapters for Gemini, Anthropic, and HTTPS OpenAI-compatible chat providers. |
| `drizzle/schema.ts` | Legacy account-storage definitions retained from the initial full-stack template; they are not used by the no-login learning flow. |

## Gemini security

The Gemini key is used only through `process.env.GEMINI_API_KEY` in server code. It is not present in the browser bundle, project source, HTML, CSS, or frontend network calls. The server calls the Gemini API, validates structured JSON, encrypts the answer key into a short-lived question session, and withholds it until a learner submits an answer.

> The key pasted in the initial conversation should be treated as compromised. Replace it with a new, restricted Gemini key and revoke the exposed key in Google AI Studio or Google Cloud Console.

The current server-side integration uses `gemini-3.6-flash`, because the provider reported that `gemini-2.5-flash` is unavailable to new users for this key. The question-generation service will fail closed if the key is absent, a response is malformed, a topic does not match the selected subject, or a choice-based question has no matching answer key.

## STEM settings

| Subject | Included topics | Difficulty levels | Question formats |
| --- | --- | --- | --- |
| Science | Chemical Reactions, Forces & Energy, Life Systems | Foundation, Explorer, Challenge | Multiple choice, Short answer, True / False |
| Technology | Programming Logic, Cyber Security, Digital Systems | Foundation, Explorer, Challenge | Multiple choice, Short answer, True / False |
| Engineering | Structures & Forces, Design Thinking, Systems Engineering | Foundation, Explorer, Challenge | Multiple choice, Short answer, True / False |
| Mathematics | Quadratic Equations, Dimensional Analysis, Algebraic Reasoning | Foundation, Explorer, Challenge | Multiple choice, Short answer, True / False |

## Device-local storage

The no-login version does **not** use an account or a database for learner data. A learner’s name, answers, XP, streak, badge, activity, and subject analytics are stored only in the current browser’s local storage. Progress does not sync to another browser or device, and it may be lost if the browser’s site data is cleared, private browsing is used, or the local profile is reset from the app. The reset control intentionally removes the local profile and returns the device to the name-entry screen.

The Gemini API key still requires a server-side proxy. A completely static browser-only deployment would expose the key to every visitor, so it is not safe for the autonomous AI feature. This project has no database requirement, but it retains the lightweight server route strictly for Gemini generation and evaluation.

## Bring your own AI provider

After entering a learner name, select **AI mentor** and open **Settings**. The learner can choose Google Gemini, Anthropic Claude, or an HTTPS OpenAI-compatible provider, then enter a provider key and model name. The selected connection is used for new question generation, answer evaluation, and mentor chat.

The supplied key is stored only in `sessionStorage` for the current browser session. It is not stored in the local learner profile, the database, project source, or server-side files. It is sent to the server only while making an AI request, and the server does not persist it. Closing the browser session or using **Clear session key** removes it.

The mentor receives a limited, generated context containing the learner’s local XP, streak, overall accuracy, per-subject totals, and recent activity. It does not receive the API key as chat context. Providers with non-standard APIs beyond Gemini, Anthropic, or an OpenAI-compatible chat-completions endpoint require a dedicated adapter before they can be used.

## Local validation

Use the following commands from the project directory:

```bash
pnpm check
pnpm test
pnpm build
```

The test suite includes credential authentication, topic-to-subject validation, gamification rules, and the preconfigured logout procedure. A one-time server-side Gemini generation smoke script is available at `scripts/verify-gemini.mjs`.

## Netlify deployment

The project now includes a free-tier-friendly Netlify layout: Vite produces the static HTML, CSS, and JavaScript bundles in `dist/public`, while one Netlify Function provides the stateless AI route. See [NETLIFY_DEPLOY.md](./NETLIFY_DEPLOY.md) for the build settings, named-browser-profile behavior, required `JWT_SECRET`, optional Gemini fallback secret, and deployment steps.
