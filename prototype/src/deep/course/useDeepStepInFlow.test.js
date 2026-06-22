import { test } from "node:test";
import assert from "node:assert/strict";
import { buildShuffledChunkBank } from "./deep-flow-utils.js";
import { buildStepInPages } from "./useDeepStepInFlow.js";

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

  const pages = buildStepInPages({ title: "Step In", goal: "", scene: "scene", turns });
  const rawBank = ["turn one chunk", "turn one chunk x", "turn one chunk y"];
  const expectedBank = buildShuffledChunkBank(rawBank, "step-in:1:user reply");

  assert.deepEqual(pages[1].bank, expectedBank);
  assert.notDeepEqual(pages[1].bank, rawBank);
});
