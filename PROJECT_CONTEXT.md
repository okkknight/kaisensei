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

- Design is settled in `docs/kaisensei_PRD.md` and `AGENTS.md` has been aligned to match it
- Visual reference is in `docs/image.png`
- No app source has been created yet
- No implementation task beyond this flow initialization has started

## Current latest task

- Task: initialize flow skeleton and handoff pack
- Status: completed in this turn

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
- Check logic should be tolerant of capitalization, punctuation, and spacing differences

## Key files

- `docs/kaisensei_PRD.md` - source of truth for product behavior
- `docs/image.png` - visual direction reference
- `AGENTS.md` - project instructions and product constraints
- `PROJECT_CONTEXT.md` - this summary for future agents
- `docs/handoff/README.md` - short reading index
- `docs/handoff/CHANGELOG.md` - append-only resume log
- `flow/task/TASK_TEMPLATE.md` - task card skeleton
- `flow/issue/ISSUE_TEMPLATE.md` - issue skeleton
- `flow/dev_report/DEV_REPORT_TEMPLATE.md` - development report skeleton

## Verified commands

- `find . -maxdepth 3 ...` showed only `AGENTS.md` and `docs/` before initialization
- `sed -n '1,260p' docs/kaisensei_PRD.md` confirmed the PRD content and MVP scope
- `file docs/image.png` confirmed the reference image exists and is a 1536x1024 PNG

## Runtime notes

- The repo was still an empty scaffold before this init flow pass
- There was no `package.json` or source tree present when checked
- The current focus is documentation and execution scaffolding, not app code

## Working rules

- Keep the product mobile-first
- Preserve the `See -> Learn -> Build -> Use` flow
- Do not revive the old `Describe / Explain / Comment / Practice` structure
- Use step is a full question-and-answer reordering exercise, not a simple displayed sentence
- Prefer practical, high-frequency vocabulary and sentence patterns without sounding childish
- Keep docs compact and source-of-truth oriented
- Prefer durable facts over speculative implementation details

## Open decisions

- None blocking the flow setup
- Implementation stack is guided by the PRD, but no code-level decision is locked in yet

## Main risks and tradeoffs

- Easy to drift back into the old snapspeak mode structure
- Easy to overbuild before the mobile lesson flow exists
- Lesson content should stay short and practical, or the 1-minute promise will break
- If Build or Use scoring becomes too strict, the learning flow will feel exam-like instead of friendly

## Cross-feature impact

This product is currently isolated to its own repo scope. No cross-feature dependencies are known yet.
