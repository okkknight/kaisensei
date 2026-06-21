import { test } from "node:test";
import assert from "node:assert/strict";
import { createDeepCodexCliProvider } from "../src/deep/services/deep-codex-cli-provider.js";
import { createProviderRegistry } from "../src/services/provider-registry.js";
import { buildValidDeepCoursePayload } from "./deep-course-fixture.js";

test("deep codex provider builds the deep prompt and normalizes the result", async () => {
  const prompts = [];
  const provider = createDeepCodexCliProvider({
    model: "test-model",
    runCliPrompt: async ({ prompt }) => {
      prompts.push(prompt);
      return JSON.stringify(buildValidDeepCoursePayload());
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
  assert.match(prompts[0], /COURSE CONFIG:/);
  assert.match(prompts[0], /"overviewKeywordCount": 3/);
  assert.match(prompts[0], /Generate exactly 2 Notice Expression Packs\./);
  assert.match(prompts[0], /Generate exactly 2 Task Packs\./);
  assert.match(prompts[0], /Use the fixed Chinese start prompt: 点击开始这次学习之旅\./);
  assert.match(prompts[0], /systemReply inside each dialogue must be a bridge sentence/);
  assert.match(prompts[0], /continuous role-play in the same scene/);
  assert.match(prompts[0], /REQUIRED INNER SHAPES:/);
  assert.match(prompts[0], /"quickResponses": \[/);
  assert.equal(course.mode, "deep");
  assert.equal(course.level, "normal");
  assert.equal(course.modules.stepIn.dialogue.turns.length, 8);
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
