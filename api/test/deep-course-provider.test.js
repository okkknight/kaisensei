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
    variations: [],
  };
}

function buildExampleLevelQuickResponsePayload() {
  const payload = buildValidDeepCoursePayload();

  payload.modules.notice.expressionPacks = [
    makeExpressionPack("notice-1", "a coffee mug"),
    makeExpressionPack("notice-2", "a laptop"),
    makeExpressionPack("notice-3", "on the desk"),
  ];
  payload.modules.interpret.expressionPacks = [
    makeExpressionPack("interpret-1", "a quiet work setup"),
    makeExpressionPack("interpret-2", "ready for work"),
    makeExpressionPack("interpret-3", "feels calm"),
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
  assert.match(prompts[0], /You are an English teaching model, not a photo captioner\./);
  assert.match(prompts[0], /Core expressions are the key knowledge points taught to the learner\./);
  assert.match(prompts[0], /Choose core expressions that are worth learning: high-frequency, practical, reusable in life, and common enough to matter, but not childish or too trivial\./);
  assert.match(prompts[0], /COURSE CONFIG:/);
  assert.match(prompts[0], /"overviewKeywordCount": 3/);
  assert.match(prompts[0], /QUALITY RULES:/);
  assert.match(prompts[0], /CORE EXPRESSION RULES:/);
  assert.match(prompts[0], /CHUNK RULES:/);
  assert.match(prompts[0], /If two candidates feel similar, pick the one that is more concrete and easier to say in real life\./);
  assert.match(prompts[0], /Same-module packs must be clearly different; do not create a new pack by only rewording the same thing\./);
  assert.match(prompts[0], /Notice core expressions should come from different visible things, positions, actions, or states\./);
  assert.match(prompts[0], /Interpret core expressions should come from different inference angles such as state, feeling, plausible guess, or reason\./);
  assert.match(prompts[0], /Interact core expressions should come from different needs, responses, or realistic intentions\./);
  assert.match(prompts[0], /Prefer specific, scene-based expressions over generic labels\./);
  assert.match(prompts[0], /Notice examples should cover different visible aspects of the scene when possible\./);
  assert.match(prompts[0], /Interpret examples should explore different inference angles, not just the same sentence with a new noun\./);
  assert.match(prompts[0], /Keep the inference specific to this photo instead of using a generic filler opener\./);
  assert.match(prompts[0], /Need should sound like an actual request a person might say in the scene\./);
  assert.match(prompts[0], /Handle should sound like a real reply, short and reactive, not a translation of the prompt\./);
  assert.match(prompts[0], /Interact packs must differ by request type or response type, not just wording\./);
  assert.match(prompts[0], /Every baseExample\.english and every variation\.english must visibly contain the exact coreExpression\./i);
  assert.match(prompts[0], /Do not replace the coreExpression with a synonym, pronoun, abbreviation, or looser paraphrase\./i);
  assert.match(prompts[0], /Generate exactly 3 Notice Expression Packs\./);
  assert.match(prompts[0], /Generate exactly 2 Task Packs\./);
  assert.match(prompts[0], /Generate exactly 0 variations per Notice Expression Pack\./);
  assert.match(prompts[0], /Generate exactly 0 variations per Interpret Expression Pack\./);
  assert.match(prompts[0], /Generate exactly 0 Need variations per Task Pack\./);
  assert.match(prompts[0], /Generate exactly 0 Handle variations per Task Pack\./);
  assert.match(prompts[0], /Use the fixed Chinese start prompt: 点击开始这次学习之旅\./);
  assert.match(prompts[0], /scenePromptChinese/);
  assert.match(prompts[0], /interact_need/);
  assert.match(prompts[0], /interact_handle/);
  assert.match(prompts[0], /systemReply inside each dialogue must be a bridge sentence/);
  assert.match(prompts[0], /continuous role-play in the same scene/);
  assert.match(prompts[0], /Understand uses Chinese-only chunks\./i);
  assert.match(prompts[0], /Build and Quick Response chunks are English phrases only\./i);
  assert.match(prompts[0], /No碎片词块, no filler chunks, no equal-sized mechanical slicing\./i);
  assert.match(prompts[0], /Do not create a chunk just to satisfy count if a natural chunk would read better after re-segmentation\./i);
  assert.match(prompts[0], /REQUIRED INNER SHAPES:/);
  assert.match(prompts[0], /UNDERSTAND EXAMPLE:/);
  assert.match(prompts[0], /"quickResponse": \{/);
  assert.equal(course.mode, "deep");
  assert.equal(course.level, "normal");
  assert.equal(course.modules.notice.expressionPacks[0].baseExample.quickResponse.question, "a coffee mug base question");
  assert.equal(course.modules.notice.expressionPacks[2].baseExample.quickResponse.question, "on the desk base question");
  assert.equal(course.modules.interpret.expressionPacks[1].baseExample.quickResponse.question, "ready for work base question");
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
