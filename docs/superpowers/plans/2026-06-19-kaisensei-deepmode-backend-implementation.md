# Kaisensei Deep Mode Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mode-aware backend path inside the existing `api/` service so `mode=deep` creates a Deep Mode job, generates a full Deep Course JSON, validates it deterministically, retries once on failure, and keeps the current Quick Mode path working unchanged.

**Architecture:** Keep one backend service and one job endpoint. Move Deep-specific generation logic into `api/src/deep/`, keep shared model transport in `api/src/shared/ai/`, and let `api/src/services/job-runner.js` dispatch by `mode` to the correct provider. Quick Mode stays on its current files and behavior; the only shared seam is the generic job plumbing.

**Tech Stack:** Node.js, Fastify, `@fastify/multipart`, `node:test`, existing shared AI helpers in `api/src/shared/ai/`, current in-memory job store, and the existing React/Vite frontend as a consumer of the unchanged `/v1/lesson-jobs` contract.

---

## File Structure

### Backend service

- Modify: `api/src/app.js`
- Modify: `api/src/contracts/job.js`
- Modify: `api/src/routes/lesson-jobs.js`
- Modify: `api/src/services/job-runner.js`
- Modify: `api/src/stores/in-memory-job-store.js`
- Create: `api/src/services/provider-registry.js`

### Deep domain

- Create: `api/src/deep/contracts/course.js`
- Create: `api/src/deep/services/course-prompt.js`
- Create: `api/src/deep/services/course-normalizer.js`
- Create: `api/src/deep/services/deep-codex-cli-provider.js`
- Create: `api/src/deep/services/deep-gemini-api-provider.js`

### Tests

- Modify: `api/test/lesson-jobs-route.test.js`
- Create: `api/test/deep-course-normalizer.test.js`
- Create: `api/test/deep-course-provider.test.js`
- Create: `api/test/job-runner.test.js`

---

### Task 1: Make the job envelope mode-aware without changing Quick defaults

**Files:**
- Modify: `api/src/contracts/job.js`
- Modify: `api/src/stores/in-memory-job-store.js`
- Modify: `api/src/routes/lesson-jobs.js`
- Modify: `api/test/lesson-jobs-route.test.js`

- [ ] **Step 1: Write the failing test**

Add a route test that posts one Deep job and one legacy request without `mode`, then asserts the stored job keeps the correct mode:

```js
test("POST /v1/lesson-jobs persists mode and keeps the legacy quick default", async () => {
  const jobStore = createLessonJobStore();
  const calls = [];
  const jobRunner = {
    enqueue(jobId, payload) {
      calls.push({ jobId, payload });
    },
  };
  const app = createApp({ jobStore, jobRunner });

  const deepBody = buildMultipartBody({
    fields: { level: "Normal", mode: "deep", traceId: "trace-deep" },
  });

  const deepRes = await app.inject({
    method: "POST",
    url: "/v1/lesson-jobs",
    headers: { "content-type": deepBody.contentType },
    payload: deepBody.body,
  });

  assert.equal(deepRes.statusCode, 202);
  const deepCreated = deepRes.json();
  assert.equal(jobStore.get(deepCreated.jobId).mode, "deep");
  assert.equal(calls[0].payload.mode, "deep");

  const quickBody = buildMultipartBody({
    fields: { level: "Advanced", traceId: "trace-quick" },
  });

  const quickRes = await app.inject({
    method: "POST",
    url: "/v1/lesson-jobs",
    headers: { "content-type": quickBody.contentType },
    payload: quickBody.body,
  });

  assert.equal(quickRes.statusCode, 202);
  const quickCreated = quickRes.json();
  assert.equal(jobStore.get(quickCreated.jobId).mode, "quick");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd api && node --test test/lesson-jobs-route.test.js`

Expected: fail because `mode` is not yet parsed or persisted.

- [ ] **Step 3: Write the minimal implementation**

Update the route to parse `mode`, default it to `quick` when missing, validate it, and pass it into the job store and runner:

```js
function isValidMode(mode) {
  return mode === "quick" || mode === "deep";
}

const mode = String(part.value || "").trim() || "quick";

if (!isValidMode(mode)) {
  return reply.status(400).send({
    error: {
      code: "invalid_mode",
      message: "Mode must be quick or deep.",
    },
  });
}

const job = jobStore.create({ level, mode });
jobRunner.enqueue(job.jobId, { imageBuffer, mimeType, level, mode, traceId });
```

