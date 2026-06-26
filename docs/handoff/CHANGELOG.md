# Changelog

Append-only resume log.

## 2026-06-26

- Removed the internal Step In complete transition page so the final correct answer now advances straight to the global completion screen
- Updated the Step In flow helper to auto-advance the last successful turn directly into the course completion phase, while keeping the bridge-reply turns unchanged
- Deleted the unused Step In complete-page component and removed its dedicated copy strings

## 2026-06-25

- Tuned the Deep success celebration down again by removing the shockwave rings and pulling the confetti back toward the card edges with shorter, slower outward motion
- Verified the softer edge-near celebration with `npm --prefix prototype run build`
- Reworked the Deep success celebration so the confetti now erupts from around the feedback-card edges with larger outward trajectories and dual ring shockwaves, instead of a small center burst
- Verified the heavier success animation with `npm --prefix prototype run build`
- Changed the Interact closing prompt to "好极了！给对话结个尾吧" to make the follow-up cue a little lighter
- Verified the new closing prompt via a production build of the prototype
- Centered the Interact opening prompt as a single line and switched the follow-up turn to the closing prompt "很好！给对话结个尾" once the first reply succeeds
- Verified the prompt switch on `http://127.0.0.1:5173/?deepMockPhase=interact&deepMockInteractIndex=7`, including the handle page where the closing prompt now appears below the dialogue
- Added a top task banner above the Interact / Step In dialogue composer so the user sees the instruction immediately after the scene card, with the docked composer now focused on actions instead of repeating the prompt
- Verified the new task banner on `http://127.0.0.1:5173/?deepMockPhase=interact&deepMockInteractIndex=7` after rebuilding the prototype
- Updated the shared Deep dialogue scene card so the Interact mock now shows the Chinese scene description as the primary line and removes the secondary Chinese caption underneath
- Verified the scene-card copy change on `http://127.0.0.1:5173/?deepMockPhase=interact&deepMockInteractIndex=7` after rebuilding the prototype
- Extended the docked Deep dialogue layout to Interact dialogue pages so the answer composer now lives in the separate dock layer there as well, matching Step In
- Added a DEV-only `deepMockInteractIndex` query param so the Interact mock can jump straight to a chosen page, which made direct dialogue-page verification easier
- Verified the updated Interact dialogue layout with `npm --prefix prototype run build` and a live browser check on `http://127.0.0.1:5173/?deepMockPhase=interact&deepMockInteractIndex=7`
- Fixed the Deep Mode chunk-selection regression by keeping exercise state stable across background generation refreshes, so Notice / Step In page rerenders no longer push selected chunks back into the candidate bank
- Added a Playwright regression that reproduces a background generation refresh while a Notice answer is selected and verifies the selected chip stays in the answer area
- Verified the updated prototype with `npm --prefix prototype run test:deepmode`
- Fixed the production camera-page white screen by rebuilding the public site with the correct `/kaisensei/` Vite base path so the deployed HTML points at `/kaisensei/assets/*` instead of `/assets/*`
- Shortened the synthetic Deep Mode loading progress bar from about 30 seconds to about 25 seconds so the first-response expectation feels faster
- Verified the rebuilt frontend with `VITE_KAISENSEI_BASE_PATH=/kaisensei/ VITE_KAISENSEI_API_BASE=/kaisensei/api npm --prefix prototype run build` and `npm --prefix prototype run test:deepmode`
- Added a synthetic Deep Mode loading progress bar that fills over about 30 seconds, stalls near 29 seconds with a moving sheen if the first snapshot still has not arrived, and then completes to 100% once the first visible snapshot is ready
- Wired the loading bar into the Deep Mode flow so the overview only appears after the first snapshot has had a short reveal delay, while still keeping the staged generation and retry paths intact
- Extended the Deep Mode smoke test to assert the loading progress bar is rendered during the loading phase
- Verified the updated frontend with `npm --prefix prototype run build` and `npm --prefix prototype run test:deepmode`
- Added timing logs for Deep staged generation so the backend now records each stage's completion time, the cumulative elapsed time, and the first playable `overview_notice` response time
- Added a client-side `first_snapshot_visible` log so the first time the running Deep lesson becomes visible can be measured directly from the browser flow
- Ran a real-provider Deep Mode smoke against `WechatIMG395.jpg` with `CODEX_MODEL=gpt-5.5`, and confirmed the staged course completed successfully with a first visible snapshot at about 26s and total completion at about 116s
- Inspected the generated lesson content against the staged prompt design and confirmed the output still follows the expected photo anchor, same-scene progression, and conversational Step In structure

