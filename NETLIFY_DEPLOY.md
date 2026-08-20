# Netlify Deployment Guide

This project is prepared for **static hosting plus one serverless function**. The learner profile, XP, answers, streaks, activities, and analytics are kept in each browser, so a database is not required. The build output contains the browser-delivered `index.html`, JavaScript bundles, and CSS bundles in `dist/public/`; Netlify builds these files from source using `pnpm build:netlify`.

## What is deployed

| Project part | Netlify destination | Purpose |
| --- | --- | --- |
| `client/` and `shared/` | Static `dist/public/` site | The no-login STEM Quest user interface and device-local profiles. |
| `netlify/functions/trpc.ts` | Serverless function at `/api/trpc/*` | Securely relays question, answer-evaluation, and mentor-chat requests. It stores no learner records. |
| `netlify.toml` | Netlify build configuration | Defines the Vite build, static publish directory, function directory, and SPA fallback. |

## Deploy from a Git repository

Create a repository from this project, push the files, and create a new site in Netlify by importing that repository. Netlify’s Vite guidance recognizes a Vite build, while this project explicitly supplies the required custom publish directory and functions directory in `netlify.toml`. [1]

Netlify will use the following settings from `netlify.toml`:

| Setting | Value |
| --- | --- |
| Build command | `pnpm build:netlify` |
| Publish directory | `dist/public` |
| Functions directory | `netlify/functions` |
| Node version | `22` |

## Required environment variables

Add the following value in **Site configuration → Environment variables** before deploying. Do not commit real secrets to the repository.

| Variable | Required | Purpose |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Encrypts the short-lived question token that keeps an answer key off the browser until a learner submits an answer. Use a new long random value. |
| `GEMINI_API_KEY` | Optional | Enables the original project-default Gemini fallback. It is not needed when each learner uses **AI mentor → Settings** to supply their own session-only provider key. |

Netlify documents that runtime-sensitive values should be read by serverless functions instead of injected into browser code. [2]

## No-database behavior

Entering **Ada**, completing a quiz, and switching learner does not delete Ada’s data. Re-entering **Ada** in the same browser restores Ada’s saved local profile. Entering **Grace** opens a separate local profile. Deleting browser site data, using private browsing, or using a different browser/device still creates a new empty profile because no cloud database is involved.

## Provider keys

The optional **AI mentor** settings support Google Gemini, Anthropic, and OpenAI-compatible endpoints. A learner-supplied key is kept only in that browser session and is not stored in the named learner profile. The Netlify function receives the key only to make the requested AI call and does not persist it.

## Verify before deployment

Run these commands from the project root:

```bash
pnpm check
pnpm test
pnpm build:netlify
```

The final command produces the static files Netlify publishes. The function wrapper is TypeScript-checked and can be bundled independently with `pnpm exec esbuild netlify/functions/trpc.ts --bundle --platform=node --format=esm --outdir=/tmp/stem-netlify-function --tsconfig=tsconfig.json`.

## References

[1]: https://docs.netlify.com/build/frameworks/framework-setup-guides/vite/ "Netlify: Vite"
[2]: https://docs.netlify.com/build/functions/get-started/ "Netlify: Get started with functions"
