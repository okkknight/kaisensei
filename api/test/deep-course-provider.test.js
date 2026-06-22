import { test } from "node:test";
import assert from "node:assert/strict";
import { createDeepCodexCliProvider } from "../src/deep/services/deep-codex-cli-provider.js";
import { createProviderRegistry } from "../src/services/provider-registry.js";
import { buildValidDeepCoursePayload } from "./deep-course-fixture.js";

function makeExample(label) {
  return {
    english: `${label} english`,
    chinese: `${label} 中文`,
    understand: {
      chunks: [`${label} 理解词块甲`, `${label} 理解词块乙`, `${label} 理解词块丙`],
      distractors: [`${label} 理解干扰词`],
      answer: [`${label} 理解词块甲`, `${label} 理解词块乙`, `${label} 理解词块丙`],
    },
    focus: {
      sentenceWithBlanks: `${label} ____ ____ the desk.`,
      choices: [`${label} focus A`, `${label} focus B`, `${label} focus x`],
      distractors: [`${label} focus x`],
      answer: [`${label} focus A`, `${label} focus B`],
    },
    build: {
      promptChinese: `${label} build`,
      chunks: [`${label} build A`, `${label} build B`, `${label} build C`],
      distractors: [`${label} build x`],
      answer: [`${label} build A`, `${label} build B`, `${label} build C`],
    },
    quickResponse: {
      question: `${label} question`,
      chunks: [`${label} quick A`, `${label} quick B`, `${label} quick C`],
      distractors: [`${label} quick x`],
      answer: [`${label} quick A`, `${label} quick B`, `${label} quick C`],
    },
  };
}

function makeExpressionPack(id, coreExpression) {
  return {
    id,
    coreExpression,
    meaningChinese: `${coreExpression} 的中文意思`,
    baseExample: makeExample(`${coreExpression} base`),
    variations: [makeExample(`${coreExpression} variation`)],
  };
}

function buildExampleLevelQuickResponsePayload() {
  const payload = buildValidDeepCoursePayload();

  payload.modules.notice.expressionPacks = [
    makeExpressionPack("notice-1", "a coffee mug"),
    makeExpressionPack("notice-2", "a laptop"),
  ];
  payload.modules.interpret.expressionPacks = [
    makeExpressionPack("interpret-1", "a quiet work setup"),
    makeExpressionPack("interpret-2", "ready for work"),
  ];

  return payload;
}

test("deep codex provider builds the deep prompt and normalizes the result", async () => {
  const prompts = [];
  const provider = createDeepCodexCliProvider({
    model: "test-model",
    runCliPrompt: async ({ prompt }) => {
      prompts.push(prompt);
      return JSON.stringify(buildExampleLevelQuickResponsePayload());
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
  assert.match(prompts[0], /scenePromptChinese/);
  assert.match(prompts[0], /interact_need/);
  assert.match(prompts[0], /interact_handle/);
  assert.match(prompts[0], /systemReply inside each dialogue must be a bridge sentence/);
  assert.match(prompts[0], /continuous role-play in the same scene/);
  assert.match(prompts[0], /Every baseExample\.english and every variation\.english must visibly contain the exact coreExpression/i);
  assert.match(prompts[0], /Understand exercises must use Chinese chunks, Chinese distractors, and Chinese answers/i);
  assert.match(prompts[0], /Understand chunks must be natural Chinese phrases and contain 3 to 6 chunks/i);
  assert.match(prompts[0], /Build chunks and Quick Response chunks must be natural English phrases and contain 3 to 6 chunks/i);
  assert.match(prompts[0], /Never use English chunks in Understand/i);
  assert.match(prompts[0], /REQUIRED INNER SHAPES:/);
  assert.match(prompts[0], /Quick Response attached to each baseExample and variation/);
  assert.match(prompts[0], /UNDERSTAND EXAMPLE:/);
  assert.match(prompts[0], /"quickResponse": \{/);
  assert.equal(course.mode, "deep");
  assert.equal(course.level, "normal");
  assert.equal(course.modules.notice.expressionPacks[0].baseExample.quickResponse.question, "a coffee mug base question");
  assert.equal(course.modules.interpret.expressionPacks[1].variations[0].quickResponse.question, "ready for work variation question");
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
