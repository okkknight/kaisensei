# Changelog

Append-only resume log.

## 2026-06-20

- Added the missing example-sentence row to the Notice Build layout so the page clearly reads as translating a Chinese example sentence into English
- Added a Deep Mode default config layer under `api/src/deep/config/course.js` so the prompt and normalizer both consume the same course counts without any backend-config UI yet
- Hardened the Deep Mode prompt to inject the default config, exact course counts, and a concrete Focus example so the model has a clearer generation contract
- Relaxed the Deep Mode normalizer on distractor counts by trimming extras instead of hard-failing, while keeping the core course structure and blank counts intact
- Added JSON fragment extraction in the Deep Mode providers so wrapped JSON output can still be parsed before normalization
- Verified the real Deep Mode job end-to-end against `docs/deepmodeimage.png` on the live API, with job `job_fa8f56b498ac476a8bb49d02674099e7` completing successfully

- Removed the remaining page-layout references to the shared course shell concept so each page now describes its own direct elements and fixed regions
- Clarified that the shared Deep Mode page layout is only a structural explanation and must not become an extra visible outer shell in the real UI
- Aligned the Deep Mode frontend backbone spec to the Interpret / Interact / Step In reference images by splitting Interact into task-pack intro, Need practice, Handle practice, and milestone states
- Removed the last ambiguous title-like wording from the Deep Mode frontend backbone spec, keeping the shared course shell and Step In pages focused on real structure only
- Removed the reference-image caption labels from the Deep Mode frontend backbone spec so only the real page containers and content zones remain in the structure
- Clarified that the numbered labels in the Deep Mode reference images are documentation captions only and must not be treated as real page structure
- Aligned the Deep Mode frontend backbone spec to the loading-through-Notice milestone UI references, including page titles, top header rows, stage cards, and per-step shell structure
- Confirmed the Deep Mode frontend backbone decisions for the first implementation pass: no image modal in the first version, keep both completion CTAs, include the TTS button structure, and follow the product design doc for loading copy
- Updated the Deep Mode frontend backbone spec so the remaining implementation work can proceed without ambiguity on these interaction boundaries

## 2026-06-19

- Added `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-frontend-spec.md` to lock the Deep Mode frontend backbone before visual styling
- Defined the non-visual Deep Mode page flow, component responsibilities, and backend view-model boundary so Codex can build a usable structure first and fill visuals later
- Kept the spec aligned to `docs/kaisensei_deep_mode_product_design.md` as the authoritative frontend product source

- Tightened the Deep Mode backend contract so the prompt now emits the design-aligned inner shapes for Notice / Interpret / Interact / Step In, including focus-style exercises and Step In text turns
- Added a Deep-only retry bump in the job runner so the real provider has an extra recovery chance without changing Quick Mode behavior
- Verified the updated Deep Mode backend end-to-end through `POST /v1/lesson-jobs` with a real image, resulting in a succeeded deep job and a populated deep course payload

- Refined the Deep Mode scaffold into a clearer architecture baseline by extracting `useDeepModeFlow` and a standalone completion screen, while keeping the phase placeholders and behavior intact
- Updated the Deep Mode spec and structure plan so the current phase is explicitly architecture-first rather than feature-complete
- Verified the prototype still builds successfully with `cd prototype && npm run build`

- Reviewed the Quick Mode split into lifecycle and interaction hooks, plus the quick-specific trace helper, and found no spec-compliance issues in the current workspace
- Verified the prototype still builds successfully with `npm --prefix prototype run build`

- Split Quick Mode into a slimmer container plus quick-owned lesson subfiles for loading, error, empty, step, and feedback UI
- Kept the shared camera entry as the only first-screen input surface and left Deep Mode on its own scaffolded path
- Verified the updated prototype again with `cd prototype && npm run build`

## 2026-06-19

- Split the frontend into a thin shell, a shared `CameraEntry`, a Quick entry that can start from a captured file, and a Deep scaffold with overview and module shells
- Moved Quick lesson sentence/chunk helpers into `prototype/src/quick/lesson/lesson-helpers.js`, added quick/deep storage and copy namespaces, and removed the stale shared lesson helper file
- Verified the updated prototype with `cd prototype && npm run build`

## 2026-06-19

- Split the API AI-call layer so provider adapters and shared workspace / CLI helpers live under `api/src/shared/ai/`, while Quick Mode keeps its own prompt, normalizer, and provider modules under `api/src/quick/services/`
- Verified the refactor with `node --test test/*.test.js` in `api/` and kept Quick Mode behavior unchanged
- Refreshed `PROJECT_CONTEXT.md` to mark the isolation work complete and to point at the new shared AI / Quick feature paths
- Added `docs/superpowers/plans/2026-06-19-kaisensei-deepmode-structure-isolation-plan.md` as the next execution step for splitting Quick Mode and Deep Mode
- Marked the current latest task as the structure split and isolation pass that should happen before Deep Mode implementation begins
- Marked `docs/kaisensei_deep_mode_product_design.md` as the authoritative Deep Mode product fact source
- Marked `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md` as the current Deep Mode implementation boundary source
- Aligned the project context, PRD, and handoff reading order so future work starts from the same Deep Mode/Quick Mode separation

## 2026-06-19

- Aligned the project context and handoff pack to the current real repo state: Quick Mode remains the implemented prototype, while Deep Mode is now starting from spec rather than code
- Added `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md` as the current Deep Mode implementation source of truth
- Kept the Quick Mode prototype state in `prototype/` as the feature baseline that should not be modified by Deep Mode work
- Treat earlier Deep Mode implementation notes in this changelog as stale relative to the current checkout; they are historical context, not the present code state

## 2026-06-19

