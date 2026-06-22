import { test } from "node:test";
import assert from "node:assert/strict";
import { buildInteractPages } from "./useDeepInteractFlow.js";
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
  };
}

function makeTaskPack(id, label) {
  return {
    id,
    taskTitle: `${label} task`,
    scenePrompt: `${label} scene`,
    need: {
      coreExpression: `${label} need`,
      meaningChinese: `${label} 需求`,
      baseExample: makeExample(`${label} need base`),
      variations: [makeExample(`${label} need variation`)],
    },
    handle: {
      coreExpression: `${label} handle`,
      meaningChinese: `${label} 应对`,
      baseExample: makeExample(`${label} handle base`),
      variations: [makeExample(`${label} handle variation`)],
    },
    dialogues: [
      {
        scene: `${label} dialogue scene`,
        openingLine: `${label} opening`,
        need: { chunks: ["need"], distractors: ["x"], answer: ["need"] },
        systemReply: `${label} reply`,
        handle: { chunks: ["handle"], distractors: ["x"], answer: ["handle"] },
      },
    ],
  };
}

test("buildInteractPages interleaves need and handle by example within each task", () => {
  const pages = buildInteractPages([makeTaskPack("task-1", "task one"), makeTaskPack("task-2", "task two")]);

  assert.deepEqual(
    pages.map((page) => page.id),
    [
      "task-1-guide",
      "task-1-need-task one need base english-understand",
      "task-1-handle-task one handle base english-understand",
      "task-1-need-task one need variation english-understand",
      "task-1-handle-task one handle variation english-understand",
      "task-1-need-task one need base english-focus",
      "task-1-handle-task one handle base english-focus",
      "task-1-need-task one need variation english-focus",
      "task-1-handle-task one handle variation english-focus",
      "task-1-need-task one need base english-build",
      "task-1-handle-task one handle base english-build",
      "task-1-need-task one need variation english-build",
      "task-1-handle-task one handle variation english-build",
      "task-1-dialogue-need",
      "task-1-dialogue-handle",
      "task-2-guide",
      "task-2-need-task two need base english-understand",
      "task-2-handle-task two handle base english-understand",
      "task-2-need-task two need variation english-understand",
      "task-2-handle-task two handle variation english-understand",
      "task-2-need-task two need base english-focus",
      "task-2-handle-task two handle base english-focus",
      "task-2-need-task two need variation english-focus",
      "task-2-handle-task two handle variation english-focus",
      "task-2-need-task two need base english-build",
      "task-2-handle-task two handle base english-build",
      "task-2-need-task two need variation english-build",
      "task-2-handle-task two handle variation english-build",
      "task-2-dialogue-need",
      "task-2-dialogue-handle",
    ]
  );
});

test("buildInteractPages uses the section core expression for understand page highlighting", () => {
  const pages = buildInteractPages([makeTaskPack("task-1", "task one")]);

  assert.equal(pages[1].englishHighlight, "task one need");
  assert.equal(pages[2].englishHighlight, "task one handle");
});

test("buildInteractPages shuffles deep reorder banks instead of keeping source order", () => {
  const pages = buildInteractPages([makeTaskPack("task-1", "task one")]);
  const rawBank = ["task one need base understand", "task one need base understand x"];
  const expectedBank = buildShuffledChunkBank(rawBank, "task-1:need:task one need base english:understand");

  assert.deepEqual(pages[1].bank, expectedBank);
  assert.notDeepEqual(pages[1].bank, rawBank);
});
