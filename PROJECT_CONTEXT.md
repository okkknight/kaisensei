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

- The app is fully implemented in `prototype/` and backed by a real `api/`
- Camera mode, loading mode, and lesson mode all exist
- Lesson mode now includes the four-step flow: See, Learn, Build, Use
- The camera page uses a dark starfield fallback, real upload/capture controls, settings modal, and mode switch
- Build and Use use chunk reordering with tolerant checking
- Build re-segments the sentence naturally instead of reusing Learn chunks one-for-one
- Learn chunks are cut naturally around high-frequency phrases and fixed expressions rather than mechanically slicing the sentence
- Build is slightly more challenging than Learn and uses different, more sentence-like segmentation
- Use answers must naturally reuse 1-2 Learn chunks or collocations without copying the See sentence, so the reply stays connected but not repetitive
- Use questions must not mention the picture/photo/image/scene and should sound like a real conversational follow-up
- The prompt and UI have been tightened so `See` and `Build` stay observer-focused
- Use now behaves like a real conversation with a specific speaker and setting, not a generic photo prompt
- `Use` now omits `questionChinese`
- The bottom navigation has been adjusted so Build and Use have clearer footer behavior
- The repo root now has a single `npm run dev` entry that starts both frontend and API for local work, so the browser only needs `http://127.0.0.1:5173/`
- Switching Normal / Advanced only changes the next generated lesson; it does not regenerate the current photo's lesson
- Deep Mode V2 is planned as a separate mode entered from the existing camera-page mode switch, sharing only photo capture/upload/input capability and keeping its course system independent
- Deep Mode V2 keeps English TTS and question reading, but those are implemented inside the mode rather than treated as cross-mode shared shell
- The upcoming backend should stay mode-driven so Quick Mode and Deep Mode can share one job entry while producing separate schemas
- The prototype UI now has a real Deep Mode course flow in `prototype/src/DeepModeApp.jsx` that follows `docs/deepmodeimage.png` for visual language while rendering separate loading, overview, Notice, Interpret, Interact, Step In, and completion screens with shared reusable exercise/dialogue components
- `prototype/src/App.jsx` is now a thin wrapper over the Deep Mode course entry, and `prototype/src/styles.css` has been rewritten around the lavender/yellow mobile palette with a fixed bottom action bar and mobile-safe spacing

## Current latest task

- Task: split Deep Mode V2 into a dedicated spec and implementation plan
- Status: complete

## Architecture or state flow

Planned app states:

1. Camera Mode
2. Loading Mode
3. Lesson Mode

Lesson steps:

1. See
2. Learn
3. Build
4. Use

MVP behavior:

- user takes or uploads a photo
- app shows a loading state
- app generates or mocks a lesson
- user completes the four-step lesson
- user can switch between Normal and Advanced
- user can replay English audio with browser TTS
- Build and Use both use click-to-order chunk reordering
- Check logic ignores capitalization, punctuation, and spacing differences

## Key files

- `docs/kaisensei_PRD.md` - source of truth for product behavior
- `api/src/services/codex-cli-provider.js` - lesson generation prompt and Codex CLI bridge
- `api/src/services/lesson-normalizer.js` - API payload validation and normalization
- `api/src/contracts/lesson.js` - lesson contract shape
- `prototype/src/App.jsx` - thin wrapper that mounts the Deep Mode course app
- `prototype/src/DeepModeApp.jsx` - Deep Mode course flow, reusable exercise/dialogue components, persistence, and screen transitions
- `prototype/src/styles.css` - responsive lavender/yellow Deep Mode course styling
- `docs/deepmodeimage.png` - current Deep Mode visual reference
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
- Preserve the `See -> Learn -> Build -> Use` flow
- Do not revive the old `Describe / Explain / Comment / Practice` structure
- Use step is a full question-and-answer reordering exercise, not a simple displayed sentence
- Prefer practical, high-frequency vocabulary and sentence patterns without sounding childish
- Keep docs compact and source-of-truth oriented
- Prefer durable facts over speculative implementation details

## Open decisions

- The current handoff status is intentionally compact; do not expand it into a second parallel spec

## Main risks and tradeoffs

- Easy to drift back into the old snapspeak mode structure
- Easy to overbuild before the mobile lesson flow is stable
- Lesson content should stay short and practical, or the 1-minute promise will break
- If Build or Use scoring becomes too strict, the learning flow will feel exam-like instead of friendly

## Cross-feature impact

Changes to the lesson contract or prompt affect both the API generator and the prototype UI. Any future field removal or shape change should update:

- `api/src/contracts/lesson.js`
- `api/src/services/lesson-normalizer.js`
- `api/src/services/codex-cli-provider.js`
- `prototype/src/App.jsx`
- `docs/kaisensei_PRD.md`
