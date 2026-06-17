# Changelog

Append-only resume log.

## 2026-06-18

- Refined the lesson prompt so `See` and `Build` stay observer-focused while `Use` remains a user-response exercise
- Removed `use.questionChinese` from the lesson contract, normalizer, prompt, prototype UI, and PRD
- Tightened the mobile lesson layout so Build and Use use clearer footer behavior and the lesson screen scrolls correctly on small viewports
- Refreshed the handoff pack to reflect the current API-backed prototype instead of the initial scaffold state

## 2026-06-17

- Initialized the project flow skeleton and compact handoff pack from the settled PRD
- Confirmed the repo had no app source files before initialization
- Established the reading order for future implementation work
- Synced `PROJECT_CONTEXT.md` with the PRD and aligned `AGENTS.md` behavior notes to match the final `Use` reordering flow and tolerant checking rules
- Added `docs/superpowers/specs/2026-06-17-kaisensei-api-rollout.md` and `docs/superpowers/plans/2026-06-17-kaisensei-api-implementation-plan.md` to capture the real backend rollout and task-by-task implementation path
- Implemented `api/` with Fastify health check, multipart lesson job creation, in-memory job store, async Codex CLI provider, lesson normalizer, and polling routes
- Replaced the prototype mock lesson flow with a real API-backed mobile lesson flow using photo upload/capture, loading/error states, Build/Use reordering, and browser TTS
- Added Vite proxying for `/v1`, removed the runtime mock lesson data file, and verified the full path with `node --test`, `vite build`, and a browser end-to-end run