## 2026-06-24

- Implemented Task 4 of the staged Deep Mode generation plan: Notice, Interpret, and Interact can now open a small waiting page after their milestone screens when the next stage is still pending or failed
- Added a staged retry route and lifecycle plumbing so a failed Deep stage can resume from its frozen background, then auto-continue once the retried stage becomes ready
- Updated the Deep Mode smoke test to verify the overview appears from the partial snapshot, the Notice milestone opens a waiting page when Interpret is not ready, and the app auto-advances once the next stage becomes ready
- Verified the waiting-page flow and staged retry path with `npm --prefix api test`, `npm --prefix prototype run build`, and `npm --prefix prototype run test:deepmode`
- Implemented Task 3 of the staged Deep Mode generation plan: the frontend now derives a partial lesson snapshot from frozen stage data, renders the overview as soon as `overview + notice` is ready, and carries the ready-stage marker through the Deep flow state
- Added the staged snapshot helper and flow hook under `prototype/src/deep/state/staged-generation/` so the running job can be consumed in one normalized shape before and after success
- Taught the Deep Mode app shell to prefer the partial snapshot while loading, and extended the course schema / state objects so the ready stage is visible to the rest of the flow
- Updated the Deep smoke test to prove the overview appears from the staged snapshot before the final lesson response arrives, and aligned the Playwright dev-server URL with the prototype's real `5173` port
- Implemented the staged Deep Mode backend orchestration: added stage context, stage prompt, stage normalizer, and a serial stage runner that freezes each stage into `job.generation`
- Added stage-aware deep provider methods and tests so `overview_notice` can be generated and normalized independently of the full-course path
- Expanded API coverage for staged generation so the runner test now verifies the full `overview_notice -> interpret -> interact -> step_in` sequence and the frozen background passed to later stages
- Implemented Task 1 of the staged Deep Mode generation plan: added a `generation` envelope to the job contract, persisted it in the in-memory job store, and returned it from lesson job create / poll responses
- Added API coverage so job-store and route tests now lock the staged-generation envelope shape instead of assuming only `status` and `lesson`
- Drafted the staged Deep Mode generation spec so `overview + notice` becomes the fixed first playable unit, `interpret -> interact -> step in` stay serial, and waiting pages only appear when the next stage is not ready
- Aligned the old Deep Mode product design doc with the current Understand wording so the Chinese chunking rule starts from one complete natural sentence before reordering
- Kept the Deep Mode prompt wording consistent with that rule and trimmed the duplicated Understand guidance
- Refreshed the handoff pack so the current task points at the Understand wording cleanup rather than the earlier Interact / Step In wording pass
- Synced the updated Deep Mode API source to the VPS and restarted `kaisensei.service` after the wording cleanup
- Reworked the Deep Mode Interact prompt so Need, systemReply, and Handle read as one learner-system-learner exchange in the same scene instead of a vocabulary drill
- Reworked the Deep Mode Step In prompt so it reads as a natural role-play conversation, allows light system scene-setting when needed, and keeps the sourceModule wording descriptive rather than overly canonical
- Updated the prompt regression assertions to match the new wording and verified the result locally with `node --test api/test/deep-course-provider.test.js`

## 2026-06-23

