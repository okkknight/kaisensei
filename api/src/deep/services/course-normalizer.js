import { LessonValidationError } from "../../shared/ai/errors.js";
import { deepCourseContract, deepModuleOrder } from "../contracts/course.js";
import { deepCourseDefaultConfig } from "../config/course.js";

const sourceModuleMap = {
  notice: "notice",
  interpret: "interpret",
  need: "interact_need",
  interact_need: "interact_need",
  handle: "interact_handle",
  interact_handle: "interact_handle",
};

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fail(message, details = {}) {
  throw new LessonValidationError(message, {
    code: "validation_error",
    ...details,
  });
}

function ensureString(value, path) {
  if (typeof value !== "string") {
    fail(`Missing or invalid string at ${path}`, { path });
  }

  const trimmed = value.trim();
  if (!trimmed) {
    fail(`Missing or empty string at ${path}`, { path });
  }

  return trimmed;
}

function ensureStringArray(value, path) {
  if (!Array.isArray(value)) {
    fail(`Missing or invalid array at ${path}`, { path });
  }

  const result = value.map((item, index) => ensureString(item, `${path}[${index}]`));
  if (result.length === 0) {
    fail(`Missing or empty array at ${path}`, { path });
  }

  return result;
}

function ensureOptionalStringArray(value, path) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    fail(`Missing or invalid array at ${path}`, { path });
  }

  return value.map((item, index) => ensureString(item, `${path}[${index}]`));
}

function ensureUnique(values, path) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      fail(`Duplicate value found at ${path}`, { path });
    }
    seen.add(value);
  }
}

function ensureAnswerCoverage(answer, choices, path) {
  for (const item of answer) {
    if (!choices.includes(item)) {
      fail(`Answer item ${item} is not available at ${path}`, { path });
    }
  }
}

