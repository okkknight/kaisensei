import { test } from "node:test";
import assert from "node:assert/strict";
import { createDeepCodexCliProvider } from "../src/deep/services/deep-codex-cli-provider.js";
import { createProviderRegistry } from "../src/services/provider-registry.js";

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
  assert.match(prompts[0], /You are the Deep Mode course generator for kaisensei/);
  assert.match(prompts[0], /The learner must progress through four stages/);
  assert.match(prompts[0], /"modules": \{/);
  assert.match(prompts[0], /REQUIRED INNER SHAPES:/);
  assert.match(prompts[0], /"baseExample": \{/);
  assert.match(prompts[0], /"quickResponses": \[/);
  assert.match(prompts[0], /Every Understand block must include chunks, distractors, and answer arrays/);
  assert.match(prompts[0], /NOTICE:/);
  assert.match(prompts[0], /INTERACT:/);
  assert.match(prompts[0], /STEP IN:/);
  assert.equal(course.mode, "deep");
  assert.equal(course.level, "normal");
});

test("provider registry creates a deep provider alongside the quick provider", () => {
  const originalProvider = process.env.LESSON_PROVIDER;
  try {
    process.env.LESSON_PROVIDER = "codex";

    const registry = createProviderRegistry();
    assert.ok(registry.quick);
    assert.ok(registry.deep);
    assert.equal(typeof registry.quick.generateLesson, "function");
    assert.equal(typeof registry.deep.generateLesson, "function");
  } finally {
    if (originalProvider === undefined) {
      delete process.env.LESSON_PROVIDER;
    } else {
      process.env.LESSON_PROVIDER = originalProvider;
    }
  }
});