- Reworked the Deep Mode Interact prompt so Need is the opening line, systemReply is the in-scene bridge, and Handle becomes the learner's follow-up line in one continuous exchange
- Updated the Deep Mode normalizer wording and regression coverage to keep the new bridge-line rule explicit without changing the schema or task counts
- Verified the prompt rewrite locally with `npm --prefix api test`
- Reworked the Deep Mode Interact and Step In front-end playback so successful dialogue answers enter the chat stream directly, show a checked user bubble, and use a short typing bridge before the system reply when the page is a Need turn
- Hid the dialogue practice footer while playback is active, and added styling for the checked bubble and typing state so the interaction reads like a real conversation instead of a success card flow
- Verified the frontend rewrite locally with `npm --prefix prototype run build`
- Synced the rebuilt frontend to the VPS at `89.208.242.44`, restarted `kaisensei.service`, `boringapi.service`, and `caddy`, and verified `https://boringmax.com/kaisensei/` now serves the new production asset bundle

## 2026-06-22

- Brought Quick Mode's Normal / Advanced tuning into the Deep prompt so Normal stays clearer and more direct while Advanced stays more polished but still practical, and added a regression test for the new level-specific prompt wording
- Re-verified the API suite after the Deep prompt level tuning update with `npm --prefix api test`, synced the updated API source to the VPS, and restarted `kaisensei.service`

- Built the mobile lesson footer fix, synced `prototype/dist/` to the VPS, restarted the live services, and verified the deployed site serves the new mobile footer CSS
- Made the lesson footer float above the viewport on small screens so long Quick Mode and Deep Mode pages keep their bottom action buttons reachable, and added extra bottom padding to lesson content to avoid overlap
- Updated the handoff context to treat the mobile footer fix as the current task and the global lesson-footer behavior as a cross-feature impact

- Rebuilt the Deep Mode generation prompt around a senior-English-teacher role, with `coreExpression` defined as a learnable high-frequency phrase, collocation, or practical expression instead of a sentence, and with same-scene pack differentiation emphasized across Notice, Interpret, and Interact
- Updated the Deep Mode prompt regression coverage so the new teaching-focused wording stays locked in and the old clause-slicing / template-heavy wording stays out
- Kept the Deep Mode contract and normalizer unchanged in this pass, then verified the API suite with `npm --prefix api test`

- Refreshed the Deep Mode generation prompt so the model acts as an English teaching system, core expressions stay high-frequency and practical, same-module packs stay clearly differentiated, and chunk guidance is specific without being overly template-driven
- Removed the extra Deep Mode template-prefix constraint from the prompt and kept the regression assertions aligned with the new quality rules
- Verified the prompt refresh with `node --test api/test/deep-course-provider.test.js`, then synced the updated API source to the VPS and restarted `kaisensei.service`

- Replaced the Deep Mode chunk-count hard gate with lighter prompt guidance for Understand chunk cuts, steering the model toward simple Chinese sentence parts and away from meaningless碎片词块 such as 的 / 了 / 什么
- Relaxed the Deep Mode normalizer so Understand / Build / Quick Response no longer fail only because chunk counts fall outside a fixed range, while keeping structural and answer-coverage checks intact
- Verified the prompt/normalizer refresh with `npm --prefix api test`, then synced the updated API files to the VPS and restarted `kaisensei.service`

- Tightened Deep Mode Understand / Build / Quick Response chunk rules to 3-6, aligned the prompt, normalizer, API fixtures, and prototype mock schema, and verified the result with `npm --prefix api test` and `npm --prefix prototype run test:deepmode`

- Added a Deep Mode integration spec and execution plan that lock the confirmed联调 decisions: backend-only `overview.startPromptChinese`, required `scenePromptChinese` on Interact guide data, canonical Step In `sourceModule` mapping, `pack.coreExpression` as the only highlight source, a nested Deep contract shape, and frontend job polling
- Hardened the Deep Mode backend contract, prompt, and normalizer so `scenePromptChinese` is required on task packs and Step In source-module aliases normalize to `notice`, `interpret`, `interact_need`, and `interact_handle`
- Switched the Deep Mode frontend flow from local mock lesson generation to a job-polling lifecycle, and updated the Interact flow to read `scenePromptChinese` while keeping understand highlighting anchored to `coreExpression`
- Added a Playwright smoke test and prototype Playwright config for Deep Mode job polling, plus a convenience `prototype` script to run the new smoke test
- Verified the integration loop with `cd api && npm test`, `cd prototype && npm run build`, and `cd prototype && npm run test:deepmode`

