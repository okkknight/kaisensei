# Kaisensei Deep Mode Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the current Deep Mode frontend to the current Deep Mode backend job API with a strict shared contract, backend-side field normalization, and frontend job polling, so the existing Deep Mode pages can run against real backend output without changing Quick Mode behavior.

**Architecture:** Keep the existing single `api/` service and the current `prototype/src/deep/` domain. Treat the backend lesson JSON as the source of truth, keep prompt/normalizer/contract rules on the backend, and let the frontend adapt through a polling-based job lifecycle that feeds the existing Deep Mode view model.

**Tech Stack:** Node.js, Fastify, `node:test`, React 19, Vite, Playwright, the existing `prototype/src/lib/lesson-api.js` wrapper, and the current Deep Mode hooks and page family components.

---

## Source Hierarchy

When execution details conflict, use this order:

1. `docs/kaisensei_deep_mode_product_design.md`
2. `docs/superpowers/specs/2026-06-22-kaisensei-deepmode-integration-spec.md`
3. `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-backend-spec.md`
4. `docs/superpowers/specs/2026-06-19-kaisensei-deepmode-frontend-spec.md`
5. Current `api/` and `prototype/` implementation facts
6. Inference

---

## File Structure

### Backend contract and validation

- Modify: `api/src/deep/contracts/course.js`
- Modify: `api/src/deep/services/course-prompt.js`
- Modify: `api/src/deep/services/course-normalizer.js`
- Modify: `api/test/deep-course-normalizer.test.js`
- Modify: `api/test/deep-course-provider.test.js`

### Frontend polling and Deep Mode lifecycle

- Modify: `prototype/src/deep/state/useDeepModeFlow.js`
- Create: `prototype/src/deep/state/useDeepModeJobLifecycle.js`
- Modify: `prototype/src/deep/DeepModeApp.jsx` only if the lifecycle shape changes
- Modify: `prototype/src/lib/lesson-api.js` only if the polling helper needs a Deep-specific wrapper

### Browser verification and release wiring

- Create: `prototype/playwright.config.mjs`
- Create: `prototype/tests/deepmode-job-polling.spec.mjs`
- Modify: `prototype/package.json`
- Modify: `docs/handoff/README.md`
- Modify: `docs/handoff/CHANGELOG.md`

---

## Task 1: Close the Deep Mode backend contract gaps

**Files:**
- Modify: `api/src/deep/contracts/course.js`
- Modify: `api/src/deep/services/course-prompt.js`
- Modify: `api/src/deep/services/course-normalizer.js`
- Modify: `api/test/deep-course-normalizer.test.js`
- Modify: `api/test/deep-course-provider.test.js`

- [ ] **Step 1: Write the failing tests**

Add tests that prove the backend contract now covers the current frontend expectations:

```js
import { buildValidDeepCoursePayload } from "./deep-course-fixture.js";

test("normalizeDeepCoursePayload keeps overview start prompt and task scene copy", () => {
  const payload = buildValidDeepCoursePayload();
  payload.overview.startPromptChinese = "点击开始这次学习之旅";
  payload.modules.interact.taskPacks[0].scenePromptChinese = "你正在桌边想休息一下。";
  payload.modules.stepIn.dialogue.turns[1].sourceModule = "notice";

  const normalized = normalizeDeepCoursePayload(payload);
  assert.equal(normalized.overview.startPromptChinese, "点击开始这次学习之旅");
  assert.equal(normalized.modules.interact.taskPacks[0].scenePromptChinese, "你正在桌边想休息一下。");
  assert.equal(normalized.modules.stepIn.dialogue.turns[1].sourceModule, "notice");
});
```

Add a second test that proves `course-prompt.js` now asks for the same contract details and the backend keeps `sourceModule` / `scenePromptChinese` in scope:

```js
test("buildDeepCoursePrompt asks for scenePromptChinese and canonical sourceModule values", () => {
  const prompt = buildDeepCoursePrompt({ level: "Normal" });
  assert.match(prompt, /scenePromptChinese/);
  assert.match(prompt, /sourceModule/);
  assert.match(prompt, /notice/);
  assert.match(prompt, /interact_need/);
  assert.match(prompt, /interact_handle/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run:

```bash
cd api
node --test test/deep-course-normalizer.test.js test/deep-course-provider.test.js
```

Expected: fail until the contract, prompt, and normalizer accept the new field boundaries and source-module mapping.

- [ ] **Step 3: Write the minimal backend implementation**

Implement the backend changes in this order:

1. Expand `api/src/deep/contracts/course.js` so the nested Deep Mode shape is explicit enough for the frontend to consume without guessing.
2. Update `api/src/deep/services/course-prompt.js` so the prompt asks for `scenePromptChinese` on Interact guide data and treats `sourceModule` as a canonical frontend-facing token.
3. Update `api/src/deep/services/course-normalizer.js` so:
   - `overview.startPromptChinese` is retained as a backend-owned field
   - Interact task packs retain `scenePromptChinese`
   - Step In user turns map source-module aliases into the canonical values the frontend expects
   - the backend continues to reject malformed nested shapes instead of guessing

Use the following canonical mapping for Step In source modules:

```js
const sourceModuleMap = {
  notice: "notice",
  interpret: "interpret",
  need: "interact_need",
  interact_need: "interact_need",
  handle: "interact_handle",
  interact_handle: "interact_handle",
};
```

- [ ] **Step 4: Run the tests to verify they pass**

Run:

```bash
cd api
node --test test/deep-course-normalizer.test.js test/deep-course-provider.test.js
```

Expected: pass, with the new contract fields accepted and the source-module mapping preserved in normalized output.

- [ ] **Step 5: Commit**

```bash
git add api/src/deep/contracts/course.js api/src/deep/services/course-prompt.js api/src/deep/services/course-normalizer.js api/test/deep-course-normalizer.test.js api/test/deep-course-provider.test.js
git commit -m "feat: harden deep mode backend contract"
```

---

## Task 2: Switch the Deep Mode frontend from mock lessons to job polling

**Files:**
- Create: `prototype/src/deep/state/useDeepModeJobLifecycle.js`
- Modify: `prototype/src/deep/state/useDeepModeFlow.js`
- Modify: `prototype/src/deep/DeepModeApp.jsx` only if the lifecycle return shape changes
- Modify: `prototype/package.json`
- Create: `prototype/playwright.config.mjs`
- Create: `prototype/tests/deepmode-job-polling.spec.mjs`

- [ ] **Step 1: Write the failing browser test**

Add a Playwright smoke test that proves the Deep Mode entry actually waits for `job.lesson` instead of rendering the local mock lesson:

```js
import { test, expect } from "@playwright/test";