function normalizeDeepText(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ensureContainsCoreExpression(text, coreExpression, path) {
  const normalizedText = normalizeDeepText(text);
  const normalizedCoreExpression = normalizeDeepText(coreExpression);

  if (!normalizedText.includes(normalizedCoreExpression)) {
    fail(`Expected ${path} to visibly contain its coreExpression`, { path });
  }
}

function joinChunks(chunks) {
  if (!Array.isArray(chunks)) {
    return "";
  }

  return chunks.join(" ").replace(/\s+([,.!?;:])/g, "$1").replace(/\s+/g, " ").trim();
}

function ensureExactLength(value, expectedLength, path) {
  if (!Array.isArray(value)) {
    fail(`Missing or invalid array at ${path}`, { path });
  }

  if (value.length !== expectedLength) {
    fail(`Expected exactly ${expectedLength} items at ${path}`, { path });
  }
}

function ensureExactCount(value, expectedCount, path) {
  if (value !== expectedCount) {
    fail(`Expected exactly ${expectedCount} at ${path}`, { path });
  }
}

function limitArrayLength(values, expectedLength) {
  if (!Array.isArray(values)) {
    return [];
  }

  if (values.length <= expectedLength) {
    return values;
  }

  return values.slice(0, expectedLength);
}

function countBlanks(sentence) {
  const matches = String(sentence).match(/____/g);
  return matches ? matches.length : 0;
}

function normalizeReorderExercise(exercise, path, expectedDistractorCount) {
  if (!isPlainObject(exercise)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const chunks = ensureStringArray(exercise.chunks, `${path}.chunks`);
  const distractors = ensureOptionalStringArray(exercise.distractors, `${path}.distractors`);
  const answer = ensureStringArray(exercise.answer, `${path}.answer`);

  ensureUnique(chunks, `${path}.chunks`);
  ensureUnique(distractors, `${path}.distractors`);
  ensureAnswerCoverage(answer, chunks, `${path}.answer`);

  return {
    ...exercise,
    chunks,
    distractors: limitArrayLength(distractors, expectedDistractorCount),
    answer,
  };
}

function normalizeFocusExercise(exercise, path, config = deepCourseDefaultConfig.exercise) {
  if (!isPlainObject(exercise)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const sentenceWithBlanks = ensureString(exercise.sentenceWithBlanks, `${path}.sentenceWithBlanks`);
  const choices = ensureStringArray(exercise.choices, `${path}.choices`);
  const distractors = ensureOptionalStringArray(exercise.distractors, `${path}.distractors`);
  const answer = ensureStringArray(exercise.answer, `${path}.answer`);

  ensureUnique(choices, `${path}.choices`);
  ensureUnique(distractors, `${path}.distractors`);
  ensureAnswerCoverage(answer, choices, `${path}.answer`);
  ensureExactLength(answer, config.focusBlankCount, `${path}.answer`);
  ensureExactCount(countBlanks(sentenceWithBlanks), config.focusBlankCount, `${path}.sentenceWithBlanks`);

  return {
    ...exercise,
    sentenceWithBlanks,
    choices,
    distractors: limitArrayLength(distractors, config.focusDistractorCount),
    answer,
  };
}

function normalizeMaybeReorderExercise(exercise, path, config = deepCourseDefaultConfig.exercise, expectedDistractorCount = config.buildDistractorCount) {
  if (!isPlainObject(exercise)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  if ("sentenceWithBlanks" in exercise || "choices" in exercise) {
    return normalizeFocusExercise(exercise, path, config);
  }

  if (!Array.isArray(exercise.chunks) && !Array.isArray(exercise.distractors) && !Array.isArray(exercise.answer)) {
    return { ...exercise };
  }

  return normalizeReorderExercise(exercise, path, expectedDistractorCount);
}

function containsCjk(text) {
  return /[\p{Script=Han}]/u.test(String(text || ""));
}

function ensureChineseChunks(value, path) {
  const chunks = ensureStringArray(value, path);

  chunks.forEach((chunk, index) => {
    if (!containsCjk(chunk)) {
      fail(`Expected Chinese chunk at ${path}[${index}]`, { path });
    }
  });

  return chunks;
}

function normalizeUnderstandExercise(exercise, path, config = deepCourseDefaultConfig.exercise) {
  const normalized = normalizeReorderExercise(exercise, path, config.understandDistractorCount);

  return {
    ...normalized,
    chunks: ensureChineseChunks(normalized.chunks, `${path}.chunks`),
    distractors: ensureChineseChunks(normalized.distractors, `${path}.distractors`),
    answer: ensureChineseChunks(normalized.answer, `${path}.answer`),
  };
}

function normalizeBuildExercise(exercise, path, config = deepCourseDefaultConfig.exercise) {
  const normalized = normalizeReorderExercise(exercise, path, config.buildDistractorCount);
  return normalized;
}

function normalizeBaseExample(baseExample, path, coreExpression, config = deepCourseDefaultConfig.exercise) {
  if (!isPlainObject(baseExample)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const english = ensureString(baseExample.english, `${path}.english`);
  const chinese = ensureString(baseExample.chinese, `${path}.chinese`);

  ensureContainsCoreExpression(english, coreExpression, `${path}.english`);

  return {
    ...baseExample,
    english,
    chinese,
    understand: normalizeUnderstandExercise(baseExample.understand || {}, `${path}.understand`, config),
    focus: normalizeMaybeReorderExercise(baseExample.focus || {}, `${path}.focus`, config),
    build: normalizeBuildExercise(baseExample.build || {}, `${path}.build`, config),
    quickResponse: normalizeQuickResponse(baseExample.quickResponse || {}, `${path}.quickResponse`, config),
  };
}

function normalizeVariation(variation, path, coreExpression, config = deepCourseDefaultConfig.exercise) {
  if (!isPlainObject(variation)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const english = ensureString(variation.english, `${path}.english`);
  const chinese = ensureString(variation.chinese, `${path}.chinese`);
  const variationCoreExpression = variation.coreExpression === undefined
    ? coreExpression
    : ensureString(variation.coreExpression, `${path}.coreExpression`);

  if (variationCoreExpression !== coreExpression) {
    fail(`Variation coreExpression must match ${path.replace(/\.variations\[\d+\]$/, "")} coreExpression`, {
      path: `${path}.coreExpression`,
    });
  }

  ensureContainsCoreExpression(english, coreExpression, `${path}.english`);

  return {
    ...variation,
    coreExpression,
    english,
    chinese,
    understand: normalizeUnderstandExercise(variation.understand || {}, `${path}.understand`, config),
    focus: normalizeMaybeReorderExercise(variation.focus || {}, `${path}.focus`, config),
    build: normalizeBuildExercise(variation.build || {}, `${path}.build`, config),
    quickResponse: normalizeQuickResponse(variation.quickResponse || {}, `${path}.quickResponse`, config),
  };
}

function normalizeQuickResponse(quickResponse, path, config = deepCourseDefaultConfig.exercise) {
  if (!isPlainObject(quickResponse)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const question = ensureString(quickResponse.question, `${path}.question`);
  const chunks = ensureStringArray(quickResponse.chunks, `${path}.chunks`);
  const distractors = ensureOptionalStringArray(quickResponse.distractors, `${path}.distractors`);
  const answer = ensureStringArray(quickResponse.answer, `${path}.answer`);

  ensureUnique(chunks, `${path}.chunks`);
  ensureUnique(distractors, `${path}.distractors`);
  ensureAnswerCoverage(answer, chunks, `${path}.answer`);

  return {
    ...quickResponse,
    question,
    chunks,
    distractors: limitArrayLength(distractors, config.dialogueDistractorCount),
    answer,
  };
}

function normalizeSourceModule(sourceModule, path) {
  const normalizedSourceModule = ensureString(sourceModule, path);
  const mappedSourceModule = sourceModuleMap[normalizedSourceModule];

  if (!mappedSourceModule) {
    fail(`Invalid sourceModule at ${path}`, { path });
  }

  return mappedSourceModule;
}

export function normalizeExpressionPack(pack, path, config = deepCourseDefaultConfig.notice, exerciseConfig = deepCourseDefaultConfig.exercise) {
  if (!isPlainObject(pack)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const id = ensureString(pack.id, `${path}.id`);
  const coreExpression = ensureString(pack.coreExpression, `${path}.coreExpression`);
  const meaningChinese = ensureString(pack.meaningChinese, `${path}.meaningChinese`);
  const baseExample = normalizeBaseExample(pack.baseExample || {}, `${path}.baseExample`, coreExpression, exerciseConfig);
  const variations = Array.isArray(pack.variations)
    ? pack.variations.map((variation, index) => normalizeVariation(variation, `${path}.variations[${index}]`, coreExpression, exerciseConfig))
    : [];

  ensureExactLength(variations, config.variationsPerExpression, `${path}.variations`);

  return {
    ...pack,
    id,
    coreExpression,
    meaningChinese,
    baseExample,
    variations,
  };
}

export function normalizeTaskPack(pack, path, config = deepCourseDefaultConfig.interact, exerciseConfig = deepCourseDefaultConfig.exercise) {
  if (!isPlainObject(pack)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const id = ensureString(pack.id, `${path}.id`);
  const taskTitle = ensureString(pack.taskTitle, `${path}.taskTitle`);
  const scenePrompt = ensureString(pack.scenePrompt, `${path}.scenePrompt`);
  const scenePromptChinese = ensureString(pack.scenePromptChinese, `${path}.scenePromptChinese`);
  const need = isPlainObject(pack.need) ? pack.need : {};
  const handle = isPlainObject(pack.handle) ? pack.handle : {};
  const dialogues = Array.isArray(pack.dialogues) ? pack.dialogues : [];
  const needVariations = Array.isArray(need.variations) ? need.variations : [];
  const handleVariations = Array.isArray(handle.variations) ? handle.variations : [];
  const needCoreExpression = ensureString(need.coreExpression, `${path}.need.coreExpression`);
  const handleCoreExpression = ensureString(handle.coreExpression, `${path}.handle.coreExpression`);
  const normalizedHandleCoreExpression = normalizeDeepText(handleCoreExpression);

  const normalized = {
    ...pack,
    id,
    taskTitle,
    scenePrompt,
    scenePromptChinese,
    need: {
      ...need,
      coreExpression: needCoreExpression,
      meaningChinese: ensureString(need.meaningChinese, `${path}.need.meaningChinese`),
      baseExample: normalizeBaseExample(need.baseExample || {}, `${path}.need.baseExample`, needCoreExpression, exerciseConfig),
      variations: needVariations.map((variation, index) => normalizeVariation(variation, `${path}.need.variations[${index}]`, needCoreExpression, exerciseConfig)),
    },
    handle: {
      ...handle,
      coreExpression: handleCoreExpression,
      meaningChinese: ensureString(handle.meaningChinese, `${path}.handle.meaningChinese`),
      baseExample: normalizeBaseExample(handle.baseExample || {}, `${path}.handle.baseExample`, handleCoreExpression, exerciseConfig),
      variations: handleVariations.map((variation, index) => normalizeVariation(variation, `${path}.handle.variations[${index}]`, handleCoreExpression, exerciseConfig)),
    },
    dialogues: dialogues.map((dialogue, index) => {
      if (!isPlainObject(dialogue)) {
        fail(`Missing or invalid object at ${path}.dialogues[${index}]`, { path: `${path}.dialogues[${index}]` });
      }

      const dialogueNeed = normalizeMaybeReorderExercise(dialogue.need || {}, `${path}.dialogues[${index}].need`, exerciseConfig, exerciseConfig.buildDistractorCount);
      const dialogueHandle = normalizeMaybeReorderExercise(dialogue.handle || {}, `${path}.dialogues[${index}].handle`, exerciseConfig, exerciseConfig.buildDistractorCount);
      const systemReply = ensureString(dialogue.systemReply, `${path}.dialogues[${index}].systemReply`);
      const normalizedSystemReply = normalizeDeepText(systemReply);
      const dialogueHandleAnswer = joinChunks(dialogueHandle.answer);
      const normalizedDialogueHandleAnswer = normalizeDeepText(dialogueHandleAnswer);

      if (
        normalizedSystemReply.includes(normalizedHandleCoreExpression) ||
        (normalizedDialogueHandleAnswer && normalizedSystemReply.includes(normalizedDialogueHandleAnswer))
      ) {
        fail(`Dialogue systemReply must be a bridge line that keeps the exchange moving`, {
          path: `${path}.dialogues[${index}].systemReply`,
        });
      }

      return {
        ...dialogue,
        scene: ensureString(dialogue.scene, `${path}.dialogues[${index}].scene`),
        need: dialogueNeed,
        systemReply,
        handle: dialogueHandle,
      };
    }),
  };

  ensureExactLength(needVariations, config.variationsPerNeedExpression, `${path}.need.variations`);
  ensureExactLength(handleVariations, config.variationsPerHandleExpression, `${path}.handle.variations`);
  ensureExactLength(dialogues, config.dialoguesPerTaskPack, `${path}.dialogues`);

  return normalized;
}

export function normalizeStepInDialogue(dialogue, config = deepCourseDefaultConfig.stepIn, exerciseConfig = deepCourseDefaultConfig.exercise) {
  if (!isPlainObject(dialogue)) {
    fail("Missing or invalid object at modules.stepIn.dialogue", {
      path: "modules.stepIn.dialogue",
    });
  }

  if (Object.keys(dialogue).length === 0) {
    return {};
  }

  const scene = ensureString(dialogue.scene, "modules.stepIn.dialogue.scene");
  const sceneChinese = ensureString(dialogue.sceneChinese, "modules.stepIn.dialogue.sceneChinese");
  const turns = Array.isArray(dialogue.turns) ? dialogue.turns : [];
  const expectedTurns = (config.noticeExpressionCount + config.interpretExpressionCount + config.needExpressionCount + config.handleExpressionCount) * 2;

  ensureExactLength(turns, expectedTurns, "modules.stepIn.dialogue.turns");

  return {
    ...dialogue,
    scene,
    sceneChinese,
    turns: turns.map((turn, index) => {
      if (!isPlainObject(turn)) {
        fail(`Missing or invalid object at modules.stepIn.dialogue.turns[${index}]`, {
          path: `modules.stepIn.dialogue.turns[${index}]`,
        });
      }

      const speaker = ensureString(turn.speaker, `modules.stepIn.dialogue.turns[${index}].speaker`);
      const text = ensureString(turn.text, `modules.stepIn.dialogue.turns[${index}].text`);
      if (index % 2 === 0 && speaker !== "system") {
        fail(`Expected system speaker at modules.stepIn.dialogue.turns[${index}]`, {
          path: `modules.stepIn.dialogue.turns[${index}].speaker`,
        });
      }
      if (index % 2 === 1 && speaker !== "user") {
        fail(`Expected user speaker at modules.stepIn.dialogue.turns[${index}]`, {
          path: `modules.stepIn.dialogue.turns[${index}].speaker`,
        });
      }
      if (speaker === "user") {
        const sourceModule = normalizeSourceModule(turn.sourceModule, `modules.stepIn.dialogue.turns[${index}].sourceModule`);
        const chunks = ensureStringArray(turn.chunks, `modules.stepIn.dialogue.turns[${index}].chunks`);
        const distractors = ensureOptionalStringArray(turn.distractors, `modules.stepIn.dialogue.turns[${index}].distractors`);
        const answer = ensureStringArray(turn.answer, `modules.stepIn.dialogue.turns[${index}].answer`);
        ensureUnique(chunks, `modules.stepIn.dialogue.turns[${index}].chunks`);
        ensureUnique(distractors, `modules.stepIn.dialogue.turns[${index}].distractors`);
        ensureAnswerCoverage(answer, chunks, `modules.stepIn.dialogue.turns[${index}].answer`);
        return {
          ...turn,
          speaker,
          text,
          sourceModule,
          chunks,
          distractors: limitArrayLength(distractors, exerciseConfig.dialogueDistractorCount),
          answer,
        };
      }
      return {
        ...turn,
        speaker,
        text,
      };
    }),
  };
}

export function normalizeOverview(overview, config = deepCourseDefaultConfig) {
  if (!isPlainObject(overview)) {
    fail("Missing or invalid object at overview", { path: "overview" });
  }

  const keywords = ensureStringArray(overview.keywords, "overview.keywords");
  ensureExactLength(keywords, config.overviewKeywordCount, "overview.keywords");

  return {
    ...overview,
    keywords,
    sceneDescriptionChinese: ensureString(overview.sceneDescriptionChinese, "overview.sceneDescriptionChinese"),
    startPromptChinese: ensureString(overview.startPromptChinese, "overview.startPromptChinese"),
  };
}

export function normalizeLevel(level) {
  const normalized = ensureString(level, "level").toLowerCase();
  if (normalized !== "normal" && normalized !== "advanced") {
    fail("Invalid lesson level", { path: "level" });
  }

  return normalized;
}

function normalizeModuleSet(modules, config = deepCourseDefaultConfig) {
  if (!isPlainObject(modules)) {
    fail("Missing or invalid object at modules", { path: "modules" });
  }

  for (const key of deepModuleOrder) {
    if (!(key in modules)) {
      fail(`Missing module ${key}`, { path: `modules.${key}` });
    }
  }

  if (!Array.isArray(modules.notice.expressionPacks)) {
    fail("Missing or invalid array at modules.notice.expressionPacks", {
      path: "modules.notice.expressionPacks",
    });
  }
  if (!Array.isArray(modules.interpret.expressionPacks)) {
    fail("Missing or invalid array at modules.interpret.expressionPacks", {
      path: "modules.interpret.expressionPacks",
    });
  }
  if (!Array.isArray(modules.interact.taskPacks)) {
    fail("Missing or invalid array at modules.interact.taskPacks", {
      path: "modules.interact.taskPacks",
    });
  }

  const noticeExpressionPacks = modules.notice.expressionPacks.map((pack, index) => normalizeExpressionPack(pack, `modules.notice.expressionPacks[${index}]`, config.notice, config.exercise));
  const interpretExpressionPacks = modules.interpret.expressionPacks.map((pack, index) => normalizeExpressionPack(pack, `modules.interpret.expressionPacks[${index}]`, config.interpret, config.exercise));
  const interactTaskPacks = modules.interact.taskPacks.map((pack, index) => normalizeTaskPack(pack, `modules.interact.taskPacks[${index}]`, config.interact, config.exercise));

  const noticeIds = noticeExpressionPacks.map((pack) => pack.id);
  const interpretIds = interpretExpressionPacks.map((pack) => pack.id);
  const interactIds = interactTaskPacks.map((pack) => pack.id);

  ensureUnique(noticeIds, "modules.notice.expressionPacks.id");
  ensureUnique(interpretIds, "modules.interpret.expressionPacks.id");
  ensureUnique(interactIds, "modules.interact.taskPacks.id");
  ensureExactLength(noticeExpressionPacks, config.notice.coreExpressionCount, "modules.notice.expressionPacks");
  ensureExactLength(interpretExpressionPacks, config.interpret.coreExpressionCount, "modules.interpret.expressionPacks");
  ensureExactLength(interactTaskPacks, config.interact.taskPackCount, "modules.interact.taskPacks");

  return {
    notice: {
      ...modules.notice,
      title: ensureString(modules.notice.title, "modules.notice.title"),
      goal: ensureString(modules.notice.goal, "modules.notice.goal"),
      expressionPacks: noticeExpressionPacks,
    },
    interpret: {
      ...modules.interpret,
      title: ensureString(modules.interpret.title, "modules.interpret.title"),
      goal: ensureString(modules.interpret.goal, "modules.interpret.goal"),
      expressionPacks: interpretExpressionPacks,
    },
    interact: {
      ...modules.interact,
      title: ensureString(modules.interact.title, "modules.interact.title"),
      goal: ensureString(modules.interact.goal, "modules.interact.goal"),
      taskPacks: interactTaskPacks,
    },
    stepIn: {
      ...modules.stepIn,
      title: ensureString(modules.stepIn.title, "modules.stepIn.title"),
      goal: ensureString(modules.stepIn.goal, "modules.stepIn.goal"),
      dialogue: normalizeStepInDialogue(modules.stepIn.dialogue || {}, config.stepIn, config.exercise),
    },
  };
}

export function normalizeDeepCoursePayload(payload, config = deepCourseDefaultConfig) {
  if (!isPlainObject(payload)) {
    fail("Lesson payload must be a JSON object", { path: "root" });
  }

  if (payload.mode !== "deep") {
    fail("Deep course payload must use mode=deep", { path: "mode" });
  }

  const normalized = {
    ...deepCourseContract,
    mode: "deep",
    level: normalizeLevel(payload.level),
    overview: normalizeOverview(payload.overview, config),
    modules: normalizeModuleSet(payload.modules, config),
  };

  return normalized;
}
