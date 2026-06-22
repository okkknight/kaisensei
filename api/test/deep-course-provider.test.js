import { test } from "node:test";
import assert from "node:assert/strict";
import { createDeepCodexCliProvider } from "../src/deep/services/deep-codex-cli-provider.js";
import { createProviderRegistry } from "../src/services/provider-registry.js";
import { buildDeepCoursePrompt } from "../src/deep/services/course-prompt.js";
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
  assert.match(prompts[0], /You are a senior English teacher and lesson designer\./);
  assert.match(prompts[0], /Teach English from the photo, not a caption of the photo\./);
  assert.match(prompts[0], /A coreExpression is a learnable chunk: a high-frequency word, practical collocation, fixed expression, or useful phrase\./);
  assert.match(prompts[0], /Prefer phrase-level expressions\. Avoid full sentences, long clauses, or caption-like descriptions\./);
  assert.match(prompts[0], /The coreExpression may appear anywhere in the sentence\. Do not always place it at the beginning\./);
  assert.match(prompts[0], /For Notice, cover different visible aspects such as objects, positions, actions, states, or spatial relations\./);
  assert.match(prompts[0], /For Interpret, cover different inference angles such as situation, mood, purpose, reason, or readiness\./);
  assert.match(prompts[0], /For Interact, each task pack should teach a different interaction goal or response pattern\./);
  assert.match(prompts[0], /Need and Handle should both be short, reusable, and easy to say aloud\./);
  assert.match(prompts[0], /Create one continuous role-play in the same scene\./);
  assert.match(prompts[0], /Each user turn must use a canonical sourceModule value from notice, interpret, interact_need, or interact_handle\./);
  assert.match(prompts[0], /COURSE CONFIG:/);
  assert.match(prompts[0], /"overviewKeywordCount": 3/);
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
  assert.match(prompts[0], /systemReply inside each dialogue must be one short natural line of dialogue from the other person in the scene\./);
  assert.match(prompts[0], /continuous role-play in the same scene/);
  assert.match(prompts[0], /Understand uses Chinese-only chunks\./i);
  assert.match(prompts[0], /Build and Quick Response chunks are English phrases only\./i);
  assert.match(prompts[0], /No碎片词块, no filler chunks, no equal-sized mechanical slicing\./i);
  assert.match(prompts[0], /Do not create a chunk just to satisfy count if a natural chunk would read better after re-segmentation\./i);
  assert.doesNotMatch(prompts[0], /short clause/i);
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

test("deep prompt uses different level tuning for normal and advanced lessons", () => {
  const normalPrompt = buildDeepCoursePrompt({ level: "Normal" });
  const advancedPrompt = buildDeepCoursePrompt({ level: "Advanced" });

  assert.match(normalPrompt, /LEVEL TUNING:/);
  assert.match(normalPrompt, /Normal tone:/);
  assert.match(normalPrompt, /clearest, most direct wording for the scene/i);
  assert.doesNotMatch(normalPrompt, /Advanced tone:/);

  assert.match(advancedPrompt, /LEVEL TUNING:/);
  assert.match(advancedPrompt, /Advanced tone:/);
  assert.match(advancedPrompt, /more polished, natural expression/i);
  assert.doesNotMatch(advancedPrompt, /Normal tone:/);
});
