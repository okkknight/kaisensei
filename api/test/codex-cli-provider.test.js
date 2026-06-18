import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPrompt } from "../src/services/lesson-prompt.js";
import { normalizeLessonPayload } from "../src/services/lesson-normalizer.js";
import { repairBuildExercise } from "../src/services/build-chunking.js";

test("normalizeLessonPayload rejects missing required fields", () => {
  assert.throws(() => normalizeLessonPayload({ level: "Normal" }));
});

test("buildPrompt asks for richer See and Learn output", () => {
  const prompt = buildPrompt("Advanced");

  assert.match(prompt, /See must be a single natural sentence only\./);
  assert.match(prompt, /Advanced tone:/);
  assert.match(prompt, /higher-level but common vocabulary and collocations/i);
  assert.match(prompt, /IELTS, TOEFL, work, study, or travel contexts/i);
  assert.match(prompt, /Target about 16-22 words/);
  assert.match(prompt, /do not make it sound academic, literary, or essay-like/i);
  assert.match(prompt, /Do not add extra keys beyond the required JSON shape\./);
  assert.match(prompt, /Learn chunks should be cut naturally from the sentence/i);
  assert.match(prompt, /learn\.note must be one short Chinese sentence/i);
  assert.match(prompt, /learn\.note and every field named chinese must be Chinese only/i);
  assert.match(prompt, /Prefer short reusable phrases, usually 2-5 words/i);
  assert.match(prompt, /usually 3-4 for simple scenes and 4-5 for richer scenes/i);
  assert.match(prompt, /Do not mechanically slice the sentence clause by clause or into equal-looking pieces\./);
  assert.match(prompt, /merging obvious neighbors into one phrase/i);
  assert.match(prompt, /Avoid a single long modifier chain such as 'with colleagues visible in the background'/i);
  assert.match(prompt, /rebuild the sentence with natural-language chunks/i);
  assert.match(prompt, /not copied one-for-one from Learn/i);
  assert.match(prompt, /subject, verb, object, adverb, and prepositional phrase boundaries/i);
  assert.match(prompt, /Build chunks should also stay short and natural, usually 2-6 words/i);
  assert.match(prompt, /Keep fixed collocations intact when they sound natural as one unit\./i);
  assert.match(prompt, /slightly more challenging than Learn/i);
  assert.match(prompt, /Use must feel like a real conversation, not a generic prompt\./);
  assert.match(prompt, /Use step should present a specific person in a specific setting speaking to the user\./);
  assert.match(prompt, /speaker relationship or setting/i);
  assert.match(prompt, /Do not mention picture, photo, image, or scene in Use.question\./);
  assert.match(prompt, /Do not ask things like 'What are the people doing in this picture\?'/i);
  assert.match(prompt, /Prefer conversational follow-ups such as a reaction, opinion, confirmation, or a simple personal answer\./);
  assert.match(prompt, /Use\.targetAnswer must naturally reuse 1-2 chunks or collocations from Learn\.chunks/i);
  assert.match(prompt, /should add at least one new idea, reaction, opinion, or personal detail/i);
  assert.match(prompt, /The Use answer should stay grounded in the same visible scene/);
  assert.match(prompt, /Learn should select 3-5 high-value chunks, usually 3-4 for simple scenes and 4-5 for richer scenes\./);
});

test("buildPrompt keeps Normal output simple and direct", () => {
  const prompt = buildPrompt("Normal");

  assert.match(prompt, /Normal tone:/);
  assert.match(prompt, /keep the sentence short and natural, usually about 12-16 words/i);
  assert.match(prompt, /Avoid extra decoration, stacked clauses, or fancy phrasing\./);
});

test("repairBuildExercise splits trailing adverbs off awkward build chunks", () => {
  const exercise = repairBuildExercise([
    { id: "b1", text: "Three travelers", chinese: "三个旅行者" },
    { id: "b2", text: "stand in the shade", chinese: "站在阴凉处" },
    { id: "b3", text: "while crossing", chinese: "在穿过时" },
    { id: "b4", text: "a sunny desert together", chinese: "一片阳光炙热的沙漠里一起" },
  ], [
    { id: "l1", text: "Three travelers", chinese: "三个旅行者" },
    { id: "l2", text: "stand in the shade", chinese: "站在阴凉处" },
    { id: "l3", text: "while crossing", chinese: "在穿过时" },
    { id: "l4", text: "a sunny desert together", chinese: "一片阳光炙热的沙漠里一起" },
  ]);

  assert.deepEqual(
    exercise.chunks.map((chunk) => chunk.text),
    ["Three travelers", "stand in the shade", "while crossing", "a sunny desert", "together"],
  );
  assert.equal(exercise.chunks.at(-1).chinese, "一起");
});

test("normalizeLessonPayload rebuilds build chunks naturally from the sentence", () => {
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
      { id: "b3", text: "by the sea together", chinese: "在海边一起" },
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
  assert.deepEqual(lesson.build.chunks.map((chunk) => chunk.text), [
    "Three friends",
    "are leaning into the frame",
    "by the sea",
    "together",
  ]);
  assert.equal(lesson.build.chunks[2].chinese, "在海边");
  assert.equal(lesson.build.chunks[3].chinese, "一起");
});
