import { test } from "node:test";
import assert from "node:assert/strict";
import { buildShuffledChunkBank } from "./deep-flow-utils.js";
import { buildStepInPages, shouldStageStepInPrompt } from "./useDeepStepInFlow.js";

test("buildStepInPages shuffles turn banks instead of keeping source order", () => {
  const turns = [
    {
      speaker: "system",
      text: "system intro",
      chunks: [],
      distractors: [],
      answer: [],
    },
    {
      speaker: "user",
      text: "user reply",
      sourceModule: "notice",
      chunks: ["turn one chunk", "turn one chunk x"],
      distractors: ["turn one chunk y"],
      answer: ["turn one chunk"],
    },
  ];

  const pages = buildStepInPages({ title: "Step In", goal: "", scene: "scene", sceneChinese: "场景中文", turns });
  const rawBank = ["turn one chunk", "turn one chunk x", "turn one chunk y"];
  const expectedBank = buildShuffledChunkBank(rawBank, "step-in:1:user reply");

  assert.equal(pages[0].sceneChinese, "场景中文");
  assert.equal(pages.some((page) => page.kind === "complete"), false);
  assert.deepEqual(pages[1].bank, expectedBank);
  assert.notDeepEqual(pages[1].bank, rawBank);
});

test("buildStepInPages carries the next system line as a bridge reply", () => {
  const turns = [
    {
      speaker: "system",
      text: "system intro",
      chunks: [],
      distractors: [],
      answer: [],
    },
    {
      speaker: "user",
      text: "user reply",
      sourceModule: "notice",
      chunks: ["turn one chunk"],
      distractors: [],
      answer: ["turn one chunk"],
    },
    {
      speaker: "system",
      text: "bridge reply",
      chunks: [],
      distractors: [],
      answer: [],
    },
    {
      speaker: "user",
      text: "second reply",
      sourceModule: "interpret",
      chunks: ["turn two chunk"],
      distractors: [],
      answer: ["turn two chunk"],
    },
  ];

  const pages = buildStepInPages({ title: "Step In", goal: "", scene: "scene", sceneChinese: "场景中文", turns });

  assert.equal(pages[1].bridgeReply, "bridge reply");
  assert.equal(pages[2].bridgeReply, "");
});

test("shouldStageStepInPrompt only stages the very first system prompt", () => {
  assert.equal(
    shouldStageStepInPrompt([
      {
        speaker: "system",
        text: "system intro",
      },
    ]),
    true,
  );

  assert.equal(
    shouldStageStepInPrompt([
      {
        speaker: "system",
        text: "system intro",
      },
      {
        speaker: "user",
        text: "user reply",
      },
      {
        speaker: "system",
        text: "bridge reply",
      },
    ]),
    false,
  );
});