test("deep mode polls lesson jobs before rendering the overview", async ({ page }) => {
  let pollCount = 0;

  await page.route("**/v1/lesson-jobs", async (route) => {
    await route.fulfill({
      status: 202,
      contentType: "application/json",
      body: JSON.stringify({ jobId: "job_123", status: "queued" }),
    });
  });

  await page.route("**/v1/lesson-jobs/job_123", async (route) => {
    pollCount += 1;
    const body =
      pollCount < 2
        ? { jobId: "job_123", status: "running", lesson: null, error: null }
        : {
            jobId: "job_123",
            status: "succeeded",
            lesson: {
              mode: "deep",
              level: "normal",
              overview: {
                keywords: ["coffee", "table", "laptop"],
                sceneDescriptionChinese: "安静的桌面工作场景",
                startPromptChinese: "点击开始这次学习之旅",
              },
              modules: {
                notice: { title: "Notice", goal: "Describe what is visible in the photo.", expressionPacks: [] },
                interpret: { title: "Interpret", goal: "Infer what may be happening in the scene.", expressionPacks: [] },
                interact: { title: "Interact", goal: "Express a need and respond naturally.", taskPacks: [] },
                stepIn: { title: "Step In", goal: "Complete one full scene conversation.", dialogue: {} },
              },
            },
            error: null,
          };

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(body),
    });
  });

  await page.goto("/");
  await page.getByRole("button", { name: "深度" }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "deep-mode.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
  });

  await expect(page.getByText("coffee · table · laptop")).toBeVisible();
  await expect.poll(() => pollCount).toBeGreaterThan(1);
});
```

Add a minimal Playwright config that points at the Vite dev server and uses the local app as the base URL:

```js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
  },
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
cd prototype
npx playwright test tests/deepmode-job-polling.spec.mjs
```

Expected: fail because `useDeepModeFlow` still instantiates a local mock lesson instead of hydrating from `POST /v1/lesson-jobs` + `GET /v1/lesson-jobs/:jobId`.

- [ ] **Step 3: Write the minimal frontend implementation**

Implement the Deep Mode lifecycle in a new hook modeled after the existing Quick Mode job lifecycle:

1. Create `prototype/src/deep/state/useDeepModeJobLifecycle.js` to:
   - call `createLessonJob({ image, level, traceId, signal })`
   - poll `getLessonJob(jobId, signal)` until `status === "succeeded"` or `status === "failed"`
   - surface the returned `job.lesson` into the Deep Mode flow
   - preserve the loading / error states already used by Deep Mode
2. Update `prototype/src/deep/state/useDeepModeFlow.js` to compose the new lifecycle hook instead of calling `createDeepCourseLesson(initialLevel)` directly.
3. Keep `DeepModeApp` and the page components unchanged unless the hook return shape forces a small adapter.

Do not add new Deep Mode lesson mock data to the runtime path once the polling lifecycle is in place; the runtime path must use the backend lesson payload.

- [ ] **Step 4: Run the browser and build checks to verify they pass**

Run:

```bash
cd prototype
npm run build
npx playwright test tests/deepmode-job-polling.spec.mjs
```

Expected:

- Vite build passes
- Playwright confirms the frontend polls until `job.lesson` exists
- Deep Mode starts from backend lesson data rather than the local mock lesson

- [ ] **Step 5: Commit**

```bash
git add prototype/src/deep/state/useDeepModeJobLifecycle.js prototype/src/deep/state/useDeepModeFlow.js prototype/package.json prototype/playwright.config.mjs prototype/tests/deepmode-job-polling.spec.mjs
git commit -m "feat: connect deep mode to lesson polling"
```

---

## Task 3: Sync handoff docs and run the full integration verification loop

**Files:**
- Modify: `docs/handoff/README.md`
- Modify: `docs/handoff/CHANGELOG.md`

- [ ] **Step 1: Write the doc update**

Add the new integration plan to the handoff reading order and record the agreed联调 decisions in the changelog:

```md
- `docs/superpowers/specs/2026-06-22-kaisensei-deepmode-integration-spec.md`
- `docs/superpowers/plans/2026-06-22-kaisensei-deepmode-integration-plan.md`
```

Record the six confirmed decisions explicitly:

- `overview.startPromptChinese` stays backend-only for now
- Interact must expose `scenePromptChinese`
- Step In source modules are normalized on the backend
- Understand highlighting uses `pack.coreExpression`
- Deep contract must expose the nested structure the frontend consumes
- Frontend must use job polling

- [ ] **Step 2: Run the full verification loop**

Run:

```bash
cd api
npm test

cd ../prototype
npm run build
npx playwright test tests/deepmode-job-polling.spec.mjs
```

Expected:

- API tests pass, including deep contract and provider tests
- Prototype builds cleanly
- Browser smoke test passes against the real API contract

- [ ] **Step 3: Manually verify in the browser**

Open the app in the in-app browser and confirm these pages now consume backend data without any frontend fallback assumptions:

1. Overview shows backend `keywords` and `sceneDescriptionChinese`
2. Notice and Interpret render the backend pack structure
3. Interact guide shows the backend scene copy and task copy
4. Step In follows the canonical source-module mapping
5. Completion reflects the job-returned lesson rather than the mock lesson

- [ ] **Step 4: Commit**

```bash
git add docs/handoff/README.md docs/handoff/CHANGELOG.md
git commit -m "docs: record deep mode integration contract"
```

---

## Exit Criteria

The integration plan is complete when:

1. The backend emits the exact Deep Course fields the frontend expects.
2. The frontend gets Deep Mode content from job polling instead of local mock generation.
3. The agreed field-boundary decisions are documented in the handoff pack.
4. The API test suite, prototype build, and Playwright smoke test all pass.
