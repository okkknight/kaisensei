import { test } from "node:test";
import assert from "node:assert/strict";
import { createDeepCodexCliProvider } from "../src/deep/services/deep-codex-cli-provider.js";
import { createProviderRegistry } from "../src/services/provider-registry.js";
import { buildDeepCoursePrompt } from "../src/deep/services/course-prompt.js";
import { buildDeepStagePrompt } from "../src/deep/services/staged-generation/deep-stage-prompt.js";
import { buildValidDeepCoursePayload } from "./deep-course-fixture.js";

function makeExample(label) {
  return {
    english: `${label} english`,
    chinese: `${label} 中文`,
    understand: {
      chunks: [`${label} 理解词块甲`, `${label} 理解词块乙`, `${label} 理解词块丙`],
      distractors: [`${label} 理解干扰词`],
      answer: [`${label} 理解词块甲`, `${label} 理解词块乙`, `${label} 理解词块丙`],
    },
    focus: {
      sentenceWithBlanks: `${label} ____ ____ the desk.`,
      choices: [`${label} focus A`, `${label} focus B`, `${label} focus x`],
      distractors: [`${label} focus x`],
      answer: [`${label} focus A`, `${label} focus B`],
    },
    build: {
      promptChinese: `${label} build`,
      chunks: [`${label} build A`, `${label} build B`, `${label} build C`],
      distractors: [`${label} build x`],
      answer: [`${label} build A`, `${label} build B`, `${label} build C`],
    },
    quickResponse: {
      questionChinese: `${label} 中文 question`,
      question: `${label} question`,
      chunks: [`${label} quick A`, `${label} quick B`, `${label} quick C`],
      distractors: [`${label} quick x`],
      answer: [`${label} quick A`, `${label} quick B`, `${label} quick C`],
    },
  };
}

function makeExpressionPack(id, coreExpression) {
  return {
    id,
    coreExpression,
    meaningChinese: `${coreExpression} 的中文意思`,
    baseExample: makeExample(`${coreExpression} base`),
    variations: [],
  };
}

function buildExampleLevelQuickResponsePayload() {
  const payload = buildValidDeepCoursePayload();

  payload.modules.notice.expressionPacks = [
    makeExpressionPack("notice-1", "a coffee mug"),
    makeExpressionPack("notice-2", "a laptop"),
    makeExpressionPack("notice-3", "on the desk"),
  ];
  payload.modules.interpret.expressionPacks = [
    makeExpressionPack("interpret-1", "a quiet work setup"),
    makeExpressionPack("interpret-2", "ready for work"),
    makeExpressionPack("interpret-3", "feels calm"),
  ];

  return payload;
}

