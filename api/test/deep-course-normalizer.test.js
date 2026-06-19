import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeDeepCoursePayload } from "../src/deep/services/course-normalizer.js";

const validCourse = {
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
};

test("normalizeDeepCoursePayload accepts the canonical deep course shape", () => {
  const normalized = normalizeDeepCoursePayload(validCourse);
  assert.equal(normalized.mode, "deep");
  assert.equal(normalized.level, "normal");
  assert.equal(normalized.overview.startPromptChinese, "点击开始这次学习之旅");
});

test("normalizeDeepCoursePayload rejects missing modules", () => {
  assert.throws(() =>
    normalizeDeepCoursePayload({
      ...validCourse,
      modules: {
        notice: validCourse.modules.notice,
        interpret: validCourse.modules.interpret,
        interact: validCourse.modules.interact,
      },
    }),
  );
});

test("normalizeDeepCoursePayload accepts focus-style exercises", () => {
  const normalized = normalizeDeepCoursePayload({
    ...validCourse,
    modules: {
      ...validCourse.modules,
      notice: {
        ...validCourse.modules.notice,
        expressionPacks: [
          {
            id: "notice-1",
            coreExpression: "next to",
            meaningChinese: "在……旁边",
            baseExample: {
              english: "A laptop is next to the mug.",
              chinese: "一台笔记本电脑在杯子旁边。",
              understand: {
                chunks: ["A laptop", "is next to", "the mug."],
                distractors: ["under the chair"],
                answer: ["A laptop", "is next to", "the mug."],
              },
              focus: {
                sentenceWithBlanks: "A laptop is ____ ____ the mug.",
                choices: ["next", "to", "under"],
                answer: ["next", "to"],
              },
              build: {
                promptChinese: "把中文变成英文：一台笔记本电脑在杯子旁边。",
                chunks: ["A laptop", "is next to", "the mug."],
                distractors: ["under the chair"],
                answer: ["A laptop", "is next to", "the mug."],
              },
            },
            variations: [],
            quickResponses: [],
          },
        ],
      },
    },
  });

  assert.equal(normalized.modules.notice.expressionPacks[0].baseExample.focus.sentenceWithBlanks, "A laptop is ____ ____ the mug.");
  assert.deepEqual(normalized.modules.notice.expressionPacks[0].baseExample.focus.answer, ["next", "to"]);
});
