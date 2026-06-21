import { test } from "node:test";
import assert from "node:assert/strict";
import { buildExercisePages } from "./useDeepExerciseSequence.js";

function makeExample(label) {
  return {
    english: `${label} english`,
    chinese: `${label} 中文`,
    understand: {
      chunks: [`${label} understand`],
      distractors: [`${label} understand x`],
      answer: [`${label} understand`],
    },
    focus: {
      sentenceWithBlanks: `${label} ____ ____`,
      choices: [`${label} focus`],
      distractors: [`${label} focus x`],
      answer: [`${label} focus`],
    },
    build: {
      promptChinese: `${label} build`,
      chunks: [`${label} build`],
      distractors: [`${label} build x`],
      answer: [`${label} build`],
    },
  };
}

function makePack(id, coreExpression) {
  return {
    id,
    coreExpression,
    baseExample: makeExample(`${coreExpression} base`),
    variations: [makeExample(`${coreExpression} variation`)],
    quickResponses: [
      {
        question: `${coreExpression} question`,
        chunks: [`${coreExpression} quick`],
        distractors: [`${coreExpression} quick x`],
        answer: [`${coreExpression} quick`],
      },
    ],
  };
}

test("buildExercisePages groups Notice and Interpret exercises by step type first", () => {
  const pages = buildExercisePages([makePack("p1", "core one"), makePack("p2", "core two")], "notice");

  assert.deepEqual(
    pages.map((page) => page.id),
    [
      "p1-core one base english-understand",
      "p2-core two base english-understand",
      "p1-core one variation english-understand",
      "p2-core two variation english-understand",
      "p1-core one base english-focus",
      "p2-core two base english-focus",
      "p1-core one variation english-focus",
      "p2-core two variation english-focus",
      "p1-core one base english-build",
      "p2-core two base english-build",
      "p1-core one variation english-build",
      "p2-core two variation english-build",
      "p1-quick-response-0",
      "p2-quick-response-0",
    ]
  );
});