## 2026-06-21

- Fixed the Deep Mode playback order in the design docs so Notice / Interpret run example-index-first and Interact runs task-pack-first with Need / Handle interleaving by example
- Added a regression test for Notice / Interpret sequencing so the example-index-first order stays locked in the prototype
- Refined Deep Mode Interact so the dialogue `systemReply` is a bridge sentence and the learned Handle expression stays reserved for the user's reply
- Added normalizer and prompt guards so bridge replies that expose the learned Handle are rejected before reaching the UI
- Updated the Deep Mode mock Interact dialogue examples to use bridge replies instead of exposing the target Handle line early
- Aligned Deep Mode pack content so baseExample and variations keep the same core expression across Notice, Interpret, and Interact instead of drifting into separate pack meanings
- Updated the Deep Mode mock data, page sequencing helpers, and exercise page rendering so the frontend prototype follows the same pack-level core expression rule
- Hardened the Deep Mode prompt and normalizer so variation payloads are validated against the pack core expression before they reach the UI
- Verified the updated workspace with `npm --prefix prototype run build` and `npm --prefix api test`

## 2026-06-20

- Added a Deep Mode frontend implementation plan that starts with reusable skeletons, validates a reference slice, then expands by page family
- Added explicit page-family and template mappings plus an exact Deep Mode phase chain so the backend JSON maps cleanly to screen families
- Added explicit Deep Mode page templates and reusable layout primitives so Codex can reuse page skeletons instead of redrawing each screen
- Expanded the Completion page into explicit photo, completion message, four-stage summary, dialogue replay, and dual-CTA regions so the final screen can be built without guessing
- Expanded Step In in the frontend spec as a single dialogue page with explicit turn states for Notice, Interpret, Interact Need, and Interact Handle
- Split Interact Dialogue Practice into explicit Need and Handle pages so the reference-image flow can be implemented as two concrete screens
- Rewrote the Interact section so Need and Handle are listed as six explicit pages (`Understand` / `Focus` / `Build` for each) instead of a compressed sequence rule
- Clarified that Interact Need and Handle are repeated three-step example sequences, so every base example and variation must complete Understand / Focus / Build before Dialogue Practice begins
- Separated Notice and Interpret into distinct page lists in the frontend spec so they can share components without collapsing into a single logical page family
- Added field-level source mappings for the Interact milestone and completion views so the final pages can be reconstructed from task packs and dialogue turns instead of vague summary text
- Added field-level source mappings for Interact, Step In, and Completion so every visible block can trace back to task packs, dialogue turns, or fixed completion copy
- Added field-level source mappings for the confirmed Deep Mode pages so Loading, Overview, Notice exercises, Quick Response, and Notice Milestone all trace values back to backend lesson fields or fixed product copy
- Added a field-level writing rule to the Deep Mode frontend backbone spec so every page must name concrete component fields instead of vague summary language
- Clarified that the Notice Milestone completion card includes a separate learned-expression list block, not just a generic completion summary
- Corrected the Notice Milestone layout so it starts directly from the centered completion card instead of inheriting the practice-page layout baseline
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

## 2026-06-21

- Unified Deep Mode Step In across product design, spec, backend prompt, frontend prompt copy, and prototype mock data so the final challenge reads as one continuous role-play conversation in the same scene
- Reworded Step In guide and replay copy to stay in character instead of using quiz-style question prompts
- Updated the Step In mock dialogue to keep the system voice consistent across turns and to avoid interviewer-style wording

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
