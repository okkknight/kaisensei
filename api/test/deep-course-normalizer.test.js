import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDeepCoursePayload } from "../src/deep/services/course-normalizer.js";
import { buildValidDeepCoursePayload } from "./deep-course-fixture.js";

function makeExample(label) {
  return {
    english: `${label} english`,
    chinese: `${label} 中文`,
    understand: {
      chunks: [`${label} understand A`, `${label} understand B`],
      distractors: [`${label} understand x`],
      answer: [`${label} understand A`, `${label} understand B`],
    },
    focus: {
      sentenceWithBlanks: `${label} ____ ____ the desk.`,
      choices: [`${label} focus A`, `${label} focus B`, `${label} focus x`],
      distractors: [`${label} focus x`],
      answer: [`${label} focus A`, `${label} focus B`],
    },
    build: {
      promptChinese: `${label} build`,
      chunks: [`${label} build A`, `${label} build B`],
      distractors: [`${label} build x`],
      answer: [`${label} build A`, `${label} build B`],
    },
    quickResponse: {
      question: `${label} question`,
      chunks: [`${label} quick`],
      distractors: [`${label} quick x`],
      answer: [`${label} quick`],
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

test("normalizeDeepCoursePayload accepts the canonical deep course shape", () => {
  const normalized = normalizeDeepCoursePayload(buildValidDeepCoursePayload());
  assert.equal(normalized.mode, "deep");
  assert.equal(normalized.level, "normal");
  assert.equal(normalized.overview.startPromptChinese, "点击开始这次学习之旅");
  assert.equal(normalized.overview.keywords.length, 3);
  assert.equal(normalized.modules.notice.expressionPacks.length, 2);
  assert.equal(normalized.modules.interpret.expressionPacks.length, 2);
  assert.equal(normalized.modules.interact.taskPacks.length, 2);
  assert.equal(normalized.modules.stepIn.dialogue.turns.length, 8);
});

test("normalizeDeepCoursePayload rejects missing modules", () => {
  const payload = buildValidDeepCoursePayload();
  delete payload.modules.interact;

  assert.throws(() => normalizeDeepCoursePayload(payload));
});

test("normalizeDeepCoursePayload accepts focus-style exercises", () => {
  const payload = buildValidDeepCoursePayload();
  payload.modules.notice.expressionPacks[0].baseExample.focus = {
    sentenceWithBlanks: "A laptop is ____ ____ the mug.",
    choices: ["next", "to", "under"],
    distractors: ["under"],
    answer: ["next", "to"],
  };

  const normalized = normalizeDeepCoursePayload(payload);
  assert.equal(normalized.modules.notice.expressionPacks[0].baseExample.focus.sentenceWithBlanks, "A laptop is ____ ____ the mug.");
  assert.deepEqual(normalized.modules.notice.expressionPacks[0].baseExample.focus.answer, ["next", "to"]);
});

test("normalizeDeepCoursePayload accepts quick responses on each example", () => {
  const normalized = normalizeDeepCoursePayload(buildExampleLevelQuickResponsePayload());

  assert.equal(normalized.modules.notice.expressionPacks[0].baseExample.quickResponse.question, "a coffee mug base question");
  assert.equal(normalized.modules.notice.expressionPacks[0].variations[0].quickResponse.question, "a coffee mug variation question");
  assert.equal(normalized.modules.notice.expressionPacks[1].baseExample.quickResponse.question, "a laptop base question");
});

test("normalizeDeepCoursePayload rejects dialogue system replies that expose the learned handle", () => {
  const payload = buildValidDeepCoursePayload();
  const handleCoreExpression = payload.modules.interact.taskPacks[0].handle.coreExpression;
  payload.modules.interact.taskPacks[0].dialogues[0].systemReply = `Please ${handleCoreExpression}.`;

  assert.throws(() => normalizeDeepCoursePayload(payload), /bridge sentence/i);
});
