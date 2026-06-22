import { test } from "node:test";
import assert from "node:assert/strict";
import { buildExercisePages } from "./useDeepExerciseSequence.js";
import { buildShuffledChunkBank } from "./deep-flow-utils.js";

function makeExample(label) {
  return {
    english: `${label} english`,
    chinese: `${label} 中文`,
    understand: {
      chunks: [`${label} understand`],
      distractors: [`${label} understand x`],
      answer: [`${label} understand`],
      highlight: `${label} highlight`,
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
    quickResponse: {
      question: `${label} question`,
      chunks: [`${label} quick`],
      distractors: [`${label} quick x`],
      answer: [`${label} quick`],
    },
  };
}

function makePack(id, coreExpression) {
  return {
    id,
    coreExpression,
    baseExample: makeExample(`${coreExpression} base`),
    variations: [makeExample(`${coreExpression} variation`)],
  };
}

test("buildExercisePages orders Notice and Interpret by example index first, then exercise type", () => {
  const pages = buildExercisePages([makePack("p1", "core one"), makePack("p2", "core two")], "notice");

  assert.deepEqual(
    pages.map((page) => page.id),
    [
      "p1-core one base english-understand",
      "p2-core two base english-understand",
      "p1-core one base english-focus",
      "p2-core two base english-focus",
      "p1-core one variation english-understand",
      "p2-core two variation english-understand",
      "p1-core one variation english-focus",
      "p2-core two variation english-focus",
      "p1-core one base english-build",
      "p2-core two base english-build",
      "p1-core one base english-quick-response",
      "p2-core two base english-quick-response",
      "p1-core one variation english-build",
      "p2-core two variation english-build",
      "p1-core one variation english-quick-response",
      "p2-core two variation english-quick-response",
    ]
  );
});

test("buildExercisePages uses the pack core expression for understand page highlighting", () => {
  const pages = buildExercisePages([makePack("p1", "core one")], "notice");

  assert.equal(pages[0].englishHighlight, "core one");
});

test("buildExercisePages shuffles deep reorder banks instead of keeping source order", () => {
  const pages = buildExercisePages([makePack("p1", "core one")], "notice");
  const rawBank = ["core one base understand", "core one base understand x"];
  const expectedBank = buildShuffledChunkBank(rawBank, "p1:core one base english:understand");

  assert.deepEqual(pages[0].bank, expectedBank);
  assert.notDeepEqual(pages[0].bank, rawBank);
});
