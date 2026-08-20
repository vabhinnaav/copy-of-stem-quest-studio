# Project TODO

- [x] Define the STEM quiz domain model for questions, attempts, progress, rewards, and recent activity.
- [x] Add persistent database tables and schema migrations tied to Manus OAuth users.
- [x] Implement a server-only Gemini question generation and answer-evaluation service with structured validation.
- [x] Add secure request contracts for autonomous questions by STEM subject, topic, difficulty, and question type.
- [x] Build reward calculations for XP, streaks, levels, badges, per-subject scores, and improvement metrics.
- [x] Implement Manus OAuth-aware dashboard queries, question history, and analytics.
- [x] Create a dark, mobile-first landing experience and authenticated dashboard home screen.
- [x] Create responsive Science, Technology, Engineering, and Mathematics workspaces with topic and difficulty selection.
- [x] Implement the autonomous quiz flow, answer submission, immediate feedback, explanations, and correct-answer reveal.
- [x] Implement performance analytics, recent activity, and per-subject visualizations.
- [x] Add accessible keyboard interaction, loading states, error states, and reduced-motion support.
- [x] Add unit tests for validation, reward calculations, and core server procedures.
- [x] Verify desktop and mobile renderings and run type checks and tests.
- [x] Prepare source files and secure deployment configuration guidance.
- [x] Replace Manus OAuth entry and account-dependent UI with a no-login learner-name onboarding flow.
- [x] Move learner identity, rewards, attempts, activity, and analytics persistence to browser local storage.
- [x] Update autonomous Gemini question generation and evaluation endpoints to work without authentication or database records.
- [x] Preserve all STEM arenas, question settings, feedback, rewards, analytics, and responsive design in the local-only mode.
- [x] Add a local profile reset option and document device-only persistence limitations.
- [x] Test no-login onboarding, local progress continuity, device-only reset, and mobile/desktop layouts.
- [x] Change sector entry so challenge settings are selected before a question is generated.
- [x] Clear the active question, selected answer, feedback, and hint when returning to mission control or switching STEM sectors.
- [x] Verify settings-first entry and fresh-question behavior across sector navigation on desktop and mobile.
- [x] Add a provider-neutral, browser-session AI connection configuration with provider, API key, endpoint, and model options.
- [x] Route question generation, answer evaluation, and mentor chat through the active user-supplied provider connection without persisting the key.
- [x] Add a mentor chat interface that receives a concise context derived from local performance, streaks, activity, and subject progress.
- [x] Preserve all existing dashboard, arena, local progress, and navigation behavior outside the new AI connection and mentor chat controls.
- [x] Test supported provider adapters, session-only key handling, performance-context construction, and responsive chat behavior.
- [x] Replace the single local learner record with a normalized on-device profile collection keyed by learner name.
- [x] Restore prior progress, activity, XP, streaks, and per-subject analytics when a previously used learner name is re-entered.
- [x] Preserve deliberate profile reset behavior while making learner switching explicit and safe.
- [x] Add Netlify configuration and serverless AI endpoint packaging without changing the current user experience.
- [x] Add free Netlify deployment instructions, environment-variable guidance, and static-file build output documentation.
- [x] Test named-profile restoration, reset, switching, and Netlify production build artifacts.
- [x] Separate the visible learner-switch action from an explicit delete-current-profile action.
- [x] Add regression coverage for preserved named-profile switching and deliberate deletion of only the active learner.
- [x] Verify the corrected profile controls and labels in the browser before delivery.
- [x] Replace the visually dense dashboard presentation with a clean professional learning workspace inspired by the supplied reference.
- [x] Simplify information hierarchy, navigation, cards, controls, and visual treatment while preserving all existing learning features.
- [x] Remove non-functional or placeholder controls from the visible interface.
- [x] Add an after-grading follow-up question action that sends the graded question, learner answer, evaluation, and explanation as AI context.
- [x] Preserve user-provided AI provider session settings and route follow-up answers through the active provider connection.
- [x] Add tests for follow-up context and verify refined desktop/mobile views and core flows.
- [x] Restore the weekly learning cadence or equivalent improvement-over-time view within the refined workspace.
- [x] Add regression coverage for the public follow-up procedure and active-provider follow-up routing after grading.
- [x] Verify the visible post-answer follow-up panel on desktop and mobile before delivery.
- [x] Replace hard card-grid boundaries with a more continuous section flow and selective content surfaces.
- [x] Soften borders, radius, shadows, and spacing to remove the boxed dashboard feel while preserving hierarchy.
- [x] Refine the subject library, progress, activity, practice, and feedback layouts without changing any feature behavior.
- [x] Verify fluid desktop and mobile visuals alongside existing quiz, profile, provider, mentor, and follow-up flows.
- [x] Visually verify the profile manager, AI provider settings, mentor chat, and post-answer follow-up panel after the fluid layout refinement.
- [x] Verify the updated layout preserves quiz submission, contextual follow-up, mentor opening, and learner profile controls end to end.
- [x] Add an equivalent automated interaction-flow regression covering local profile, graded answer, contextual follow-up, and mentor/provider behavior after the fluid layout update.
- [x] Restore the top-right Profile action and ensure it opens the existing device-local profile manager reliably.
- [x] Add an animated orange-and-black scrollable landing page with STEMQUEST wordmark, Start Learning call to action, About Us, and email contact details.
- [x] Add a scroll or Start Learning transition into the learner setup page with animated background, typewriter-style STEMQUEST treatment, API connection entry, learner-name entry, and search/start control.
- [x] Add a slide transition from setup into the feature-complete learning workspace while preserving local profiles, provider settings, mentor chat, questions, feedback, follow-ups, history, and analytics.
- [x] Restyle the learning workspace in the supplied orange-and-white visual language, including four STEM practice-area cards and a weekly cadence line chart without neon or rainbow effects.
- [x] Remove obsolete controls and verify every visible control has an active behavior in the redesigned journey.
- [x] Test profile access, page transitions, local profile restoration, quiz answer/follow-up flow, mentor/provider flow, and responsive desktop/mobile layouts.
- [x] Add targeted regression coverage for the landing-to-setup-to-workspace transition and existing learner-profile restoration.
- [x] Add a complete visible-control audit for landing, setup, workspace, profile manager, and mentor/provider settings overlays.
- [x] Verify provider-settings access from setup, mentor/profile overlays, and graded-question follow-ups from the redesigned journey.
- [x] Add a lightweight orange-palette peel hover treatment to the four STEM practice-area tiles only.
- [x] Preserve tile accessibility, click behavior, mobile behavior, and all existing learning features.
- [x] Verify the tile peel interaction at desktop and mobile sizes without visual regressions.
- [x] Remove the Current Setup block from the STEM practice workspace to create a more relaxed layout.
- [x] Preserve the question settings, tutor help panel, quiz behavior, and responsive practice workspace layout.
- [x] Verify the simplified practice workspace visually and through the regression suite.

