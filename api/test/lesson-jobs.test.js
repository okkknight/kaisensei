import { test } from "node:test";
import assert from "node:assert/strict";
import { lessonContract } from "../src/contracts/lesson.js";
import { createLessonJobStore } from "../src/stores/in-memory-job-store.js";

test("lesson contract exposes the required top-level keys", () => {
  assert.equal(lessonContract.level, "Normal");
  assert.ok(lessonContract.photoSummary !== undefined);
  assert.ok(lessonContract.see);
  assert.ok(lessonContract.learn);
  assert.ok(lessonContract.build);
  assert.ok(lessonContract.use);
});

test("job store creates and updates a job", () => {
  const store = createLessonJobStore();
  const created = store.create({ level: "Normal" });

  assert.ok(created.jobId.startsWith("job_"));
  assert.equal(created.level, "Normal");
  assert.equal(created.status, "queued");
  assert.equal(created.lesson, null);
  assert.equal(created.error, null);

  const running = store.update(created.jobId, { status: "running" });
  assert.equal(running.status, "running");
  assert.equal(store.get(created.jobId).status, "running");

  const missing = store.get("job_missing");
  assert.equal(missing, null);
});
