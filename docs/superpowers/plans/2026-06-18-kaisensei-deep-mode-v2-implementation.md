# Kaisensei Deep Mode V2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. This plan is intentionally phased because Deep Mode is a separate product line and must ship end-to-end, not as a partial shell.

**Goal:** Add a fully working Deep Mode to kaisensei while preserving the current Quick Mode. Deep Mode must enter from the existing camera-page mode switch, share only generic shell capabilities, and implement the complete `See it -> Read it -> Need it -> Say it -> Handle it -> Scene Wrap` flow with real image generation.

**Architecture:** Keep Quick Mode stable. Introduce separate deep contracts, deep prompt/normalizer/provider flow, and a dedicated deep UI subtree under the existing prototype shell. Reuse only the generic capture/loading/TTS/button primitives where that does not leak course logic across modes.

**Tech Stack:** Existing Node.js + Fastify API, React + Vite prototype, browser `speechSynthesis`, `node:test`, current lesson/job infrastructure, new deep-mode contract and UI modules.

---

## Phase 1: Lock the deep-mode contract and generation pipeline

**Outcome:** The backend knows how to ask for Deep Mode output, validate it strictly, and reject malformed results without weakening the contract.

**Files:**
- Create: `api/src/contracts/deep-lesson.js`
- Create: `api/src/services/deep-lesson-prompt.js`
- Create: `api/src/services/deep-lesson-normalizer.js`
- Create: `api/src/services/deep-course-provider.js`
- Modify: `api/src/app.js`
- Modify: `api/src/services/job-runner.js` or add deep-specific runner wiring if needed
- Create: `api/test/deep-lesson-normalizer.test.js`
- Create: `api/test/deep-course-provider.test.js`

**Exit criteria:**
- Deep Mode has a dedicated JSON contract.
- The backend can validate `mode: "deep"` output strictly.
- `short_answer` uses tolerant text matching only.
- Broken output fails loudly instead of silently repairing itself.

**Dependency notes:**
- This phase must be complete before the frontend deep UI can rely on final schema names.
- The current Quick Mode implementation must remain untouched except for any shared plumbing that is genuinely generic.

---

## Phase 2: Add the deep-mode switch and shared shell boundaries in the prototype

**Outcome:** The existing camera page can switch between Quick Mode and Deep Mode without creating a new home screen.

**Files:**
- Modify: `prototype/src/App.jsx`
- Modify: `prototype/src/styles.css`
- Create or modify shared shell helpers only if they do not contain course-specific logic

**Exit criteria:**
- Mode switch exists in the current camera page.
- Switching modes does not break Quick Mode.
- Shared shell elements remain reusable but course logic stays isolated.

**Dependency notes:**
- This phase depends on Phase 1 schema decisions so the camera page can route into the correct lesson mode.
- The switch should not force a redesign of the existing capture flow.

---

## Phase 3: Build the Deep Lesson UI subtree

**Outcome:** Deep Mode has its own lesson page structure for the six-module flow, including text-only learning interactions.

**Files:**
- Create: `prototype/src/deep/*`
- Modify: `prototype/src/App.jsx`
- Modify: `prototype/src/styles.css`

**Exit criteria:**
- Deep Mode renders its own module sequence.
- The six-module flow is visible and navigable.
- `TTS`/朗读 buttons are present for supported English content.
- No speech input UI exists.

**Dependency notes:**
- Reuse only generic shells and shared controls.
- Do not leak Quick Mode step names or step logic into Deep Mode.

---

## Phase 4: Implement module interactions and tolerant answer checking

**Outcome:** Each Deep Mode module supports the required text interactions, and `short_answer` passes with tolerant matching.

**Files:**
- Modify/Create deep UI components under `prototype/src/deep/*`
- Modify shared checking helpers only where the behavior is mode-agnostic

**Exit criteria:**
- `fill_blank`, `word_order`, `multiple_choice`, and `short_answer` all work.
- `short_answer` ignores capitalization, punctuation, and extra spaces.
- `Scene Wrap` requires reuse across at least 3 modules.
- Feedback remains friendly and non-exam-like.

**Dependency notes:**
- This phase depends on the deep UI subtree existing.
- Validation behavior must match the backend contract exactly.

---

## Phase 5: Wire the end-to-end flow to real images

**Outcome:** A user can take or upload a real photo, enter Deep Mode, wait for generation, and complete the full module flow.

**Files:**
- Modify: `prototype/src/App.jsx`
- Modify: `prototype/src/lib/lesson-api.js` or add deep equivalents
- Modify: `prototype/src/styles.css`
- Modify: `api/src/routes/lesson-jobs.js` if the deep route is separate
- Modify: `docs/KAISENSEI_VPS_RUNBOOK.md` only if deployment or verification steps change

**Exit criteria:**
- Real image upload/capture works end-to-end for Deep Mode.
- Loading and failure states behave correctly.
- No mock lesson fallback is used for Deep Mode.
- The generated deep lesson can be completed end-to-end on the browser.

**Dependency notes:**
- This phase depends on the deep backend and deep UI being complete.
- If a separate route is needed, keep Quick Mode’s route behavior stable.

---

## Phase 6: QA, polish, and handoff sync

**Outcome:** Deep Mode is verified on-device and the docs reflect the shipped boundary.

**Files:**
- Modify: `docs/handoff/CHANGELOG.md`
- Modify: `PROJECT_CONTEXT.md`
- Optional: update `docs/KAISENSEI_VPS_RUNBOOK.md` if verification steps need a deep-mode section

**Exit criteria:**
- The deep-mode flow is browser-verified on a mobile viewport.
- The docs match the shipped implementation.
- Any remaining tradeoffs are explicit and documented.

**Dependency notes:**
- This phase must be last.
- Do not loosen the contract just to make QA green.

