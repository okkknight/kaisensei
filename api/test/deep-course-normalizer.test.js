import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDeepCoursePayload } from "../src/deep/services/course-normalizer.js";
import { buildValidDeepCoursePayload } from "./deep-course-fixture.js";

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
