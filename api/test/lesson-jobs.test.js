import { test } from "node:test";
import assert from "node:assert/strict";
import { lessonJobGenerationActiveStages, lessonJobGenerationStages } from "../src/contracts/job.js";
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
  const created = store.create({ level: "Normal", imageBuffer: Buffer.from("photo"), mimeType: "image/jpeg" });

  assert.ok(created.jobId.startsWith("job_"));
  assert.equal(created.level, "Normal");
  assert.equal(created.status, "queued");
  assert.equal(created.lesson, null);
  assert.equal(created.error, null);
  assert.equal(created.generation.activeStage, lessonJobGenerationActiveStages[0]);
  assert.deepEqual(Object.keys(created.generation.stageStates).sort(), lessonJobGenerationStages.slice().sort());
  assert.equal(created.generation.stageStates.overview_notice, "pending");
  assert.equal(created.generation.stageStates.interpret, "pending");
  assert.equal(created.generation.stageStates.interact, "pending");
  assert.equal(created.generation.stageStates.step_in, "pending");
  assert.equal(store.getArtifacts(created.jobId).mimeType, "image/jpeg");
  assert.equal(store.getArtifacts(created.jobId).imageBuffer.toString(), "photo");

  const running = store.update(created.jobId, { status: "running" });
  assert.equal(running.status, "running");
  assert.equal(store.get(created.jobId).status, "running");
  assert.equal(store.get(created.jobId).generation.activeStage, lessonJobGenerationActiveStages[0]);
  assert.equal(store.get(created.jobId).generation.stageStates.interpret, "pending");

  const missing = store.get("job_missing");
  assert.equal(missing, null);
});
