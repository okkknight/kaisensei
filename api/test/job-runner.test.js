import { test } from "node:test";
import assert from "node:assert/strict";
import { createLessonJobRunner } from "../src/services/job-runner.js";
import { LessonValidationError } from "../src/shared/ai/errors.js";

async function waitFor(condition, timeoutMs = 1000) {
  const startedAt = Date.now();

  while (!condition()) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Timed out waiting for job runner");
    }

    await new Promise((resolve) => setImmediate(resolve));
  }
}

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

  await waitFor(() => calls.filter((entry) => entry.type === "provider").length === 2);

  const providerCalls = calls.filter((entry) => entry.type === "provider");
  assert.equal(providerCalls.length, 2);
  assert.match(providerCalls[1].payload.repairNotes, /missing stepIn/);
});

test("quick jobs keep using the quick provider from the registry", async () => {
  const calls = [];
  const jobStore = {
    update(jobId, patch) {
      calls.push({ type: "store", jobId, patch });
      return { jobId, ...patch };
    },
  };
  const quickProvider = {
    async generateLesson(payload) {
      calls.push({ type: "quick", payload });
      return {
        mode: "quick",
        level: payload.level,
        see: { sentence: "A mug sits on the desk.", chinese: "桌上有一个杯子。", speakText: "A mug sits on the desk." },
        learn: { chunks: [], note: "" },
        build: { targetSentence: "A mug sits on the desk.", chunks: [], correctOrder: [] },
        use: {
          situation: "Talking about the desk",
          question: "What is on the desk?",
          questionChinese: "桌上有什么？",
          targetAnswer: "A mug sits on the desk.",
          answerChunks: [],
          correctOrder: [],
          speakText: "A mug sits on the desk.",
        },
      };
    },
  };
  const deepProvider = {
    async generateLesson(payload) {
      calls.push({ type: "deep", payload });
      return {
        mode: "deep",
        level: payload.level,
        overview: {
          keywords: ["coffee"],
          sceneDescriptionChinese: "深度模式",
          startPromptChinese: "开始",
        },
        modules: {},
      };
    },
  };

  const runner = createLessonJobRunner({
    jobStore,
    providers: {
      quick: quickProvider,
      deep: deepProvider,
    },
  });

  runner.enqueue("job_quick", {
    mode: "quick",
    level: "Advanced",
    imageBuffer: Buffer.from("fake-image"),
    mimeType: "image/jpeg",
    traceId: "trace-quick",
  });

  await waitFor(() => calls.some((entry) => entry.type === "store" && entry.patch.status === "succeeded"));

  const quickCalls = calls.filter((entry) => entry.type === "quick");
  const deepCalls = calls.filter((entry) => entry.type === "deep");
  assert.equal(quickCalls.length, 1);
  assert.equal(deepCalls.length, 0);
  assert.equal(quickCalls[0].payload.mode, "quick");
  assert.equal(calls.find((entry) => entry.type === "store" && entry.patch.status === "succeeded").jobId, "job_quick");
});