Extend the job store to persist `mode`, and export a mode list from `api/src/contracts/job.js` so the API has one place to validate the accepted values.

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd api && node --test test/lesson-jobs-route.test.js`

Expected: pass, with Deep stored as `deep` and legacy requests still defaulting to `quick`.

- [ ] **Step 5: Commit**

```bash
git add api/src/contracts/job.js api/src/stores/in-memory-job-store.js api/src/routes/lesson-jobs.js api/test/lesson-jobs-route.test.js
git commit -m "feat: add mode-aware lesson jobs"
```

---

### Task 2: Define the Deep course contract and deterministic validator

**Files:**
- Create: `api/src/deep/contracts/course.js`
- Create: `api/src/deep/services/course-normalizer.js`
- Create: `api/test/deep-course-normalizer.test.js`

- [ ] **Step 1: Write the failing test**

Add a test that accepts a canonical Deep course and rejects a broken one:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDeepCoursePayload } from "../src/deep/services/course-normalizer.js";

const validCourse = {
  mode: "deep",
  level: "Normal",
  overview: {
    keywords: ["coffee", "table", "laptop"],
    sceneDescriptionChinese: "咖啡厅里悠闲的下午茶时间",
    startPromptChinese: "点击开始这次学习之旅",
  },
  modules: {
    notice: { title: "Notice", goal: "Describe what is visible in the photo.", expressionPacks: [] },
    interpret: { title: "Interpret", goal: "Infer what may be happening in the scene.", expressionPacks: [] },
    interact: { title: "Interact", goal: "Express a need and respond naturally.", taskPacks: [] },
    stepIn: { title: "Step In", goal: "Complete one full scene conversation.", dialogue: {} },
  },
};

test("normalizeDeepCoursePayload accepts the canonical deep course shape", () => {
  const normalized = normalizeDeepCoursePayload(validCourse);
  assert.equal(normalized.mode, "deep");
  assert.equal(normalized.level, "normal");
  assert.equal(normalized.overview.startPromptChinese, "点击开始这次学习之旅");
});

test("normalizeDeepCoursePayload rejects missing modules", () => {
  assert.throws(() =>
    normalizeDeepCoursePayload({
      ...validCourse,
      modules: {
        notice: validCourse.modules.notice,
        interpret: validCourse.modules.interpret,
        interact: validCourse.modules.interact,
      },
    }),
  );
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd api && node --test test/deep-course-normalizer.test.js`

Expected: fail because the deep contract and normalizer do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Create a Deep-specific contract module and normalizer that:

```js
export const deepCourseContract = {
  mode: "deep",
  level: "normal",
  overview: {
    keywords: [],
    sceneDescriptionChinese: "",
    startPromptChinese: "",
  },
  modules: {
    notice: { title: "Notice", goal: "", expressionPacks: [] },
    interpret: { title: "Interpret", goal: "", expressionPacks: [] },
    interact: { title: "Interact", goal: "", taskPacks: [] },
    stepIn: { title: "Step In", goal: "", dialogue: {} },
  },
};
```

The validator must:

