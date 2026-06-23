import { test } from "node:test";
import assert from "node:assert/strict";
import { findDeepTextMatchRange, normalizeDeepText } from "./deep-text.js";

test("normalizeDeepText removes punctuation and collapses spaces", () => {
  assert.equal(normalizeDeepText("  Can we fit everyone in?  "), "can we fit everyone in");
});

test("findDeepTextMatchRange matches across punctuation differences", () => {
  const sentence = "Can we fit everyone in before we take it?";
  const highlight = "Can we fit everyone in?";

  const range = findDeepTextMatchRange(sentence, highlight);

  assert.deepEqual(range, { start: 0, end: 22 });
  assert.equal(sentence.slice(range.start, range.end), "Can we fit everyone in");
});

test("findDeepTextMatchRange matches with extra spacing", () => {
  const sentence = "A bright blue sky fills most of the background.";
  const highlight = "bright   blue sky";

  const range = findDeepTextMatchRange(sentence, highlight);

  assert.equal(sentence.slice(range.start, range.end), "bright blue sky");
});
