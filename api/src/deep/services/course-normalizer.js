import { LessonValidationError } from "../../shared/ai/errors.js";
import { deepCourseContract, deepModuleOrder } from "../contracts/course.js";

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

function normalizeReorderExercise(exercise, path) {
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
    distractors,
    answer,
  };
}

function normalizeMaybeReorderExercise(exercise, path) {
  if (!isPlainObject(exercise)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  if (!Array.isArray(exercise.chunks) && !Array.isArray(exercise.distractors) && !Array.isArray(exercise.answer)) {
    return { ...exercise };
  }

  return normalizeReorderExercise(exercise, path);
}

function normalizeBaseExample(baseExample, path) {
  if (!isPlainObject(baseExample)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const english = ensureString(baseExample.english, `${path}.english`);
  const chinese = ensureString(baseExample.chinese, `${path}.chinese`);

  return {
    ...baseExample,
    english,
    chinese,
    understand: normalizeMaybeReorderExercise(baseExample.understand || {}, `${path}.understand`),
    focus: normalizeMaybeReorderExercise(baseExample.focus || {}, `${path}.focus`),
    build: normalizeMaybeReorderExercise(baseExample.build || {}, `${path}.build`),
  };
}

function normalizeVariation(variation, path) {
  if (!isPlainObject(variation)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const english = ensureString(variation.english, `${path}.english`);
  const chinese = ensureString(variation.chinese, `${path}.chinese`);

  return {
    ...variation,
    english,
    chinese,
    understand: normalizeMaybeReorderExercise(variation.understand || {}, `${path}.understand`),
    focus: normalizeMaybeReorderExercise(variation.focus || {}, `${path}.focus`),
    build: normalizeMaybeReorderExercise(variation.build || {}, `${path}.build`),
  };
}

function normalizeQuickResponse(quickResponse, path) {
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
    distractors,
    answer,
  };
}

function normalizeExpressionPack(pack, path) {
  if (!isPlainObject(pack)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const id = ensureString(pack.id, `${path}.id`);
  const coreExpression = ensureString(pack.coreExpression, `${path}.coreExpression`);
  const meaningChinese = ensureString(pack.meaningChinese, `${path}.meaningChinese`);
  const baseExample = normalizeBaseExample(pack.baseExample || {}, `${path}.baseExample`);
  const variations = Array.isArray(pack.variations)
    ? pack.variations.map((variation, index) => normalizeVariation(variation, `${path}.variations[${index}]`))
    : [];
  const quickResponses = Array.isArray(pack.quickResponses)
    ? pack.quickResponses.map((quickResponse, index) => normalizeQuickResponse(quickResponse, `${path}.quickResponses[${index}]`))
    : [];

  return {
    ...pack,
    id,
    coreExpression,
    meaningChinese,
    baseExample,
    variations,
    quickResponses,
  };
}

function normalizeTaskPack(pack, path) {
  if (!isPlainObject(pack)) {
    fail(`Missing or invalid object at ${path}`, { path });
  }

  const id = ensureString(pack.id, `${path}.id`);
  const taskTitle = ensureString(pack.taskTitle, `${path}.taskTitle`);
  const scenePrompt = ensureString(pack.scenePrompt, `${path}.scenePrompt`);
  const need = isPlainObject(pack.need) ? pack.need : {};
  const handle = isPlainObject(pack.handle) ? pack.handle : {};
  const dialogues = Array.isArray(pack.dialogues) ? pack.dialogues : [];

  return {
    ...pack,
    id,
    taskTitle,
    scenePrompt,
    need: {
      ...need,
      coreExpression: ensureString(need.coreExpression, `${path}.need.coreExpression`),
      meaningChinese: ensureString(need.meaningChinese, `${path}.need.meaningChinese`),
      baseExample: normalizeMaybeReorderExercise(need.baseExample || {}, `${path}.need.baseExample`),
      variations: Array.isArray(need.variations)
        ? need.variations.map((variation, index) => normalizeVariation(variation, `${path}.need.variations[${index}]`))
        : [],
    },
    handle: {
      ...handle,
      coreExpression: ensureString(handle.coreExpression, `${path}.handle.coreExpression`),
      meaningChinese: ensureString(handle.meaningChinese, `${path}.handle.meaningChinese`),
      baseExample: normalizeMaybeReorderExercise(handle.baseExample || {}, `${path}.handle.baseExample`),
      variations: Array.isArray(handle.variations)
        ? handle.variations.map((variation, index) => normalizeVariation(variation, `${path}.handle.variations[${index}]`))
        : [],
    },
    dialogues: dialogues.map((dialogue, index) => {
      if (!isPlainObject(dialogue)) {
        fail(`Missing or invalid object at ${path}.dialogues[${index}]`, { path: `${path}.dialogues[${index}]` });
      }

      return {
        ...dialogue,
        scene: ensureString(dialogue.scene, `${path}.dialogues[${index}].scene`),
        need: normalizeMaybeReorderExercise(dialogue.need || {}, `${path}.dialogues[${index}].need`),
        systemReply: ensureString(dialogue.systemReply, `${path}.dialogues[${index}].systemReply`),
        handle: normalizeMaybeReorderExercise(dialogue.handle || {}, `${path}.dialogues[${index}].handle`),
      };
    }),
  };
}

function normalizeStepInDialogue(dialogue) {
  if (!isPlainObject(dialogue)) {
    fail("Missing or invalid object at modules.stepIn.dialogue", {
      path: "modules.stepIn.dialogue",
    });
  }

  if (Object.keys(dialogue).length === 0) {
    return {};
  }

  const scene = ensureString(dialogue.scene, "modules.stepIn.dialogue.scene");
  const turns = Array.isArray(dialogue.turns) ? dialogue.turns : [];

  return {
    ...dialogue,
    scene,
    turns: turns.map((turn, index) => {
      if (!isPlainObject(turn)) {
        fail(`Missing or invalid object at modules.stepIn.dialogue.turns[${index}]`, {
          path: `modules.stepIn.dialogue.turns[${index}]`,
        });
      }

      const speaker = ensureString(turn.speaker, `modules.stepIn.dialogue.turns[${index}].speaker`);
      const text = ensureString(turn.text, `modules.stepIn.dialogue.turns[${index}].text`);
      return {
        ...turn,
        speaker,
        text,
      };
    }),
  };
}

function normalizeOverview(overview) {
  if (!isPlainObject(overview)) {
    fail("Missing or invalid object at overview", { path: "overview" });
  }

  const keywords = ensureStringArray(overview.keywords, "overview.keywords");

  return {
    ...overview,
    keywords,
    sceneDescriptionChinese: ensureString(overview.sceneDescriptionChinese, "overview.sceneDescriptionChinese"),
    startPromptChinese: ensureString(overview.startPromptChinese, "overview.startPromptChinese"),
  };
}

function normalizeLevel(level) {
  const normalized = ensureString(level, "level").toLowerCase();
  if (normalized !== "normal" && normalized !== "advanced") {
    fail("Invalid lesson level", { path: "level" });
  }

  return normalized;
}

function normalizeModuleSet(modules) {
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

  const noticeExpressionPacks = modules.notice.expressionPacks.map((pack, index) => normalizeExpressionPack(pack, `modules.notice.expressionPacks[${index}]`));
  const interpretExpressionPacks = modules.interpret.expressionPacks.map((pack, index) => normalizeExpressionPack(pack, `modules.interpret.expressionPacks[${index}]`));
  const interactTaskPacks = modules.interact.taskPacks.map((pack, index) => normalizeTaskPack(pack, `modules.interact.taskPacks[${index}]`));

  const noticeIds = noticeExpressionPacks.map((pack) => pack.id);
  const interpretIds = interpretExpressionPacks.map((pack) => pack.id);
  const interactIds = interactTaskPacks.map((pack) => pack.id);

  ensureUnique(noticeIds, "modules.notice.expressionPacks.id");
  ensureUnique(interpretIds, "modules.interpret.expressionPacks.id");
  ensureUnique(interactIds, "modules.interact.taskPacks.id");

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
      dialogue: normalizeStepInDialogue(modules.stepIn.dialogue || {}),
    },
  };
}

export function normalizeDeepCoursePayload(payload) {
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
    overview: normalizeOverview(payload.overview),
    modules: normalizeModuleSet(payload.modules),
  };

  return normalized;
}
