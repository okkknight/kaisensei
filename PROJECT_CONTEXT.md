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
- The prompt and UI have been tightened so `See` and `Build` stay observer-focused
- `Use` now omits `questionChinese`
- The bottom navigation has been adjusted so Build and Use have clearer footer behavior

## Current latest task

- Task: remove `use.questionChinese`, align the Use page copy/UI, and refresh the handoff pack
- Status: 已执行待验收

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
- `prototype/src/App.jsx` - full mobile UI and lesson flow
- `prototype/src/styles.css` - responsive styling for camera and lesson pages
- `docs/image.png` - visual direction reference
- `docs/handoff/README.md` - short reading index
- `docs/handoff/CHANGELOG.md` - append-only resume log

## Verified commands

- `node --test test/lesson-jobs-route.test.js test/lesson-jobs.test.js`
- `npm run build` in `prototype/`
- `lsof -nP -iTCP:3001 -sTCP:LISTEN` confirmed the API is listening on `127.0.0.1:3001`

## Runtime notes

- The API runs separately from the Vite prototype and must be restarted to pick up prompt/contract changes
- The prototype uses Vite dev server hot reload for UI changes
- Current local URLs are `http://localhost:5175/` for the prototype and `http://127.0.0.1:3001/` for the API

## Working rules

- Keep the product mobile-first
- Preserve the `See -> Learn -> Build -> Use` flow
- Do not revive the old `Describe / Explain / Comment / Practice` structure
- Use step is a full question-and-answer reordering exercise, not a simple displayed sentence
- Prefer practical, high-frequency vocabulary and sentence patterns without sounding childish
- Keep docs compact and source-of-truth oriented
- Prefer durable facts over speculative implementation details

## Open decisions

- Whether `Use` should keep the current two-step footer behavior or be simplified further remains a UX judgment call
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
