# Kaisensei Deep Mode Staged Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert Deep Mode from one-shot full-lesson generation into a staged pipeline that returns `overview + notice` first, then serially fills `interpret`, `interact`, and `stepIn` while keeping the current Deep prompt quality and photo anchor intact.

**Architecture:** Keep the existing Deep Mode contract and prompt assets as the baseline, then add a separate staged-generation layer on top. The backend should own stage orchestration and frozen snapshots in `job.generation`; the frontend should consume partial snapshots immediately, reuse the current course shell, and only show waiting interstitials when the next stage is not ready. Quick Mode stays untouched.

**Tech Stack:** Node.js, Fastify, React, Vite, Playwright, node:test, existing Deep Mode prompt/normalizer/provider code.

---

## Baseline facts

- Current Deep Mode still waits for a full lesson before the job becomes `succeeded`.
- Current frontend only enters the course once `job.lesson` exists.
- Current Deep prompt and normalizer already encode the useful quality constraints we want to preserve.
- Current Deep page families already exist in the prototype, so the staged work should reuse those bodies and only add generation-aware gating.

## Locked decisions

- `overview + notice` is the first fixed submission unit.
- `interpret -> interact -> stepIn` stays serial.
- No persistence yet.
- No prewarm.
- No parallel generation of `interact` and `stepIn`.
- Waiting pages are interstitials, not new course phases.
- `DEEP_PHASE_ORDER` stays unchanged.
- Frontend should read `job.generation.frozenLesson` while the job is running, and fall back to `job.lesson` only after the full lesson succeeds.

---

## Task 1: Add a staged-generation envelope to the job contract

**Files:**
- Create: `api/src/deep/services/staged-generation/deep-generation-state.js`
- Modify: `api/src/stores/in-memory-job-store.js`
- Modify: `api/src/contracts/job.js`
- Modify: `api/src/routes/lesson-jobs.js`
- Modify: `api/test/lesson-jobs-route.test.js`
- Modify: `api/test/lesson-jobs.test.js`

**Plan:**
- [ ] Add a small shared helper for stage status constants and initial state, so the job store does not invent generation fields ad hoc.
- [ ] Persist `generation` on every job record with a stable shape that can hold `activeStage`, `stageStates`, `frozenLesson`, `errorStage`, and `errorMessage`.
- [ ] Keep the existing `status` enum unchanged so current callers do not break.
- [ ] Return `generation` from `GET /v1/lesson-jobs/:jobId` and from the create response when it is available.
- [ ] Add route coverage for queued, running, succeeded, and failed jobs so the generation envelope survives every transition.

**Validation:**
- [ ] `npm --prefix api test`

---

## Task 2: Split Deep backend generation into stage-specific helpers

**Files:**
- Create: `api/src/deep/services/staged-generation/deep-stage-context.js`
- Create: `api/src/deep/services/staged-generation/deep-stage-prompt.js`
- Create: `api/src/deep/services/staged-generation/deep-stage-normalizer.js`
- Create: `api/src/deep/services/staged-generation/deep-stage-orchestrator.js`
- Modify: `api/src/services/job-runner.js`
- Modify: `api/src/deep/services/course-prompt.js`
- Modify: `api/src/deep/services/course-normalizer.js`
- Modify: `api/src/deep/services/deep-gemini-api-provider.js`
- Modify: `api/src/deep/services/deep-codex-cli-provider.js`
- Modify: `api/test/job-runner.test.js`
- Modify: `api/test/deep-course-provider.test.js`
- Modify: `api/test/deep-course-normalizer.test.js`

**Plan:**
- [ ] Introduce a stage context builder that only forwards the allowed structured background fields for each later stage.
- [ ] Keep the existing prompt language and quality rules, but make the prompt builder stage-aware so each stage can reuse the current assets without getting the whole prompt rewritten.
- [ ] Add per-stage normalization entry points that reuse the existing normalizer helpers instead of creating a second validation system.
- [ ] Make the staged provider input explicit, with a `stage` identifier plus the frozen background payload for that stage, so the provider can generate only the requested subtree.
- [ ] Update the Deep job runner so `mode=deep` becomes a serial orchestrator: stage A completes first, then stage B, then stage C, then stage D.
- [ ] After each successful stage, write the frozen snapshot into `job.generation.frozenLesson` and advance `job.generation.activeStage`.
- [ ] On failure, keep the already frozen earlier stages intact and only retry the failed stage with frozen prior context.
- [ ] If the regenerated stage still repeats earlier frozen content, rewrite just that stage again before marking it ready.
- [ ] Keep the existing quick provider path unchanged.

**Validation:**
- [ ] `npm --prefix api test`

---

## Task 3: Teach the frontend to consume partial Deep snapshots

