import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { createLessonJobStore } from "../src/stores/in-memory-job-store.js";

function buildMultipartBody({ fields = {}, fileField = "image", fileName = "photo.jpg", fileType = "image/jpeg", fileContent = "fake-image-data" }) {
  const boundary = "----kaisensei-boundary";
  const chunks = [];

  for (const [name, value] of Object.entries(fields)) {
    chunks.push(`--${boundary}\r\n`);
    chunks.push(`Content-Disposition: form-data; name="${name}"\r\n\r\n`);
    chunks.push(`${value}\r\n`);
  }

  chunks.push(`--${boundary}\r\n`);
  chunks.push(`Content-Disposition: form-data; name="${fileField}"; filename="${fileName}"\r\n`);
  chunks.push(`Content-Type: ${fileType}\r\n\r\n`);
  chunks.push(fileContent);
  chunks.push(`\r\n--${boundary}--\r\n`);

  return {
    body: Buffer.from(chunks.join(""), "utf8"),
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

test("POST /v1/lesson-jobs creates a queued job and GET returns the stored job", async () => {
  const jobStore = createLessonJobStore();
  const lesson = {
    level: "Normal",
    see: {
      sentence: "A coffee mug is sitting next to a laptop on the desk.",
      chinese: "一个咖啡杯放在桌上，旁边是一台笔记本电脑。",
      speakText: "A coffee mug is sitting next to a laptop on the desk.",
    },
    learn: {
      chunks: [
        { id: "c1", text: "A coffee mug", chinese: "一个咖啡杯" },
        { id: "c2", text: "is sitting", chinese: "放着" },
        { id: "c3", text: "next to", chinese: "在……旁边" },
        { id: "c4", text: "a laptop", chinese: "一台笔记本电脑" },
        { id: "c5", text: "on the desk", chinese: "在桌上" },
      ],
      note: "Use \"next to\" when two things are close together.",
    },
    build: {
      targetSentence: "A coffee mug is sitting next to a laptop on the desk.",
      chunks: [
        { id: "c1", text: "A coffee mug", chinese: "一个咖啡杯" },
        { id: "c2", text: "is sitting", chinese: "放着" },
        { id: "c3", text: "next to", chinese: "在……旁边" },
        { id: "c4", text: "a laptop", chinese: "一台笔记本电脑" },
        { id: "c5", text: "on the desk", chinese: "在桌上" },
      ],
      correctOrder: ["c1", "c2", "c3", "c4", "c5"],
    },
    use: {
      situation: "You are talking about your workspace.",
      question: "What do you usually keep next to your laptop while you work?",
      targetAnswer: "I usually keep a coffee mug next to my laptop while I work.",
      answerChunks: [
        { id: "u1", text: "I usually keep", chinese: "我通常放" },
        { id: "u2", text: "a coffee mug", chinese: "一个咖啡杯" },
        { id: "u3", text: "next to", chinese: "在……旁边" },
        { id: "u4", text: "my laptop", chinese: "我的笔记本电脑" },
        { id: "u5", text: "while I work", chinese: "当我工作时" },
      ],
      correctOrder: ["u1", "u2", "u3", "u4", "u5"],
      speakText: "I usually keep a coffee mug next to my laptop while I work.",
    },
  };

  const jobRunner = {
    enqueue: async (jobId) => {
      await Promise.resolve();
      jobStore.update(jobId, { status: "succeeded", lesson, error: null });
    },
  };

  const app = createApp({ jobStore, jobRunner });
  const { body, contentType } = buildMultipartBody({ fields: { level: "Normal" } });

  const createRes = await app.inject({
    method: "POST",
    url: "/v1/lesson-jobs",
    headers: { "content-type": contentType },
    payload: body,
  });

  assert.equal(createRes.statusCode, 202);
  const created = createRes.json();
  assert.equal(created.status, "queued");
  assert.match(created.jobId, /^job_/);
  assert.equal(created.generation.activeStage, "overview_notice");
  assert.equal(created.generation.stageStates.overview_notice, "pending");
  assert.equal(created.generation.stageStates.interpret, "pending");

  await new Promise((resolve) => setTimeout(resolve, 0));

  const getRes = await app.inject({
    method: "GET",
    url: `/v1/lesson-jobs/${created.jobId}`,
  });

  assert.equal(getRes.statusCode, 200);
  const fetched = getRes.json();
  assert.equal(fetched.status, "succeeded");
  assert.equal(fetched.lesson.see.sentence, lesson.see.sentence);
  assert.equal(fetched.generation.activeStage, "overview_notice");
  assert.equal(fetched.generation.stageStates.step_in, "pending");

  const gatewayStyleRes = await app.inject({
    method: "GET",
    url: `/api/v1/lesson-jobs/${created.jobId}`,
  });

  assert.equal(gatewayStyleRes.statusCode, 200);
  assert.equal(gatewayStyleRes.json().lesson.see.sentence, lesson.see.sentence);
});

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
  assert.equal(deepCreated.traceId, "trace-deep");
  assert.equal(jobStore.get(deepCreated.jobId).mode, "deep");
  assert.equal(jobStore.get(deepCreated.jobId).traceId, "trace-deep");
  assert.equal(calls[0].payload.mode, "deep");
  assert.equal(calls[0].payload.traceId, "trace-deep");

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

test("POST /v1/lesson-jobs/:jobId/retry resumes a failed deep job from the failed stage", async () => {
  const jobStore = createLessonJobStore();
  const calls = [];
  const jobRunner = {
    enqueue(jobId, payload) {
      calls.push({ jobId, payload });
    },
  };
  const app = createApp({ jobStore, jobRunner });
  const created = jobStore.create({
    level: "Normal",
    mode: "deep",
    traceId: "trace-deep",
    imageBuffer: Buffer.from("photo"),
    mimeType: "image/jpeg",
  });
  jobStore.update(created.jobId, {
    status: "failed",
    error: { code: "provider_runtime_error", message: "failed interpret" },
    generation: {
      activeStage: "interpret",
      stageStates: {
        overview_notice: "ready",
        interpret: "failed",
        interact: "pending",
        step_in: "pending",
      },
      frozenLesson: {
        overview: {
          keywords: ["coffee"],
          sceneDescriptionChinese: "桌面工作场景",
          startPromptChinese: "开始",
        },
        notice: {
          title: "Notice",
          goal: "Describe what is visible in the photo.",
          expressionPacks: [],
        },
        interpret: null,
        interact: null,
        stepIn: null,
      },
      errorStage: "interpret",
      errorMessage: "failed interpret",
    },
  });

  const res = await app.inject({
    method: "POST",
    url: `/v1/lesson-jobs/${created.jobId}/retry`,
  });

  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.status, "queued");
  assert.equal(calls.length, 1);
  assert.equal(calls[0].payload.resumeFromStage, "interpret");
  assert.equal(calls[0].payload.imageBuffer.toString(), "photo");
  assert.equal(calls[0].payload.mimeType, "image/jpeg");
});
