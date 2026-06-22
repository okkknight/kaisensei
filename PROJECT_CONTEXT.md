# kaisensei Project Context

## What the project is

kaisensei is a mobile-first web prototype for learning English from one real photo.

Core loop:

`See -> Learn -> Build -> Use`

It turns one scene into one short, friendly, 1-minute micro-lesson.

## What it is not

- Not a generic AI photo describer
- Not a chatbot
- Not a vocabulary list app
- Not a grammar textbook app
- Not a test-prep product
- Not the old snapspeak mode structure

## Current implementation status

- Quick Mode remains the implemented lesson flow in `prototype/` and should stay unchanged unless explicitly requested
- Deep Mode is now split into its own feature domain with separate overview, Notice, Interpret, Interact, Step In, and completion surfaces
- Deep Mode pack content now keeps one `coreExpression` across baseExample and variations
- Deep Mode Notice / Interpret playback is locked to example-index-first ordering
- Deep Mode Interact playback is locked to task-pack-first ordering
- Interact dialogue practice now uses a bridge `systemReply` and keeps the learned Handle expression for the user reply
- Step In dialogue now reads as a continuous in-scene role-play instead of quiz-style turns
- Deep Mode Understand chunk guidance is currently prompt-led: cut by simple Chinese sentence parts such as subject / predicate / object / modifier, avoid碎片词块 like 的 / 了 / 什么, and do not add filler chunks just to satisfy a count
- Deep Mode normalizer no longer hard-rejects chunk counts for Understand / Build / Quick Response; it still checks structure, answer coverage, and required arrays

## Current latest task

- Task: 轻量收紧 Deep Mode Understand chunk 切分提示，避免无意义碎片词块，同时不再强卡 chunk 数量
- Status: 已执行待验收

## Architecture or state flow

Current Quick Mode states:

1. Camera Mode
2. Loading Mode
3. Lesson Mode

Current Quick Mode lesson steps:

1. See
2. Learn
3. Build
4. Use

Deep Mode planned flow:

1. Camera entry with mode selection
2. Loading / generation
3. Overview
4. Notice
5. Interpret
6. Interact
7. Step In
8. Completion

## Verified commands

- `npm --prefix api test`
- `npm --prefix prototype run test:deepmode`
- `npm --prefix prototype run build`
- `npm run dev` from the repo root starts the local API and prototype together
- `lsof -nP -iTCP:3001 -sTCP:LISTEN` confirmed the API is listening on `127.0.0.1:3001`
- Latest API verification after the prompt/normalizer refresh: `npm --prefix api test`

## Runtime notes

- The API runs separately from the Vite prototype and must be restarted to pick up backend changes
- The root `npm run dev` script launches both services together and keeps local requests same-origin through the Vite `/v1` proxy
- Local URLs are `http://127.0.0.1:5173/` for the prototype and `http://127.0.0.1:3001/` for the API
- Playwright smoke runs may leave `prototype/test-results/`; it can be removed after verification
- Deep Mode generation logs now include job-level and provider-level trace events, plus structured retry reasons with `name / code / details`

## Key files

- `docs/kaisensei_deep_mode_product_design.md` - Deep Mode product facts
- `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md` - Deep Mode implementation boundary
- `docs/superpowers/specs/2026-06-22-kaisensei-deepmode-integration-spec.md` - current backend/frontend integration decisions
- `docs/superpowers/plans/2026-06-22-kaisensei-deepmode-integration-plan.md` - current integration execution plan
- `prototype/src/App.jsx` - thin app wrapper
- `prototype/src/app/AppShell.jsx` - mode shell and routing
- `prototype/src/app/CameraEntry.jsx` - shared entry surface
- `prototype/src/quick/QuickModeApp.jsx` - Quick Mode entry
- `prototype/src/quick/lesson/` - Quick Mode lesson container and helpers
- `prototype/src/deep/DeepModeApp.jsx` - Deep Mode scaffold
- `prototype/src/deep/schema/deep-course-schema.js` - Deep Mode mock course data
- `prototype/src/deep/course/useDeepExerciseSequence.js` - Notice / Interpret sequencing
- `prototype/src/deep/course/useDeepInteractFlow.js` - Interact sequencing
- `api/src/shared/ai/` - shared AI provider base
- `api/src/deep/services/course-prompt.js` - Deep Mode generation prompt
- `api/src/deep/services/course-normalizer.js` - Deep Mode payload validation and normalization
- `api/src/contracts/lesson.js` - lesson contract shape
- `docs/handoff/README.md` - handoff index
- `docs/handoff/CHANGELOG.md` - append-only resume log

## Working rules

- Keep the product mobile-first
- Preserve Quick Mode while Deep Mode is being added
- Keep Deep Mode isolated so it can later become a standalone project
- Keep one `coreExpression` across each Deep Mode pack's baseExample and variations
- Keep Notice / Interpret ordering example-index-first
- Keep Interact ordering task-pack-first
- Treat Interact `systemReply` as a bridge sentence, not the learned Handle target
- Treat Step In as a continuous role-play conversation in the same scene
- Prefer durable facts over speculative implementation details

## Open decisions

- Whether Deep Mode should move from prompt-led chunk guidance to a true two-step generation protocol remains open if chunk quality still drifts
- Deep Mode remains the main active area; Quick Mode should only change when a shared shell fix is explicitly needed

## Main risks and tradeoffs

- Deep Mode can drift back into the old snapspeak-style structure if the flow helpers are not kept isolated
- Shared AI / contract changes can still affect both modes, so prompt and normalizer edits need a quick regression check
- Prompt-led chunk guidance is lighter weight but still depends on model behavior; if the model keeps producing odd chunks, a true two-step protocol may be needed
- If chunk-count or content-shape rules are loosened without tests, the UI can silently diverge from the contract again

## Cross-feature impact

- Shared contract or prompt changes may affect both Quick Mode and Deep Mode
- Deep Mode schema, sequencing, and normalizer changes should stay in the Deep feature domain unless a shared boundary is intentionally being refactored
- Prompt and normalizer changes in Deep Mode do not currently alter Quick Mode behavior, but shared AI tracing and contract boundaries still deserve a quick regression check
