# Kaisensei API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a real `kaisensei-api` service and wire the existing mobile prototype to it so photo capture/upload produces an async lesson job, then resolves into the See → Learn → Build → Use flow without runtime mock data.

**Architecture:** Keep the current `prototype/` app as the mobile UI host. Add a separate `api/` Node service that accepts image uploads, creates in-memory jobs, invokes the local Codex CLI provider, validates the returned lesson JSON, and exposes polling endpoints. The frontend will post a photo, poll job status, and render either the generated lesson or a failure page. Images are processed in memory only and discarded after generation.

**Tech Stack:** Node.js, Fastify, `@fastify/multipart`, native `fetch`, `node:test`, existing React + Vite frontend, browser `speechSynthesis`, no OpenAI API key required for this phase.

---

## File Structure

### Backend service

- Create: `api/package.json`
- Create: `api/src/app.js`
- Create: `api/src/server.js`
- Create: `api/src/contracts/lesson.js`
- Create: `api/src/contracts/job.js`
- Create: `api/src/stores/in-memory-job-store.js`
- Create: `api/src/services/codex-cli-provider.js`
- Create: `api/src/services/lesson-normalizer.js`
- Create: `api/src/services/job-runner.js`
- Create: `api/src/routes/lesson-jobs.js`
- Create: `api/test/health.test.js`
- Create: `api/test/lesson-jobs.test.js`
- Create: `api/test/lesson-jobs-route.test.js`
- Create: `api/test/codex-cli-provider.test.js`
- Create: `api/.env.example`

### Frontend integration

- Modify: `prototype/src/App.jsx`
- Modify: `prototype/src/styles.css`
- Create: `prototype/src/lib/lesson-api.js`
- Modify: `prototype/vite.config.mjs`
- Modify: `prototype/src/lesson-data.js` to remove runtime mock usage or delete it once the new flow is live

### Docs / handoff

- Modify: `docs/handoff/CHANGELOG.md`
- Optional create: `prototype/README.md` if local run instructions need a home

---

### Task 1: Scaffold the `api/` service and lock the base HTTP contract

**Files:**
- Create: `api/package.json`
- Create: `api/src/app.js`
- Create: `api/src/server.js`
- Create: `api/test/health.test.js`
- Create: `api/.env.example`

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