- Replaced the prototype quick mode shell with a Deep Mode storyboard board that follows `docs/deepmodeimage.png` as the visual reference
- Added `prototype/src/DeepModeApp.jsx` as the new Deep Mode entry, kept `prototype/src/App.jsx` as a thin wrapper, and rewrote `prototype/src/styles.css` around the lavender/yellow palette
- Added a local Deep Mode scene asset at `prototype/public/deep-mode-default.jpg` for the overview and completion screens
- Filled out the Deep Mode data schema in `prototype/src/deep-mode/deepModeData.js` so the storyboard cards can render loading, overview, Notice, Interpret, Interact, Step In, completion, and design-note states
- Verified the result in a real browser and confirmed `npm run build` passes for `prototype/`
- Reworked the storyboard preview into a real Deep Mode course flow with separate Overview, Notice, Interpret, Interact, Step In, and Completion screens, shared exercise/dialogue components, local persistence, and a photo modal
- Verified the real Deep Mode course flow in Chrome end-to-end from Overview to Course Complete, including the fixed bottom action bar and auto-advance behavior

## 2026-06-18

- Reset the Deep Mode V2 UI and interaction direction so it can be redesigned from scratch
- Confirmed Deep Mode V2 will live as a separate mode in the existing camera-page switch, with only generic shell capabilities shared and the course system kept independent
- Confirmed the Deep Mode V2 first release must be complete end-to-end, with tolerant short-answer matching, strict rejection for malformed output, preserved English TTS and question playback, and no speech input
- Slimmed the shared lesson prompt by merging repetitive chunk rules and tightening the Learn/Build/Use wording without weakening the actual constraints
- Tightened the shared lesson prompt so `learn.note` must be short Chinese only and Learn/Build chunks stay shorter, more reusable, and less clause-like across providers
- Simplified the VPS release path so the normal publish flow only syncs `prototype/dist/` and no longer rsyncs repo source to the VPS
- Tightened Use again so the answer must reuse 1-2 Learn chunks or collocations without copying See, keeping the reply connected but not repetitive
- Hardened Use prompts again so they cannot mention the picture/photo/image/scene and must read like a real conversational follow-up
- Tightened Learn and Build chunking again so Learn prefers 3-4 natural phrase chunks on simple scenes and Build uses a slightly more sentence-like segmentation instead of clause-by-clause slicing
- Changed Learn chunking so it is cut naturally around high-frequency phrases and fixed expressions instead of mechanically slicing the sentence
- Changed Build generation so it re-segments the sentence naturally instead of copying the Learn chunking, making sentence assembly feel less trivial
- Changed Use generation so the question feels like a real conversation with a specific speaker and setting instead of a generic prompt
- Changed Advanced prompt guidance so it stays practical and spoken while allowing higher-level IELTS/TOEFL-friendly vocabulary and collocations
- Changed Normal / Advanced switching so it only affects the next generated lesson and no longer retriggers the current photo's generation
- Added a root one-command local dev entry that starts API and frontend together without asking the browser to talk to the API port directly
- Removed the stale local `5175` reference from the project context and aligned the local URL notes with the actual dev server
- Split the runbook into local development versus production build so the local path no longer looks like a deployment recipe
- Added `docs/KAISENSEI_VPS_RUNBOOK.md` with the live `/kaisensei/` deployment steps, gateway path, and verification flow
- Separated camera bottom track modes from difficulty settings so `快速 / 深度` stays on the camera screen while `Normal / Advanced` lives in the settings modal
- Tightened the Codex prompt and lesson normalizer so `See` stays a single sentence and richness is driven by word count and vocabulary level rather than sentence chaining
- Refined the lesson prompt so `See` and `Build` stay observer-focused while `Use` remains a user-response exercise
- Removed `use.questionChinese` from the lesson contract, normalizer, prompt, prototype UI, and PRD
- Tightened the mobile lesson layout so Build and Use use clearer footer behavior and the lesson screen scrolls correctly on small viewports
- Unified the lesson page horizontal padding to 24px so all four steps breathe a little more on mobile
- Refreshed the handoff pack to reflect the current API-backed prototype instead of the initial scaffold state
- Locked Deep Mode V2 shared capability boundaries to photo capture, upload, and image input only; TTS and question reading stay inside the mode rather than being shared shell behavior
- Chose a mode-driven unified job entry for Quick Mode and Deep Mode, with separate output schemas per mode instead of parallel job systems
- Defined Deep Mode V2 recovery as same-device, same-browser only for MVP, with browser-side persistence now and service-side restore left for later
- Split Deep Mode V2 into a dedicated spec and implementation plan so task cards can now be derived without re-litigating product boundaries

## 2026-06-17

- Initialized the project flow skeleton and compact handoff pack from the settled PRD
- Confirmed the repo had no app source files before initialization
- Established the reading order for future implementation work
- Synced `PROJECT_CONTEXT.md` with the PRD and aligned `AGENTS.md` behavior notes to match the final `Use` reordering flow and tolerant checking rules
- Added `docs/superpowers/specs/2026-06-17-kaisensei-api-rollout.md` and `docs/superpowers/plans/2026-06-17-kaisensei-api-implementation-plan.md` to capture the real backend rollout and task-by-task implementation path
- Implemented `api/` with Fastify health check, multipart lesson job creation, in-memory job store, async Codex CLI provider, lesson normalizer, and polling routes
- Replaced the prototype mock lesson flow with a real API-backed mobile lesson flow using photo upload/capture, loading/error states, Build/Use reordering, and browser TTS
- Added Vite proxying for `/v1`, removed the runtime mock lesson data file, and verified the full path with `node --test`, `vite build`, and a browser end-to-end run