- reject any payload whose `mode` is not `deep`
- normalize `level` to lowercase `normal` / `advanced`
- require `overview`
- require all four modules in fixed order
- validate unique IDs and answer coverage for nested items
- throw `LessonValidationError` on structural problems

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd api && node --test test/deep-course-normalizer.test.js`

Expected: pass, with a normalized lowercase `level` and a strict rejection path for broken payloads.

- [ ] **Step 5: Commit**

```bash
git add api/src/deep/contracts/course.js api/src/deep/services/course-normalizer.js api/test/deep-course-normalizer.test.js
git commit -m "feat: add deep course validation"
```

---

### Task 3: Add Deep providers and a provider registry without touching Quick logic

**Files:**
- Create: `api/src/deep/services/course-prompt.js`
- Create: `api/src/deep/services/deep-codex-cli-provider.js`
- Create: `api/src/deep/services/deep-gemini-api-provider.js`
- Create: `api/src/services/provider-registry.js`
- Modify: `api/src/app.js`
- Create: `api/test/deep-course-provider.test.js`

- [ ] **Step 1: Write the failing test**

Add a provider test that injects a fake transport, verifies the Deep prompt is used, and returns a normalized deep course:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createDeepCodexCliProvider } from "../src/deep/services/deep-codex-cli-provider.js";

test("deep codex provider builds the deep prompt and normalizes the result", async () => {
  const prompts = [];
  const provider = createDeepCodexCliProvider({
    model: "test-model",
    runCliPrompt: async ({ prompt }) => {
      prompts.push(prompt);
      return JSON.stringify({
        mode: "deep",
        level: "Normal",
        overview: {
          keywords: ["coffee", "table", "laptop"],
          sceneDescriptionChinese: "咖啡厅里悠闲的下午茶时间",
          startPromptChinese: "点击开始这次学习之旅",
        },
        modules: {
          notice: { title: "Notice", goal: "Describe what is visible in the photo.", expressionPacks: [] },
          interpret: { title: "Interpret", goal: "Infer what may be happening in the scene.", expressionPacks: [] },
          interact: { title: "Interact", goal: "Express a need and respond naturally.", taskPacks: [] },
          stepIn: { title: "Step In", goal: "Complete one full scene conversation.", dialogue: {} },
        },
      });
    },
  });

  const course = await provider.generateLesson({
    imageBuffer: Buffer.from("fake-image"),
    mimeType: "image/jpeg",
    level: "Normal",
    traceId: "trace-deep",
  });

  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /Generate one complete kaisensei Deep Mode course/);
  assert.equal(course.mode, "deep");
  assert.equal(course.level, "normal");
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd api && node --test test/deep-course-provider.test.js`

Expected: fail because the Deep provider and prompt builder do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Create `api/src/deep/services/course-prompt.js` with a dedicated Deep prompt builder that only knows Deep schema and repair notes. Then implement Deep provider adapters that follow the current provider shape:

```js
export function createDeepCodexCliProvider(deps = {}) {
  return {
    async generateLesson(payload) {
      // build Deep prompt
      // call runCliPrompt / shared CLI helper
      // parse JSON
      // normalize through deep normalizer
      // throw LessonValidationError on malformed output
    },
  };
}
```

`provider-registry.js` should build both mode providers from the existing `LESSON_PROVIDER` env switch and hand them to `app.js`:

```js
export function createProviderRegistry() {
  const providerName = String(process.env.LESSON_PROVIDER || "codex").toLowerCase();

  if (providerName === "gemini") {
    return {
      quick: createGeminiApiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
      }),
      deep: createDeepGeminiApiProvider({
        apiKey: process.env.GEMINI_API_KEY,
        model: process.env.GEMINI_MODEL,
      }),
    };
  }

  return {
    quick: createCodexCliProvider({ model: process.env.CODEX_MODEL }),
    deep: createDeepCodexCliProvider({ model: process.env.CODEX_MODEL }),
  };
}
```

`app.js` should pass the registry into the job runner while still keeping the current single-provider fallback alive:

```js
const resolvedProviders = createProviderRegistry();
const resolvedJobRunner = jobRunner ?? createLessonJobRunner({
  jobStore: resolvedJobStore,
  provider: resolvedProviders.quick,
  providers: resolvedProviders,
});
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd api && node --test test/deep-course-provider.test.js`

Expected: pass, with the Deep prompt path isolated from the Quick prompt files.

- [ ] **Step 5: Commit**

```bash
git add api/src/deep/services/course-prompt.js api/src/deep/services/deep-codex-cli-provider.js api/src/deep/services/deep-gemini-api-provider.js api/src/services/provider-registry.js api/src/app.js api/test/deep-course-provider.test.js
git commit -m "feat: add deep course providers"
```

---

### Task 4: Make the job runner select by mode and retry once on generation or validation failure

**Files:**
- Modify: `api/src/services/job-runner.js`
- Create: `api/test/job-runner.test.js`

- [ ] **Step 1: Write the failing test**

Add a runner test that proves Deep retries once and Quick does not inherit Deep-specific behavior:

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createLessonJobRunner } from "../src/services/job-runner.js";
import { LessonValidationError } from "../src/shared/ai/errors.js";