test("deep codex provider builds the deep prompt and normalizes the result", async () => {
  const prompts = [];
  const provider = createDeepCodexCliProvider({
    model: "test-model",
    runCliPrompt: async ({ prompt }) => {
      prompts.push(prompt);
      return JSON.stringify(buildExampleLevelQuickResponsePayload());
    },
  });

  const course = await provider.generateLesson({
    imageBuffer: Buffer.from("fake-image"),
    mimeType: "image/jpeg",
    level: "Normal",
    traceId: "trace-deep",
  });

  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /You are the Deep Mode course generator for kaisensei/);
  assert.match(prompts[0], /You are a senior English teacher and lesson designer\./);
  assert.match(prompts[0], /Teach English from the photo, not a caption of the photo\./);
  assert.match(prompts[0], /A coreExpression is a learnable chunk: a high-frequency word, practical collocation, fixed expression, or useful phrase\./);
  assert.match(prompts[0], /Prefer phrase-level expressions\. Avoid full sentences, long clauses, or caption-like descriptions\./);
  assert.match(prompts[0], /The coreExpression may appear anywhere in the sentence\. Do not always place it at the beginning\./);
  assert.match(prompts[0], /For Notice, keep the packs focused on different visible aspects such as objects, positions, actions, states, or spatial relations\./);
  assert.match(prompts[0], /For Interpret, keep the packs focused on different inference angles such as situation, mood, purpose, reason, or readiness\./);
  assert.match(prompts[0], /Treat Interact as one learner-system-learner exchange in the same scene: the learner speaks as Need, the other person bridges, then the learner speaks again as Handle\./);
  assert.match(prompts[0], /Need opens the request from the photo scene and the task pack's scenePrompt\./);
  assert.match(prompts[0], /systemReply is the other person's bridge line\. It responds naturally and leaves room for the learner's next line\./);
  assert.match(prompts[0], /Handle is the learner's follow-up line\. It continues the same exchange and keeps the same request moving\./);
  assert.match(prompts[0], /Each Task Pack should teach a different interaction goal, request type, response type, or scene function\./);
  assert.match(prompts[0], /Need and Handle should both be short, reusable, and easy to say aloud\./);
  assert.doesNotMatch(prompts[0], /STEP IN TASK DEFINITION:/);
  assert.doesNotMatch(prompts[0], /EXPRESSION SELECTION ORDER:/);
  assert.doesNotMatch(prompts[0], /EIGHT-TURN DIALOGUE ROLES:/);
  assert.match(prompts[0], /COURSE CONFIG:/);
  assert.match(prompts[0], /"overviewKeywordCount": 3/);
  assert.match(prompts[0], /Every baseExample\.english and every variation\.english must visibly contain the exact coreExpression\./i);
  assert.match(prompts[0], /Do not replace the coreExpression with a synonym, pronoun, abbreviation, or looser paraphrase\./i);
  assert.match(prompts[0], /Generate exactly 3 Notice Expression Packs\./);
  assert.match(prompts[0], /Generate exactly 2 Task Packs\./);
  assert.match(prompts[0], /Generate exactly 0 variations per Notice Expression Pack\./);
  assert.match(prompts[0], /Generate exactly 0 variations per Interpret Expression Pack\./);
  assert.match(prompts[0], /Generate exactly 0 Need variations per Task Pack\./);
  assert.match(prompts[0], /Generate exactly 0 Handle variations per Task Pack\./);
  assert.match(prompts[0], /Use the fixed Chinese start prompt: 点击开始这次学习之旅\./);
  assert.match(prompts[0], /scenePromptChinese/);
  assert.match(prompts[0], /interact_need/);
  assert.match(prompts[0], /interact_handle/);
  assert.match(prompts[0], /Each dialogue must read like Need -> systemReply -> Handle in one continuous exchange\./);
  assert.match(prompts[0], /Start from one complete natural Chinese sentence for Understand, then split that sentence into reorderable Chinese chunks\./i);
  assert.match(prompts[0], /The joined Understand chunks must reconstruct one complete natural Chinese sentence, so keep necessary function words and structural words such as 的, 在, 是, and 了 when they are needed\./i);
  assert.match(prompts[0], /Build and Quick Response both use sentence-level English chunks that reconstruct a complete natural reply\./i);
  assert.match(prompts[0], /Build uses the Chinese sentence as the source; Quick Response uses the scene question or dialogue situation as the source\./i);
  assert.match(prompts[0], /Keep punctuation attached to the chunk where it naturally belongs\. Sentence-final punctuation should usually stay on the last chunk\./i);
  assert.match(prompts[0], /Do not split punctuation into its own chunk\./i);
  assert.match(prompts[0], /Each quickResponse question must be organized around the same pack's baseExample or variation sentence so that sentence becomes the learner's answer\./i);
  assert.match(prompts[0], /quickResponse\.questionChinese must be the Chinese translation of that question\./i);
  assert.doesNotMatch(prompts[0], /Quick Response chunks are English phrases only\./i);
  assert.match(prompts[0], /No fragment chunks, no filler chunks, and no forced equal-length slicing\./i);
  assert.match(prompts[0], /Do not create a chunk just to satisfy count if a natural chunk would read better after re-segmentation\./i);
  assert.match(prompts[0], /Distractors may keep natural punctuation when it helps them look like real alternatives, especially at sentence end\./i);
  assert.doesNotMatch(prompts[0], /short clause/i);
  assert.match(prompts[0], /REQUIRED INNER SHAPES:/);
  assert.match(prompts[0], /UNDERSTAND EXAMPLE:/);
  assert.match(prompts[0], /"chunks": \["一个咖啡杯", "放在", "笔记本电脑旁边。"\]/);
  assert.match(prompts[0], /"chunks": \["A coffee mug", "is next to", "the laptop\."\]/);
  assert.match(prompts[0], /"quickResponse": \{/);
  assert.equal(course.mode, "deep");
  assert.equal(course.level, "normal");
  assert.equal(course.modules.notice.expressionPacks[0].baseExample.quickResponse.question, "a coffee mug base question");
  assert.equal(course.modules.notice.expressionPacks[2].baseExample.quickResponse.question, "on the desk base question");
  assert.equal(course.modules.interpret.expressionPacks[1].baseExample.quickResponse.question, "ready for work base question");
  assert.equal(course.modules.notice.expressionPacks[0].baseExample.quickResponse.questionChinese, "a coffee mug base 中文 question");
  assert.equal(course.modules.stepIn.dialogue.sceneChinese, "桌边有一位同事在旁边。");
  assert.equal(course.modules.stepIn.dialogue.turns.length, 8);
});

test("deep stage prompt adds the full Step In protocol only for step_in", () => {
  const fullPayload = buildValidDeepCoursePayload();
  const prompt = buildDeepStagePrompt({
    stage: "step_in",
    level: "Normal",
    background: {
      overview: fullPayload.overview,
      notice: fullPayload.modules.notice,
      interpret: fullPayload.modules.interpret,
      interact: fullPayload.modules.interact,
    },
  });

  assert.match(prompt, /STAGE MODE: step_in/);
  assert.match(prompt, /STEP IN TASK DEFINITION:/);
  assert.match(prompt, /AVAILABLE PRE-STAGE CONTENT/);
  assert.match(prompt, /EXPRESSION SELECTION ORDER:/);
  assert.match(prompt, /Do not automatically choose the first Task Pack\./);
  assert.match(prompt, /Do not select expressions by their original pack order\./);
  assert.match(prompt, /If no combination is perfect, choose the one with the strongest direct causal relationship and build the smallest plausible event supported by the photo\./);
  assert.match(prompt, /INTERNAL EVENT PLAN:/);
  assert.match(prompt, /EVENT TEMPLATES:/);
  assert.match(prompt, /abnormality_resolution flow: visible abnormality -> interpretation of its cause or effect -> request or proposed action -> system gives information, a condition, or a limitation -> learner adjusts and resolves the situation\./);
  assert.match(prompt, /joint_decision flow: visible situation -> judgment about the situation -> learner proposes or asks about an option -> system expresses a condition, preference, or concern -> learner confirms or adjusts the decision\./);
  assert.match(prompt, /request_assistance flow: visible difficulty or missing resource -> judgment that assistance is needed -> learner makes a specific request -> system gives information, asks for clarification, or offers a partial solution -> learner responds and completes the request\./);
  assert.match(prompt, /social_response flow: visible personal state -> cautious interpretation of the person's condition or feeling -> learner asks, checks, or offers help -> system explains the situation or states a need -> learner responds naturally\./);
  assert.match(prompt, /generic_event flow: visible fact -> plausible interpretation -> practical action -> meaningful response -> natural handling\./);
  assert.match(prompt, /EIGHT-TURN DIALOGUE ROLES:/);
  assert.match(prompt, /LANGUAGE AND STRUCTURE CONSTRAINTS:/);
  assert.match(prompt, /OUTPUT STRUCTURE:/);
  assert.match(prompt, /SELF-CHECK BEFORE RETURN:/);
  assert.match(prompt, /NOTICE CANDIDATES/);
  assert.match(prompt, /INTERPRET CANDIDATES/);
  assert.match(prompt, /INTERACT TASK PACKS/);
  assert.match(prompt, /Turn 1 - System opens the event:/);
  assert.match(prompt, /The first system turn must establish the Notice trigger, not the Need\./);
  assert.match(prompt, /May: point out that something seems different, refer to what the two people are trying to do, draw attention to the relevant area without stating the learner's observation, or introduce a small practical situation\./);
  assert.match(prompt, /Must not: describe the entire photo, ask the learner to list visible objects, say the selected Notice expression for the learner, behave like a teacher, ask a generic exercise question, or jump directly to the Need\./);
  assert.match(prompt, /Avoid lines such as: What can you see in the photo\? Describe the scene\. Now use the Notice expression\. What should you say next\?/);
  assert.match(prompt, /Turn 7 - System responds to Need:/);
  assert.match(prompt, /Avoid empty bridge lines such as: Sure\. Okay\. No problem\. I see\. That's fine\./);
  assert.match(prompt, /Turn 8 - User Handle:/);
  assert.match(prompt, /May: accept the option, adjust the request, clarify the plan, confirm the next action, politely reject a condition, or solve the immediate problem\./);
  assert.match(prompt, /System identity:/);
  assert.match(prompt, /The system is a real person inside the scene and does not know that this is an English exercise\./);
  assert.match(prompt, /System bridge rule:/);
  assert.match(prompt, /Each user line must contain its selected coreExpression exactly as learned\./);
  assert.match(prompt, /Core expression rules:/);
  assert.match(prompt, /The four selected coreExpressions should appear in their corresponding user turns only as needed\. Do not unnaturally repeat them in system turns\./);
  assert.match(prompt, /Natural language rules:/);
  assert.match(prompt, /User chunk rules:/);
  assert.match(prompt, /Keep punctuation attached to the chunk where it naturally belongs\. Sentence-final punctuation should usually stay on the last chunk\./);
  assert.match(prompt, /Do not split punctuation into its own chunk\./);
  assert.match(prompt, /User distractor rules:/);
  assert.match(prompt, /Distractors may keep natural punctuation when it helps them look like real alternatives, especially at sentence end\./);
  assert.match(prompt, /Return JSON only\./);

  const addendumIndex = prompt.indexOf("STEP IN TASK DEFINITION:");
  const summaryIndex = prompt.indexOf("AVAILABLE PRE-STAGE CONTENT");
  const frozenIndex = prompt.indexOf("FROZEN BACKGROUND:");
  const shapeIndex = prompt.indexOf("RETURN ONLY THIS STAGE SHAPE:");

  assert.ok(addendumIndex > -1);
  assert.ok(summaryIndex > addendumIndex);
  assert.ok(frozenIndex > summaryIndex);
  assert.ok(shapeIndex > frozenIndex);
});

test("provider registry creates a deep provider alongside the quick provider", () => {
  const originalProvider = process.env.LESSON_PROVIDER;
  try {
    process.env.LESSON_PROVIDER = "codex";

    const registry = createProviderRegistry();
    assert.ok(registry.quick);
    assert.ok(registry.deep);
    assert.equal(typeof registry.quick.generateLesson, "function");
    assert.equal(typeof registry.deep.generateLesson, "function");
  } finally {
    if (originalProvider === undefined) {
      delete process.env.LESSON_PROVIDER;
    } else {
      process.env.LESSON_PROVIDER = originalProvider;
    }
  }
});

test("deep prompt uses different level tuning for normal and advanced lessons", () => {
  const normalPrompt = buildDeepCoursePrompt({ level: "Normal" });
  const advancedPrompt = buildDeepCoursePrompt({ level: "Advanced" });

  assert.match(normalPrompt, /LEVEL TUNING:/);
  assert.match(normalPrompt, /Normal tone:/);
  assert.match(normalPrompt, /clearest, most direct wording for the scene/i);
  assert.doesNotMatch(normalPrompt, /Advanced tone:/);

  assert.match(advancedPrompt, /LEVEL TUNING:/);
  assert.match(advancedPrompt, /Advanced tone:/);
  assert.match(advancedPrompt, /more polished, natural expression/i);
  assert.doesNotMatch(advancedPrompt, /Normal tone:/);
});

test("deep codex provider generates staged overview_notice payloads", async () => {
  const prompts = [];
  const fullPayload = buildValidDeepCoursePayload();
  const provider = createDeepCodexCliProvider({
    model: "test-model",
    runCliPrompt: async ({ prompt }) => {
      prompts.push(prompt);

      if (prompt.includes("STAGE MODE: overview_notice")) {
        return JSON.stringify({
          mode: "deep",
          level: "Normal",
          overview: fullPayload.overview,
          modules: {
            notice: fullPayload.modules.notice,
          },
        });
      }

      throw new Error("Unexpected prompt in staged provider test");
    },
  });

  const stageLesson = await provider.generateStage({
    stage: "overview_notice",
    imageBuffer: Buffer.from("fake-image"),
    mimeType: "image/jpeg",
    level: "Normal",
    traceId: "trace-stage",
    background: {
      overview: fullPayload.overview,
    },
  });

  assert.equal(prompts.length, 1);
  assert.match(prompts[0], /STAGE MODE: overview_notice/);
  assert.match(prompts[0], /FROZEN BACKGROUND:/);
  assert.match(prompts[0], /RETURN ONLY THIS STAGE SHAPE:/);
  assert.equal(stageLesson.mode, "deep");
  assert.equal(stageLesson.level, "normal");
  assert.equal(stageLesson.overview.keywords.length, 3);
  assert.equal(stageLesson.modules.notice.expressionPacks.length, 3);
  assert.equal(stageLesson.modules.notice.title, "Notice");
});
