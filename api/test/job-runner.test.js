import { test } from "node:test";
import assert from "node:assert/strict";
import { createLessonJobRunner } from "../src/services/job-runner.js";
import { LessonValidationError } from "../src/shared/ai/errors.js";
import { createLessonJobStore } from "../src/stores/in-memory-job-store.js";
import { buildValidDeepCoursePayload } from "./deep-course-fixture.js";

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

test("deep jobs run staged generation serially and freeze each stage", async () => {
  const jobStore = createLessonJobStore();
  const fullPayload = buildValidDeepCoursePayload();
  const calls = [];
  const provider = {
    async generateStage({ stage, background, repairNotes }) {
      calls.push({ stage, background, repairNotes });

      if (stage === "overview_notice") {
        return {
          mode: "deep",
          level: "normal",
          overview: fullPayload.overview,
          modules: {
            notice: fullPayload.modules.notice,
          },
        };
      }

      if (stage === "interpret") {
        return {
          mode: "deep",
          level: "normal",
          modules: {
            interpret: fullPayload.modules.interpret,
          },
        };
      }

      if (stage === "interact") {
        return {
          mode: "deep",
          level: "normal",
          modules: {
            interact: fullPayload.modules.interact,
          },
        };
      }

      if (stage === "step_in") {
        return {
          mode: "deep",
          level: "normal",
          modules: {
            stepIn: fullPayload.modules.stepIn,
          },
        };
      }

      throw new Error(`Unexpected stage ${stage}`);
    },
  };

  const runner = createLessonJobRunner({
    jobStore,
    providers: { deep: provider },
  });

  const job = jobStore.create({
    level: "Normal",
    mode: "deep",
    traceId: "trace-stage",
  });

  runner.enqueue(job.jobId, {
    mode: "deep",
    level: "Normal",
    imageBuffer: Buffer.from("fake-image"),
    mimeType: "image/jpeg",
    traceId: "trace-stage",
  });

  await waitFor(() => jobStore.get(job.jobId).status === "succeeded");

  const stageOrder = calls.map((entry) => entry.stage);
  assert.deepEqual(stageOrder, ["overview_notice", "interpret", "interact", "step_in"]);
  assert.equal(calls[1].background.notice.expressionPacks.length, 3);
  assert.equal(calls[2].background.interpret.expressionPacks.length, 3);
  assert.equal(calls[3].background.interact.taskPacks.length, 2);

  const stored = jobStore.get(job.jobId);
  assert.equal(stored.status, "succeeded");
  assert.equal(stored.generation.activeStage, "complete");
  assert.equal(stored.generation.stageStates.overview_notice, "ready");
  assert.equal(stored.generation.stageStates.step_in, "ready");
  assert.equal(stored.generation.frozenLesson.notice.expressionPacks.length, 3);
  assert.equal(stored.generation.frozenLesson.stepIn.dialogue.turns.length, 8);
  assert.equal(stored.lesson.modules.stepIn.dialogue.turns.length, 8);
});

test("deep jobs can resume from the failed stage with frozen background", async () => {
  const jobStore = createLessonJobStore();
  const fullPayload = buildValidDeepCoursePayload();
  const calls = [];
  const provider = {
    async generateStage({ stage, background }) {
      calls.push({ stage, background });

      if (stage === "interpret") {
        return {
          mode: "deep",
          level: "normal",
          modules: {
            interpret: fullPayload.modules.interpret,
          },
        };
      }

      if (stage === "interact") {
        return {
          mode: "deep",
          level: "normal",
          modules: {
            interact: fullPayload.modules.interact,
          },
        };
      }

      if (stage === "step_in") {
        return {
          mode: "deep",
          level: "normal",
          modules: {
            stepIn: fullPayload.modules.stepIn,
          },
        };
      }

      throw new Error(`Unexpected stage ${stage}`);
    },
  };

  const runner = createLessonJobRunner({
    jobStore,
    providers: { deep: provider },
  });

  const job = jobStore.create({
    level: "Normal",
    mode: "deep",
    traceId: "trace-resume",
    imageBuffer: Buffer.from("fake-image"),
    mimeType: "image/jpeg",
  });
  jobStore.update(job.jobId, {
    status: "failed",
    generation: {
      activeStage: "interpret",
      stageStates: {
        overview_notice: "ready",
        interpret: "failed",
        interact: "pending",
        step_in: "pending",
      },
      frozenLesson: {
        overview: fullPayload.overview,
        notice: fullPayload.modules.notice,
        interpret: null,
        interact: null,
        stepIn: null,
      },
      errorStage: "interpret",
      errorMessage: "failed interpret",
    },
  });

  runner.enqueue(job.jobId, {
    mode: "deep",
    level: "Normal",
    imageBuffer: Buffer.from("fake-image"),
    mimeType: "image/jpeg",
    traceId: "trace-resume",
    resumeFromStage: "interpret",
  });

  await waitFor(() => jobStore.get(job.jobId).status === "succeeded");

  const stageOrder = calls.map((entry) => entry.stage);
  assert.deepEqual(stageOrder, ["interpret", "interact", "step_in"]);
  assert.equal(calls[0].background.overview.keywords.length, 3);
  assert.equal(calls[0].background.notice.expressionPacks.length, 3);
  assert.equal(jobStore.get(job.jobId).generation.activeStage, "complete");
  assert.equal(jobStore.get(job.jobId).generation.stageStates.interpret, "ready");
});