- [x] Remove nonessential secondary helper text and refine the font treatment and contrast of supporting copy across the learning interface.
- [x] Verify the streamlined typography on desktop and mobile, with regression coverage for affected interface copy.

- [x] Add a STEMARCADE workspace navigation entry with white STEM and orange ARCADE lettering.
- [x] Integrate the supplied scan-grid hover and click animation behavior, then verify it on desktop and mobile.

- [x] Remove scan-grid animation runtime warnings while preserving the supplied hover, focus, and click behavior.
- [x] Verify the STEMARCADE interaction and responsive visibility at desktop and mobile breakpoints.

- [x] Add a mobile-accessible STEMARCADE control and verify its focused interaction alongside the desktop sidebar version.

- [x] Explicitly exercise the mobile STEMARCADE control’s focus and click behavior in the regression suite.

- [x] Add a dedicated STEMARCADE route with an animated transition from the workspace controls.
- [x] Integrate the supplied Gallery Tunnel source, imagery, and pointer interaction faithfully on the STEMARCADE page.
- [x] Verify entry, return navigation, the tunnel rendering, and all existing learning flows without feature regressions.

- [x] Add and regression-test a clear return path from STEMARCADE to the preserved learning workspace.

- [x] Verify, through the routed application, that returning from STEMARCADE restores the learning workspace and its preview learner state.

