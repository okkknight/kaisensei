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

- The current codebase is still the Quick Mode prototype in `prototype/` with a real `api/`
- Camera mode, loading mode, and lesson mode all exist for Quick Mode
- Lesson mode currently follows the four-step flow: See, Learn, Build, Use
- Build and Use use chunk reordering with tolerant checking
- The AI calling底座已从 feature 逻辑里拆出到 `api/src/shared/ai/`，Quick Mode 继续保留自己的 prompt / normalizer / provider 实现
- The root `npm run dev` entry still starts both frontend and API for local work, so the browser only needs `http://127.0.0.1:5173/`
- Deep Mode is now being defined as a separate mode, but the actual code implementation has not landed yet
- Deep Mode must stay isolated from Quick Mode and should be easy to split into its own project later
- The Deep Mode design facts source is `docs/kaisensei_deep_mode_product_design.md`
- The Deep Mode implementation boundary source is `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md`

## Current latest task

- Task: finish the Quick/Deep isolation layer so Deep Mode can start without touching Quick Mode behavior
- Status: 已完成

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
- `api/src/shared/ai/` - shared AI calling base for provider adapters, workspace helpers, and unified errors
- `api/src/quick/services/codex-cli-provider.js` - Quick Mode lesson generation prompt and Codex CLI bridge
- `api/src/quick/services/lesson-normalizer.js` - Quick Mode API payload validation and normalization
- `api/src/contracts/lesson.js` - lesson contract shape
- `docs/handoff/README.md` - short reading index
- `docs/handoff/CHANGELOG.md` - append-only resume log

## Verified commands

- `npm run dev` from the repo root starts both local services
- `node --test test/lesson-jobs-route.test.js test/lesson-jobs.test.js`
- `npm run build` in `prototype/`
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
