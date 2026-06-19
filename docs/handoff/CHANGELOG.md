# Changelog

Append-only resume log.

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

## 2026-06-17

- Initialized the project flow skeleton and compact handoff pack from the settled PRD
- Confirmed the repo had no app source files before initialization
- Established the reading order for future implementation work
- Synced `PROJECT_CONTEXT.md` with the PRD and aligned `AGENTS.md` behavior notes to match the final `Use` reordering flow and tolerant checking rules
- Added `docs/superpowers/specs/2026-06-17-kaisensei-api-rollout.md` and `docs/superpowers/plans/2026-06-17-kaisensei-api-implementation-plan.md` to capture the real backend rollout and task-by-task implementation path
- Implemented `api/` with Fastify health check, multipart lesson job creation, in-memory job store, async Codex CLI provider, lesson normalizer, and polling routes
- Replaced the prototype mock lesson flow with a real API-backed mobile lesson flow using photo upload/capture, loading/error states, Build/Use reordering, and browser TTS
- Added Vite proxying for `/v1`, removed the runtime mock lesson data file, and verified the full path with `node --test`, `vite build`, and a browser end-to-end run