- [x] Preserve the originating workspace URL and query context so STEMARCADE returns learners to the exact view they left.

- [x] Replace all Gallery Tunnel image surfaces with only the six user-supplied STEM-themed images.
- [x] Verify the supplied images render in the tunnel while entry, return, and existing learning interactions remain intact.

- [x] Add a continuous three-second press-and-hold interaction that fades the STEMARCADE tunnel into the supplied coverflow deck behavior.
- [x] Populate the coverflow cards with STEM concept text and small concept symbols while retaining the supplied scrolling mechanics.
- [x] Verify hold timing, card scrolling, tunnel preservation, and return navigation across desktop and mobile.

- [x] Confirm the integrated STEM concept deck retains the supplied coverflow mechanics apart from the requested card-content substitution.
- [x] Verify the continuous hold, revealed card deck, card movement, and workspace return path at a mobile viewport.

- [x] Verify the three-second hold-to-reveal and return path end to end at a mobile viewport.
- [x] Add mobile-appropriate card movement coverage for the revealed STEM deck.

- [x] Verify the full STEMARCADE hold, reveal, card interaction, and return flow at an actual mobile viewport.

- [x] Restore visible Enter Arcade cursor feedback at the center of the Galaxy Tunnel.
- [x] Rename the existing fanned cards to Physics, Chemistry, Math, and Coding without changing their mechanics.
- [x] Verify the focused update preserves all tunnel, hold, deck, and return interactions.

- [x] Change only the Math card’s visible symbol.
- [x] Restore visible Galaxy Tunnel speed boost feedback on a center click while preserving the three-second hold reveal.
- [x] Verify center-click boost, continuous hold reveal, and existing card mechanics remain intact.

- [x] Re-verify the updated tunnel supports both a quick center-click boost and a continuous three-second hold reveal.
- [x] Reconfirm a deck card interaction after the updated tunnel behavior reveals the deck.

- [x] Keep wheel and touch scrolling as the only card-advancement mechanism, add a subtle hover selection lift, and prevent single clicks from re-centering cards.
- [x] Route selected Physics, Chemistry, Math, and Coding cards through smooth transitions into their corresponding user-supplied game implementations.
- [x] Verify the supplied game mechanics remain unchanged and all existing STEMARCADE, tunnel, deck, and workspace flows are preserved.

- [x] Remove keyboard-based card advancement so only wheel and touch gestures move the deck.
- [x] Live-verify hold reveal, scroll-hover-select, supplied game entry, arcade return, and workspace return after the final integration.

- [x] Live-verify a selected game returns through STEMARCADE to the preserved learning-workspace URL and context.

- [x] Fix Back to arcade so a subject game always restores the visible revealed deck rather than a black screen.
- [x] Rework the game navigation controls into a cohesive, accessible layout with clear arcade and workspace actions.
- [x] Verify the repaired game return, workspace return, and responsive control presentation end to end.

- [x] Ensure the mobile navigation toolbar clears the supplied game header and content instead of obscuring it.

- [x] Fix the reported Back to arcade regression that returns to a blank tunnel state instead of the revealed fanned deck.

- [x] Remove the Back to arcade visual transition so games return directly to the revealed deck.

- [x] Replace animated STEMARCADE navigation with direct card-to-game and game-to-selection-menu routing only.

- [x] Require a continuous three-second Back to workspace press that plays the Galaxy Tunnel in reverse before restoring the learning workspace.

- [x] Start the reverse Galaxy Tunnel on one Back to workspace click, then support click-to-boost and three-second hold-anywhere to restore the learning workspace.

- [x] Perform a read-only audit of navigation and API/AI request checks; obtain approval before any corrective change.

- [x] Configure only the optional server-side Gemini credential and validate it without changing application behavior.