test("GET /healthz returns ok", async () => {
  const app = createApp();
  const res = await app.inject({ method: "GET", url: "/healthz" });
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.json(), { ok: true });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `cd api && node --test test/health.test.js`

Expected: fail because the service files do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Create a Fastify app factory that registers `GET /healthz` and returns `{ ok: true }`. Keep `server.js` as the startup entry that reads `PORT` from environment and listens on `127.0.0.1:3001`.

- [ ] **Step 4: Run the test and verify it passes**

Run: `cd api && node --test test/health.test.js`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add api/package.json api/src/app.js api/src/server.js api/test/health.test.js api/.env.example
git commit -m "feat: scaffold kaisensei api service"
```

---

### Task 2: Add the lesson and job contracts plus in-memory job store

**Files:**
- Create: `api/src/contracts/lesson.js`
- Create: `api/src/contracts/job.js`
- Create: `api/src/stores/in-memory-job-store.js`
- Create: `api/test/contracts.test.js`
- Create: `api/test/lesson-jobs.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { lessonContract } from "../src/contracts/lesson.js";
import { createLessonJobStore } from "../src/stores/in-memory-job-store.js";

test("lesson contract exposes the required top-level keys", () => {
  assert.equal(lessonContract.level, "Normal");
  assert.ok(lessonContract.see);
  assert.ok(lessonContract.learn);
  assert.ok(lessonContract.build);
  assert.ok(lessonContract.use);
});

test("job store creates and updates a job", () => {
  const store = createLessonJobStore();
  const created = store.create({ level: "Normal" });
  assert.equal(created.status, "queued");

  const running = store.update(created.jobId, { status: "running" });
  assert.equal(running.status, "running");

  const missing = store.get("job_missing");
  assert.equal(missing, null);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `cd api && node --test test/lesson-jobs.test.js`

Expected: fail because the store and contract modules do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Implement a small in-memory store with these fields:

- `jobId`
- `level`
- `status`
- `createdAt`
- `updatedAt`
- `lesson`
- `error`

Keep the contract shape aligned with the product doc:

```js
export const lessonContract = {
  level: "Normal",
  see: { sentence: "", chinese: "", speakText: "" },
  learn: { chunks: [], note: "" },
  build: { targetSentence: "", chunks: [], correctOrder: [] },
  use: { situation: "", sentence: "", chinese: "", speakText: "" }
};
```

- [ ] **Step 4: Run the test and verify it passes**

Run: `cd api && node --test test/lesson-jobs.test.js`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add api/src/contracts/lesson.js api/src/contracts/job.js api/src/stores/in-memory-job-store.js api/test/lesson-jobs.test.js
git commit -m "feat: add kaisensei lesson job store"
```

---

### Task 3: Implement the Codex CLI provider adapter and lesson normalization

**Files:**
- Create: `api/src/services/codex-cli-provider.js`
- Create: `api/src/services/lesson-normalizer.js`
- Create: `api/test/codex-cli-provider.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeLessonPayload } from "../src/services/lesson-normalizer.js";

test("normalizeLessonPayload rejects missing required fields", () => {
  assert.throws(() => normalizeLessonPayload({ level: "Normal" }));
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `cd api && node --test test/codex-cli-provider.test.js`

Expected: fail because the normalizer does not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Implement two layers:

1. `codex-cli-provider.js` wraps the local Codex CLI behind a single async function that receives:

```js
{
  imageBuffer,
  mimeType,
  level
}
```

2. `lesson-normalizer.js` validates the CLI output and returns a strict lesson object or throws a typed error.

The provider must:

- call the local CLI only
- request JSON only
- reject empty output
- reject malformed JSON
- reject missing lesson fields

- [ ] **Step 4: Run the test and verify it passes**

Run: `cd api && node --test test/codex-cli-provider.test.js`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add api/src/services/codex-cli-provider.js api/src/services/lesson-normalizer.js api/test/codex-cli-provider.test.js
git commit -m "feat: add codex cli lesson provider"
```

---

### Task 4: Expose the async lesson-job API and worker loop

**Files:**
- Create: `api/src/routes/lesson-jobs.js`
- Create: `api/src/services/job-runner.js`
- Modify: `api/src/app.js`
- Create: `api/test/lesson-jobs-route.test.js`

- [ ] **Step 1: Write the failing test**

```js
import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";

test("POST /v1/lesson-jobs creates a queued job", async () => {
  const app = createApp();
  const res = await app.inject({
    method: "POST",
    url: "/v1/lesson-jobs",
    payload: {
      level: "Normal"
    }
  });

  assert.equal(res.statusCode, 202);
  assert.equal(res.json().status, "queued");
  assert.ok(res.json().jobId);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `cd api && node --test test/lesson-jobs-route.test.js`

Expected: fail because the route is not wired yet.

- [ ] **Step 3: Write the minimal implementation**

Implement:

- `POST /v1/lesson-jobs` accepts the uploaded image and `level`
- a new job record is created immediately
- the worker starts generation asynchronously
- `GET /v1/lesson-jobs/:jobId` returns the current state

Important rule:

- the API must never fabricate a lesson if provider generation fails
- image bytes are only held long enough for the provider call and then discarded

- [ ] **Step 4: Run the test and verify it passes**

Run: `cd api && node --test test/lesson-jobs-route.test.js`

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add api/src/routes/lesson-jobs.js api/src/services/job-runner.js api/src/app.js api/test/lesson-jobs-route.test.js
git commit -m "feat: add lesson job api"
```

---

### Task 5: Wire the prototype to the real backend flow

**Files:**
- Create: `prototype/src/lib/lesson-api.js`
- Modify: `prototype/src/App.jsx`
- Modify: `prototype/src/styles.css`
- Modify: `prototype/vite.config.mjs`

- [ ] **Step 1: Write the failing test**

Use the browser/dev flow as the test harness:

1. run `cd api && npm run dev`
2. run `cd prototype && npm run dev`
3. open the app in the mobile viewport
4. upload a photo

Expected before implementation: the app still uses mock data and never reaches the real job flow.

- [ ] **Step 2: Run the check and verify it fails**

Expected failure mode: no real API call is made yet, or the frontend cannot poll a real job.

- [ ] **Step 3: Write the minimal implementation**

Add a small client module that does:

- `createLessonJob({ file, level })`
- `getLessonJob(jobId)`

Update `App.jsx` so that:

- Camera page submits real image data
- the app stores the returned `jobId`
- loading state polls the backend until `succeeded` or `failed`
- success loads the returned lesson into See
- failure routes to the failure page and offers retry

Update Vite so the frontend can call the API through `/api` in development.

- [ ] **Step 4: Run the check and verify it passes**

Run:

```bash
cd api && npm run dev
cd prototype && npm run dev
```

Then verify in the browser:

- photo upload creates a job
- the loading state transitions
- success renders real lesson data
- failure renders failure UI

- [ ] **Step 5: Commit**

```bash
git add prototype/src/lib/lesson-api.js prototype/src/App.jsx prototype/src/styles.css prototype/vite.config.mjs
git commit -m "feat: wire prototype to lesson api"
```

---

### Task 6: Remove runtime mock usage and tighten failure / retry behavior

**Files:**
- Modify: `prototype/src/lesson-data.js`
- Modify: `prototype/src/App.jsx`
- Modify: `docs/handoff/CHANGELOG.md`

- [ ] **Step 1: Write the failing test**

Use the app and inspect the runtime path:

- no user action should be able to land on a mock lesson in the production flow
- retry from failure should restart capture and job creation

Expected before implementation: mock data is still reachable in runtime.

- [ ] **Step 2: Run the check and verify it fails**

Expected failure mode: at least one runtime path still depends on mock lesson data.

- [ ] **Step 3: Write the minimal implementation**

Remove mock lesson data from the live path.

Keep any sample lesson objects only for docs or tests.

Make failure copy explicit and short:

- `The lesson got lost on the way.`
- `Try again.`

Make retry restart from camera, not from the failed lesson state.

- [ ] **Step 4: Run the check and verify it passes**

Verify:

- no runtime mock fallback remains
- failure page is shown on real backend error
- retry restarts the flow cleanly

- [ ] **Step 5: Commit**

```bash
git add prototype/src/lesson-data.js prototype/src/App.jsx docs/handoff/CHANGELOG.md
git commit -m "fix: remove runtime mock lesson fallback"
```

---

### Task 7: Write the developer-facing runbook

**Files:**
- Create: `prototype/README.md`
- Modify: `docs/handoff/CHANGELOG.md`
- Optional create: `README.md` at repo root if the team wants a single entry point later

- [ ] **Step 1: Write the failing test**

Ask a fresh maintainer to follow the runbook without context. If they cannot start both services and verify the flow, the doc is incomplete.

- [ ] **Step 2: Run the check and verify it fails**

Before writing the runbook, there should be no clean instructions for starting both services and verifying the API-backed flow.

- [ ] **Step 3: Write the minimal implementation**

Document:

- how to start `api/`
- how to start `prototype/`
- which ports each service uses
- how to verify the upload → job → lesson flow
- what failure looks like

- [ ] **Step 4: Run the check and verify it passes**

Confirm the instructions are enough for a fresh run on this machine.

- [ ] **Step 5: Commit**

```bash
git add prototype/README.md docs/handoff/CHANGELOG.md
git commit -m "docs: add kaisensei api runbook"
```

---

## Self-Review Checklist

- The plan covers the current prototype instead of a hypothetical new app shell.
- The backend is isolated in its own `api/` service.
- The current local provider choice is Codex CLI, not OpenAI API.
- The frontend does not keep a runtime mock fallback.
- Failure paths are explicit and user-visible.
- The API job model supports future provider replacement.
- The plan is split into small tasks that can be implemented and verified independently.
