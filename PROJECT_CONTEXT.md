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

## Current product state

- The current codebase still includes the Quick Mode prototype in `prototype/` with a real `api/`
- Camera mode, loading mode, and lesson mode all exist for Quick Mode
- Lesson mode currently follows the four-step flow: See, Learn, Build, Use
- Build and Use use chunk reordering with tolerant checking
- The AI calling底座已从 feature 逻辑里拆出到 `api/src/shared/ai/`，Quick Mode 继续保留自己的 prompt / normalizer / provider 实现
- The root `npm run dev` entry still starts both frontend and API for local work, so the browser only needs `http://127.0.0.1:5173/`
- The frontend has a thin `AppShell`, a shared `CameraEntry`, a Quick entry that can accept an initial captured file, and a Deep scaffold with overview / module shells plus a Deep flow hook and completion screen
- Quick Mode has already been further split into a lesson container plus quick-owned step, feedback, loading, error, and empty-state files
- Deep Mode is now being defined as a separate mode, and the codebase is being split so it can grow without touching Quick Mode behavior
- Deep Mode packs now keep one core expression across baseExample and variations, and the mock / backend alignment work has been applied across Notice, Interpret, and Interact
- Interact dialogue practice now treats `systemReply` as a bridge sentence and keeps the learned Handle expression for the user's reply, instead of exposing the answer early
- The Deep Mode design facts source is `docs/kaisensei_deep_mode_product_design.md`
- The Deep Mode implementation boundary source is `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md`
- The Deep Mode architecture baseline is being refined before feature work lands, so `deep/` should stay isolated from `quick/`

## Current scan notes before the next split

- Deep Mode is not a simple alternate lesson template; it has its own overview page plus Notice, Interpret, Interact, Step In, and completion flow
- Notice and Interpret reuse the same three-step micro-exercise skeleton, but the content generation rules are different
- Interact is task-pack based and includes a short dialogue loop, not just static chunk reordering
- Step In reuses the dialogue flow again, but only with expressions already earned in earlier modules
- Deep Mode needs its own copy, storage namespace, and course state boundaries so it can later become a standalone project
- The next structural split should therefore center on mode entry, shell routing, and clear mode-owned feature domains, not on trying to share lesson-level components between Quick and Deep
- Deep Mode is currently in an architecture-first phase: the flow hook and completion page have been separated, but Notice / Interpret / Interact / Step In business logic is still pending

## Current latest task

- Task: align Deep Mode Interact dialogue flow so `systemReply` becomes a bridge sentence and the learned Handle expression stays reserved for the user's reply
- Status: 已执行待验收

## Architecture or state flow

Current implemented Quick Mode states:

1. Camera Mode
2. Loading Mode
3. Lesson Mode

Current implemented lesson steps:

1. See
2. Learn
3. Build
4. Use

Deep Mode planned states:

1. Camera entry with mode selection
2. Loading / generation
3. Overview
4. Notice
5. Interpret
6. Interact
7. Step In
8. Completion

## Key files

- `docs/kaisensei_PRD.md` - product boundary and Deep Mode V2 confirmation
- `docs/kaisensei_deep_mode_product_design.md` - detailed Deep Mode product design
- `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md` - current Deep Mode implementation spec
- `docs/superpowers/plans/2026-06-19-kaisensei-deepmode-structure-isolation-plan.md` - next execution plan for the structure split
- `prototype/src/App.jsx` - current Quick Mode prototype shell
- `prototype/src/app/AppShell.jsx` - thin shell that routes between camera, Quick Mode, and Deep Mode
- `prototype/src/app/CameraEntry.jsx` - shared first-screen camera and mode selector
- `prototype/src/quick/QuickModeApp.jsx` - current Quick Mode entry that can start from a captured file
- `prototype/src/quick/lesson/` - quick-owned lesson container, step views, and state/effect helpers
- `prototype/src/deep/DeepModeApp.jsx` - Deep Mode scaffold with overview and module shells
- `prototype/src/deep/schema/deep-course-schema.js` - Deep Mode mock course data and pack-level core expression alignment
- `prototype/src/deep/course/useDeepExerciseSequence.js` - Notice / Interpret page sequencing
- `prototype/src/deep/course/useDeepInteractFlow.js` - Interact / Step In page sequencing
- `prototype/src/deep/course/deep-flow-utils.js` - Deep Mode flow helpers
- `prototype/src/deep/course/DeepDialogueFlowPage.jsx` - Interact dialogue timeline and answer layout
- `api/src/shared/ai/` - shared AI calling base for provider adapters, workspace helpers, and unified errors
- `api/src/deep/services/course-prompt.js` - Deep Mode generation prompt and rules
- `api/src/deep/services/course-normalizer.js` - Deep Mode payload validation and normalization
- `api/src/quick/services/codex-cli-provider.js` - Quick Mode lesson generation prompt and Codex CLI bridge
- `api/src/quick/services/lesson-normalizer.js` - Quick Mode API payload validation and normalization
- `api/src/contracts/lesson.js` - lesson contract shape
- `docs/handoff/README.md` - short reading index
- `docs/handoff/CHANGELOG.md` - append-only resume log

## Verified commands

- `npm run dev` from the repo root starts both local services
- `node --test test/lesson-jobs-route.test.js test/lesson-jobs.test.js`
- `npm run build` in `prototype/`
- `npm --prefix prototype run build`
- `npm --prefix api test`
- `lsof -nP -iTCP:3001 -sTCP:LISTEN` confirmed the API is listening on `127.0.0.1:3001`

## Runtime notes

- The API runs separately from the Vite prototype and must be restarted to pick up prompt/contract changes
- The root `npm run dev` script launches both services together and keeps local requests same-origin through the Vite `/v1` proxy
- The prototype uses Vite dev server hot reload for UI changes
- Current local URLs are `http://127.0.0.1:5173/` for the prototype and `http://127.0.0.1:3001/` for the API

## Working rules

- Keep the product mobile-first
- Preserve the current Quick Mode flow while Deep Mode is being added
- Do not let Deep Mode changes alter existing Quick Mode behavior
- Keep Deep Mode pack content on one core expression per pack, with baseExample and variations sharing that same value
- Treat Interact `systemReply` as a bridge sentence, not as the learned Handle target
- Treat Step In as a continuous role-play conversation in the same scene, with the system speaking like one consistent in-scene character instead of a quiz master
- Use the Deep Mode spec as the source of truth for the new mode
- Prefer isolated feature boundaries so Deep Mode can become a standalone project later
- Keep docs compact and source-of-truth oriented
- Prefer durable facts over speculative implementation details

## Open decisions

- The next work is Deep Mode implementation on top of the isolated structure; Quick Mode should stay untouched unless a cross-mode shell fix is explicitly needed

## Main risks and tradeoffs

- Easy to drift back into the old snapspeak mode structure
- Easy to overcouple Deep Mode with Quick Mode if the entry boundary is not kept thin
- Deep Mode should not inherit Quick Mode implementation shortcuts that make later extraction harder
- Lesson content should stay short and practical, or the 1-minute promise will break

## Cross-feature impact

Changes to the shared lesson contract or prompt still affect Quick Mode and any future shared API path. Deep Mode-specific work should stay in its own feature domain and avoid changing Quick Mode unless explicitly required.
