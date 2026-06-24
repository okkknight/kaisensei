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

- Deep Mode staged generation is now the active direction: `overview + notice` is the fixed first playable unit, later stages run serially with frozen prior context, and waiting pages only appear when the next stage is not ready
- The Deep frontend now consumes partial frozen snapshots while the job is still running, so `overview + notice` can render before later stages complete
- The Deep frontend now shows a tiny waiting page after module milestones when the next stage is still pending or failed, and a staged retry route can resume from the failed stage with frozen background
- Quick Mode remains the implemented lesson flow in `prototype/` and should stay unchanged unless explicitly requested
- Deep Mode is now split into its own feature domain with separate overview, Notice, Interpret, Interact, Step In, and completion surfaces
- Deep Mode pack content now keeps one `coreExpression` across baseExample and variations
- Deep Mode Notice / Interpret playback is locked to example-index-first ordering
- Deep Mode Interact playback is locked to task-pack-first ordering
- Interact dialogue practice now plays as a continuous chat flow: a successful Need answer becomes an in-scene user bubble, a short typing bridge appears, then the system reply lands before Handle continues the same conversation
- Step In dialogue now uses the same live-turn playback pattern so successful replies enter the dialogue flow directly instead of showing a separate success card
- The Deep Mode generator prompt has been rebuilt around a senior-English-teacher role, with `coreExpression` defined as a learnable high-frequency phrase, collocation, or practical expression rather than a sentence
- Deep Mode generation now asks the model to learn from one photo through different expression angles on the same scene, instead of slicing one template across every pack
- Deep Mode now mirrors Quick Mode's Normal / Advanced tuning, with Normal pushing for clearer and simpler phrasing and Advanced pushing for a more polished but still practical expression style
- Deep Mode Interact still uses the current configured shape of 2 task packs, each with Need and Handle, and that count is treated as configurable rather than a hard design limit
- Deep Mode normalizer no longer hard-rejects chunk counts for Understand / Build / Quick Response; it still checks structure, answer coverage, and required arrays
- Deep Mode normalizer and JSON structure were not changed in this prompt pass, so the contract remains stable while generation quality improves
- Mobile lesson screens now keep their bottom action bars floating above the viewport on small screens, so long lesson pages do not trap the next-step buttons below the scroll area
- The current Deep Mode prompt wording now frames Interact as one learner-system-learner exchange in the same scene and frames Step In as a natural role-play conversation rather than a vocabulary review list
- The latest prompt wording tweak keeps the Step In system line free to do short scene-setting when needed, and softens the `sourceModule` wording so it reads like a tag instead of a strict canonical requirement

## Current latest task

- Task: Preserve the current course prompt quality while minimizing drift
- Status: developed, pending independent review

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
- `cd prototype && VITE_KAISENSEI_BASE_PATH=/kaisensei/ VITE_KAISENSEI_API_BASE=/kaisensei/api npm run build`
- `rsync -a --delete prototype/dist/ root@89.208.242.44:/opt/boringmax/site/kaisensei/`
- `npm run dev` from the repo root starts the local API and prototype together
- `lsof -nP -iTCP:3001 -sTCP:LISTEN` confirmed the API is listening on `127.0.0.1:3001`
- Latest API verification after the Deep Mode prompt quality rebuild: `npm --prefix api test`
- Latest prompt wording verification after the Interact / Step In rewrite: `node --test api/test/deep-course-provider.test.js`
- Latest VPS sync for the Understand wording cleanup: `rsync -a api/src/deep/services/course-prompt.js root@89.208.242.44:/opt/boringmax/kaisensei/api/src/deep/services/course-prompt.js && ssh root@89.208.242.44 'systemctl restart kaisensei.service'`
- Latest frontend deployment verification: `curl -fsS https://boringmax.com/kaisensei/` and `curl -fsS https://boringmax.com/kaisensei/assets/index-D6csJCFz.css`

## Runtime notes

- The API runs separately from the Vite prototype and must be restarted to pick up backend changes
- The root `npm run dev` script launches both services together and keeps local requests same-origin through the Vite `/v1` proxy
- Local URLs are `http://127.0.0.1:5173/` for the prototype and `http://127.0.0.1:3001/` for the API
- Playwright smoke runs may leave `prototype/test-results/`; it can be removed after verification
- Deep Mode generation logs now include job-level and provider-level trace events, plus structured retry reasons with `name / code / details`
- VPS prompt changes require syncing the API source under `/opt/boringmax/kaisensei/api` and restarting `kaisensei.service`; static `prototype/dist/` sync alone is not enough for backend prompt edits
- Mobile footer layout changes need a production build and `prototype/dist/` sync, because the live VPS serves the built static assets
- The latest Deep Mode Understand wording cleanup has been synced to the VPS API source and `kaisensei.service` was restarted; if the generated output changes again, re-run the API test and restart the service after syncing before calling it done

## Key files

- `docs/kaisensei_deep_mode_product_design.md` - Deep Mode product facts
- `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-spec.md` - Deep Mode implementation boundary
- `docs/superpowers/specs/2026-06-24-kaisensei-deepmode-staged-generation-spec.md` - Deep Mode staged generation strategy
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
- Treat Interact `systemReply` as a bridge line that advances the scene and sets up the learner's Handle reply
- Treat Step In as a continuous role-play conversation in the same scene
- Keep Deep Mode prompt and its regression assertions in sync whenever generation rules change
- Keep generation-quality changes separate from structure or schema changes unless the user explicitly asks for both
- Keep Interact / Step In wording focused on a natural role-play exchange first, and only then refine the bridge-line or source-tag details
- For backend prompt edits, verify the API test suite and then sync the API source to the VPS
- For Deep Mode level tuning, keep Normal and Advanced distinct in the prompt itself and verify the prompt/test pair after edits
- Prefer durable facts over speculative implementation details

## Open decisions

- Whether Deep Mode should eventually move from prompt-only generation to a two-step generation protocol remains open if quality still drifts
- Deep Mode remains the main active area; Quick Mode should only change when a shared shell fix is explicitly needed

## Main risks and tradeoffs

- Deep Mode can drift back into the old snapspeak-style structure if the flow helpers are not kept isolated
- Shared AI / contract changes can still affect both modes, so prompt and normalizer edits need a quick regression check
- Prompt-only quality improvements are lightweight, but they still depend on model behavior; if the output keeps drifting, a stronger generation pipeline may be needed
- If prompt guidance changes without regression tests, the UI can silently diverge from the contract again

## Cross-feature impact

- Shared contract or prompt changes may affect both Quick Mode and Deep Mode
- Deep Mode schema, sequencing, and normalizer changes should stay in the Deep feature domain unless a shared boundary is intentionally being refactored
- This prompt rebuild only changes Deep Mode generation quality, but shared AI tracing and contract boundaries still deserve a quick regression check whenever the prompt changes
- Deep Mode level tuning affects only generation style, not the schema or the lesson-step structure
- The Interact / Step In dialogue-chain rewrite affects Deep Mode task-pack content and chat-style playback feel, but it does not change the schema or the current task counts
