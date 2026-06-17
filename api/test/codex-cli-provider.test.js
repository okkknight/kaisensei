import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPrompt } from "../src/services/codex-cli-provider.js";
import { normalizeLessonPayload } from "../src/services/lesson-normalizer.js";

test("normalizeLessonPayload rejects missing required fields", () => {
  assert.throws(() => normalizeLessonPayload({ level: "Normal" }));
});

test("buildPrompt asks for richer See and Learn output", () => {
  const prompt = buildPrompt("Advanced");

  assert.match(prompt, /See must be a single natural sentence only\./);
  assert.match(prompt, /Normal should be around 15 words/);
  assert.match(prompt, /Advanced should be around 20 words/);
  assert.match(prompt, /Do not add extra clauses or extra sentences/);
  assert.match(prompt, /Learn should select 3-5 high-value chunks, not every possible fragment\./);
});

test("normalizeLessonPayload requires build.targetSentence to match see.sentence exactly", () => {
  const lesson = normalizeLessonPayload({
    level: "Advanced",
    see: {
      sentence: "Three friends are leaning into the frame by the sea.",
      chinese: "三个人凑在镜头前，身后是海面。",
      speakText: "Three friends are leaning into the frame by the sea.",
    },
    learn: {
      chunks: [
      { id: "l1", text: "three friends", chinese: "三个朋友" },
      { id: "l2", text: "leaning into the frame", chinese: "凑到镜头前" },
      { id: "l3", text: "by the sea", chinese: "在海边" },
    ],
    note: "Lean on a vivid action phrase to make the scene feel alive.",
  },
  build: {
    targetSentence: "Three friends are leaning into the frame by the sea.",
    chunks: [
      { id: "b1", text: "Three friends", chinese: "三个朋友" },
      { id: "b2", text: "are leaning into the frame", chinese: "凑到镜头前" },
      { id: "b3", text: "by the sea", chinese: "在海边" },
    ],
    correctOrder: ["b1", "b2", "b3"],
  },
  use: {
    situation: "Talking about a group photo at the beach",
    question: "How would you describe the scene?",
    targetAnswer: "Three friends are leaning into the frame by the sea.",
    answerChunks: [
      { id: "u1", text: "Three friends", chinese: "三个朋友" },
      { id: "u2", text: "are leaning into the frame", chinese: "凑到镜头前" },
      { id: "u3", text: "by the sea", chinese: "在海边" },
    ],
    correctOrder: ["u1", "u2", "u3"],
    speakText: "Three friends are leaning into the frame by the sea.",
  },
  });

  assert.equal(lesson.build.targetSentence, "Three friends are leaning into the frame by the sea.");
  assert.equal(lesson.see.sentence, "Three friends are leaning into the frame by the sea.");
});
