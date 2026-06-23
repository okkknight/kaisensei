import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDeepCoursePayload } from "../src/deep/services/course-normalizer.js";
import { buildValidDeepCoursePayload } from "./deep-course-fixture.js";

function makeExample(label) {
  return {
    english: `${label} english`,
    chinese: `${label} 中文`,
    understand: {
      chunks: [`${label} 中文词块甲`, `${label} 中文词块乙`, `${label} 中文词块丙`],
      distractors: [`${label} 中文干扰词`],
      answer: [`${label} 中文词块甲`, `${label} 中文词块乙`, `${label} 中文词块丙`],
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
      questionChinese: `${label} 中文问题`,
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

test("normalizeDeepCoursePayload accepts the canonical deep course shape", () => {
  const normalized = normalizeDeepCoursePayload(buildValidDeepCoursePayload());
  assert.equal(normalized.mode, "deep");
  assert.equal(normalized.level, "normal");
  assert.equal(normalized.overview.startPromptChinese, "点击开始这次学习之旅");
  assert.equal(normalized.overview.keywords.length, 3);
  assert.equal(normalized.modules.interact.taskPacks[0].scenePromptChinese, "task one 场景中文");
  assert.equal(normalized.modules.notice.expressionPacks.length, 3);
  assert.equal(normalized.modules.interpret.expressionPacks.length, 3);
  assert.equal(normalized.modules.interact.taskPacks.length, 2);
  assert.equal(normalized.modules.stepIn.dialogue.sceneChinese, "桌边有一位同事在旁边。");
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

  assert.equal(normalized.modules.notice.expressionPacks[0].baseExample.quickResponse.questionChinese, "a coffee mug base 中文问题");
  assert.equal(normalized.modules.notice.expressionPacks[0].baseExample.quickResponse.question, "a coffee mug base question");
  assert.equal(normalized.modules.notice.expressionPacks[1].baseExample.quickResponse.question, "a laptop base question");
  assert.equal(normalized.modules.notice.expressionPacks[2].baseExample.quickResponse.question, "on the desk base question");
});

test("normalizeDeepCoursePayload rejects base examples that do not visibly contain their core expression", () => {
  const payload = buildValidDeepCoursePayload();
  payload.modules.notice.expressionPacks[0].baseExample.english = "A mug is on the desk.";

  assert.throws(() => normalizeDeepCoursePayload(payload), /visibly contain its coreExpression/i);
});

test("normalizeDeepCoursePayload rejects variations that do not visibly contain their core expression", () => {
  const payload = buildValidDeepCoursePayload();
  payload.modules.interpret.expressionPacks[0].variations = [makeExample("interpret bad variation")];
  payload.modules.interpret.expressionPacks[0].variations[0].english = "The desk feels calm and focused.";

  assert.throws(() => normalizeDeepCoursePayload(payload), /visibly contain its coreExpression/i);
});

test("normalizeDeepCoursePayload rejects understand chunks that are not Chinese", () => {
  const payload = buildValidDeepCoursePayload();
  payload.modules.interpret.expressionPacks[0].baseExample.understand.chunks = [
    "It looks like",
    "someone is checking",
    "the project setup",
  ];
  payload.modules.interpret.expressionPacks[0].baseExample.understand.distractors = ["a quick break"];
  payload.modules.interpret.expressionPacks[0].baseExample.understand.answer = [
    "It looks like",
    "someone is checking",
    "the project setup",
  ];

  assert.throws(() => normalizeDeepCoursePayload(payload), /Expected Chinese chunk/i);
});

test("normalizeDeepCoursePayload accepts short build chunk sets when they are otherwise valid", () => {
  const payload = buildValidDeepCoursePayload();
  payload.modules.notice.expressionPacks[0].baseExample.build.chunks = ["A coffee mug", "is next to"];
  payload.modules.notice.expressionPacks[0].baseExample.build.answer = ["A coffee mug", "is next to"];

  const normalized = normalizeDeepCoursePayload(payload);

  assert.equal(normalized.modules.notice.expressionPacks[0].baseExample.build.chunks.length, 2);
});

test("normalizeDeepCoursePayload canonicalizes stepIn sourceModule aliases", () => {
  const payload = buildValidDeepCoursePayload();
  payload.modules.stepIn.dialogue.turns[5].sourceModule = "need";
  payload.modules.stepIn.dialogue.turns[7].sourceModule = "handle";

  const normalized = normalizeDeepCoursePayload(payload);

  assert.equal(normalized.modules.stepIn.dialogue.turns[5].sourceModule, "interact_need");
  assert.equal(normalized.modules.stepIn.dialogue.turns[7].sourceModule, "interact_handle");
});

test("normalizeDeepCoursePayload rejects dialogue system replies that expose the learned handle", () => {
  const payload = buildValidDeepCoursePayload();
  const handleCoreExpression = payload.modules.interact.taskPacks[0].handle.coreExpression;
  payload.modules.interact.taskPacks[0].dialogues[0].systemReply = `Please ${handleCoreExpression}.`;

  assert.throws(() => normalizeDeepCoursePayload(payload), /bridge line/i);
});