**Files:**
- Create: `prototype/src/deep/state/staged-generation/deep-generation-state.js`
- Create: `prototype/src/deep/state/staged-generation/useDeepGenerationSnapshot.js`
- Modify: `prototype/src/deep/schema/deep-course-schema.js`
- Modify: `prototype/src/deep/state/useDeepModeJobLifecycle.js`
- Modify: `prototype/src/deep/state/useDeepModeFlow.js`
- Modify: `prototype/src/deep/DeepModeApp.jsx`
- Modify: `prototype/src/deep/copy.js`

**Plan:**
- [ ] Extract the partial-snapshot selection logic so the UI can read one normalized snapshot whether the job is still running or has already succeeded.
- [ ] Let the view-model builder accept partial frozen lessons, not just the final full lesson, so `overview + notice` can render before later stages finish.
- [ ] Expose stage readiness from the job poller so the flow can tell the difference between “stage content available” and “full lesson complete”.
- [ ] While the job is running, prefer `job.generation.frozenLesson` for Deep Mode rendering and only fall back to `job.lesson` after the full lesson succeeds.
- [ ] Keep the current Deep shell and phase order, but let the screen layer render from the partial snapshot immediately once stage A is ready.
- [ ] Add the new waiting copy in one place so all modules use the same “正在生成下一阶段” language.

**Validation:**
- [ ] `npm --prefix prototype run build`
- [ ] `npm --prefix prototype run test:deepmode`

---

## Task 4: Add wait gates after milestone pages and auto-continue on readiness

**Files:**
- Create: `prototype/src/deep/course/DeepStageWaitingPage.jsx`
- Modify: `prototype/src/deep/course/notice/NoticeModule.jsx`
- Modify: `prototype/src/deep/course/interpret/InterpretModule.jsx`
- Modify: `prototype/src/deep/course/interact/InteractModule.jsx`
- Modify: `prototype/src/deep/course/step-in/StepInModule.jsx`
- Modify: `prototype/src/deep/course/DeepCourseShell.jsx`
- Modify: `prototype/tests/deepmode-job-polling.spec.mjs`

**Plan:**
- [ ] Insert a waiting interstitial after each module’s milestone page, but only when the next stage is still pending or running.
- [ ] Reuse the current course shell chrome for the waiting state so the user stays inside the lesson context.
- [ ] Keep the wait page extremely small: only the “正在生成下一阶段” message, plus retry and back-to-camera actions when the stage has failed.
- [ ] Make retry success resume automatically so the user does not need an extra tap once the failed stage becomes ready.
- [ ] Keep `overview + notice` usable even if later stages are still generating.
- [ ] Make sure the wait page disappears immediately once the next stage is ready, so users do not get stuck behind a stale interstitial.

**Validation:**
- [ ] Extend the Playwright poll test to mock staged responses: first only `overview + notice`, then `interpret`, then the later stages.
- [ ] Assert that the waiting page appears only before the next stage is ready and is skipped once the snapshot is available.
- [ ] `npm --prefix prototype run test:deepmode`

---

## Task 5: Preserve the current course prompt quality while minimizing drift

**Files:**
- Modify: `api/src/deep/services/course-prompt.js`
- Modify: `api/src/deep/services/course-normalizer.js`
- Modify: `api/src/deep/contracts/course.js`
- Modify: `api/src/deep/config/course.js`
- Modify: `api/test/deep-course-fixture.js`

**Plan:**
- [ ] Keep the existing Deep prompt wording and teaching tone as the default behavior.
- [ ] Only add the minimum stage-specific bridge text needed to explain which subset of the course the model is generating.
- [ ] Reuse the current whitelist and normalizer rules wherever possible; do not invent a second quality system for staged generation.
- [ ] If the stage split reveals a structural gap, patch the smallest possible contract or config surface instead of broad prompt rewrites.
- [ ] Keep the course contract aligned so the final assembled lesson still passes the current full-course normalizer.

**Validation:**
- [ ] `npm --prefix api test`

---

## Task 6: End-to-end verification and regression check

**Files:**
- None new; run against the files touched above.

**Plan:**
- [ ] Verify the API still returns the legacy deep lesson path once all stages are complete.
- [ ] Verify a staged deep job can show `overview + notice` before the final lesson exists.
- [ ] Verify the frontend can recover from a failed later stage with a stage-only retry and auto-continue after success.
- [ ] Verify Quick Mode is unchanged.
- [ ] Verify the prototype still builds cleanly after the staged-generation split.

**Validation:**
- [ ] `npm --prefix api test`
- [ ] `npm --prefix prototype run test:deepmode`
- [ ] `npm --prefix prototype run build`

---

## Self-check

- This plan covers the backend job envelope, the staged generator, the frontend snapshot consumer, the wait gates, and the regression tests.
- Quick Mode remains outside the plan.
- No task introduces persistence or parallel generation.
- The wait page is treated as a bridge, not a phase, so the existing `DEEP_PHASE_ORDER` stays intact.