test("deep jobs retry once with validation notes", async () => {
  const calls = [];
  const jobStore = {
    update(jobId, patch) {
      calls.push({ type: "store", jobId, patch });
      return { jobId, ...patch };
    },
  };
  const provider = {
    async generateLesson(payload) {
      calls.push({ type: "provider", payload });
      if (calls.filter((entry) => entry.type === "provider").length === 1) {
        throw new LessonValidationError("Deep payload failed validation", {
          code: "validation_error",
          details: { issues: ["missing stepIn"] },
        });
      }

      return {
        mode: "deep",
        level: "normal",
        overview: {
          keywords: ["coffee", "table", "laptop"],
          sceneDescriptionChinese: "咖啡厅里悠闲的下午茶时间",
          startPromptChinese: "点击开始这次学习之旅",
        },
        modules: {
          notice: { title: "Notice", goal: "Describe what is visible in the photo.", expressionPacks: [] },
          interpret: { title: "Interpret", goal: "Infer what may be happening in the scene.", expressionPacks: [] },
          interact: { title: "Interact", goal: "Express a need and respond naturally.", taskPacks: [] },
          stepIn: { title: "Step In", goal: "Complete one full scene conversation.", dialogue: {} },
        },
      };
    },
  };

  const runner = createLessonJobRunner({
    jobStore,
    providers: { deep: provider },
  });

  runner.enqueue("job_deep", {
    mode: "deep",
    level: "Normal",
    imageBuffer: Buffer.from("fake-image"),
    mimeType: "image/jpeg",
    traceId: "trace-deep",
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  const providerCalls = calls.filter((entry) => entry.type === "provider");
  assert.equal(providerCalls.length, 2);
  assert.match(providerCalls[1].payload.repairNotes, /missing stepIn/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd api && node --test test/job-runner.test.js`

Expected: fail because the runner still assumes one provider and no retry loop.

- [ ] **Step 3: Write the minimal implementation**

Update `createLessonJobRunner` so it accepts a provider registry and selects by job mode, while still tolerating the old single-provider shape:

```js
export function createLessonJobRunner({ jobStore, provider, providers }) {
  return {
    enqueue(jobId, payload) {
      const providerMap = providers || (provider ? { quick: provider } : {});
      const activeProvider = providerMap[payload.mode] || providerMap.quick || provider;
      // update running
      // attempt 1
      // on validation or generation failure, build repairNotes and retry once
      // attempt 2
      // update succeeded or failed
    },
  };
}
```

Retry rules:

- retry once for provider/runtime failures and validation failures
- keep the same image and level
- pass `repairNotes` into the second call
- if the second attempt fails, persist `failed` with a compact error object

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd api && node --test test/job-runner.test.js`

Expected: pass, and the second Deep call should carry repair notes derived from the first failure.

- [ ] **Step 5: Commit**

```bash
git add api/src/services/job-runner.js api/test/job-runner.test.js
git commit -m "feat: add deep job retry"
```

---

## Self-Review

Before declaring the plan ready for execution, check the spec against the task list:

1. **Mode routing:** Task 1 covers `mode=deep`, legacy `quick` fallback, and job-store persistence.
2. **Deep contract:** Task 2 covers the Deep course schema, lowercase output level, and deterministic validation.
3. **Provider isolation:** Task 3 keeps Deep prompt/provider code under `api/src/deep/` and adds a provider registry instead of mixing Deep into Quick files.
4. **Retry behavior:** Task 4 covers one automatic retry with repair notes and the final failed state.
5. **Quick compatibility:** Task 1 and Task 3 keep the current Quick request shape and provider path intact.

Placeholder scan:

- No `TBD`.
- No `TODO`.
- No “implement later”.
- No steps that say “write tests for the above” without actual test code.

Type consistency check:

- `mode` is the dispatch key everywhere.
- Deep output uses lowercase `normal` / `advanced`.
- The job runner selects `providers.deep` for Deep and `providers.quick` as the fallback.
- Deep provider methods keep the existing `generateLesson` shape so the job runner does not need a second interface.

Execution handoff:

Plan complete and saved to `docs/superpowers/plans/2026-06-19-kaisensei-deepmode-backend-implementation.md`. Two execution options:

1. Subagent-Driven (recommended) - fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
