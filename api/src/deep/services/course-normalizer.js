import { deepCourseContract } from "../contracts/course.js";
import { LessonValidationError } from "../../shared/ai/errors.js";

const MODULE_ORDER = ["notice", "interpret", "interact", "stepIn"];

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fail(message, path, details = {}) {
  throw new LessonValidationError(message, { path, ...details });
}

function ensureString(value, path) {
  if (typeof value !== "string") {
    fail(`Missing or invalid string at ${path}`, path);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    fail(`Missing or empty string at ${path}`, path);
  }

  return trimmed;
}

function ensureStringArray(value, path) {
  if (!Array.isArray(value)) {
    fail(`Missing or invalid array at ${path}`, path);
  }

  return value.map((item, index) => ensureString(item, `${path}[${index}]`));
}

function ensureUniqueStrings(values, path) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) {
      fail(`Duplicate value in ${path}`, path);
    }
    seen.add(value);
  }
}

function ensureSameKeys(object, keys, path) {
  const actualKeys = Object.keys(object);
  const actual = [...actualKeys].sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(`Invalid object shape at ${path}`, path, { expectedKeys: keys });
  }
}

function ensureExactKeyOrder(object, keys, path) {
  const actualKeys = Object.keys(object);
  if (actualKeys.length !== keys.length || actualKeys.some((key, index) => key !== keys[index])) {
    fail(`Invalid object order at ${path}`, path, { expectedKeys: keys });
  }
}

function normalizeLevel(value) {
  const level = ensureString(value, "level").toLowerCase();
  if (level !== "normal" && level !== "advanced") {
    fail("Invalid deep course level", "level");
  }

  return level;
}

function normalizeEmptyOrStructuredObject(value, path, keys, normalizeStructured) {
  if (!isPlainObject(value)) {
    fail(`Missing or invalid object at ${path}`, path);
  }

  const actualKeys = Object.keys(value);
  if (actualKeys.length === 0) {
    return {};
  }

  ensureSameKeys(value, keys, path);
  return normalizeStructured(value, path);
}

function normalizeChunkList(value, path) {
  if (!Array.isArray(value)) {
    fail(`Missing or invalid array at ${path}`, path);
  }

  const chunks = value.map((chunk, index) => {
    if (!isPlainObject(chunk)) {
      fail(`Missing or invalid object at ${path}[${index}]`, `${path}[${index}]`);
    }

    return {
      id: ensureString(chunk.id, `${path}[${index}].id`),
      text: ensureString(chunk.text, `${path}[${index}].text`),
      chinese: ensureString(chunk.chinese, `${path}[${index}].chinese`),
    };
  });

  ensureUniqueStrings(chunks.map((chunk) => chunk.id), `${path}.id`);
  return chunks;
}

function ensureCoverage(referenceValues, answerValues, path) {
  const reference = new Set(referenceValues);
  for (const value of answerValues) {
    if (!reference.has(value)) {
      fail(`Answer item ${value} is not covered by ${path}`, path);
    }
  }
}

function normalizeExerciseObject(value, path, keys, normalizeStructured) {
  return normalizeEmptyOrStructuredObject(value, path, keys, normalizeStructured);
}

function normalizeExample(value, path) {
  return normalizeExerciseObject(value, path, ["english", "chinese", "understand", "focus", "build"], (example, examplePath) => {
    return {
      english: ensureString(example.english, `${examplePath}.english`),
      chinese: ensureString(example.chinese, `${examplePath}.chinese`),
      understand: normalizeExerciseObject(example.understand, `${examplePath}.understand`, ["chunks", "distractors"], (understand, understandPath) => {
        const chunks = ensureStringArray(understand.chunks, `${understandPath}.chunks`);
        const distractors = ensureStringArray(understand.distractors, `${understandPath}.distractors`);
        ensureUniqueStrings(chunks, `${understandPath}.chunks`);
        ensureUniqueStrings(distractors, `${understandPath}.distractors`);
        return { chunks, distractors };
      }),
      focus: normalizeExerciseObject(example.focus, `${examplePath}.focus`, ["sentenceWithBlanks", "choices", "answer"], (focus, focusPath) => {
        const sentenceWithBlanks = ensureString(focus.sentenceWithBlanks, `${focusPath}.sentenceWithBlanks`);
        const choices = ensureStringArray(focus.choices, `${focusPath}.choices`);
        const answer = ensureStringArray(focus.answer, `${focusPath}.answer`);
        ensureUniqueStrings(choices, `${focusPath}.choices`);
        ensureUniqueStrings(answer, `${focusPath}.answer`);
        ensureCoverage(choices, answer, `${focusPath}.answer`);
        return { sentenceWithBlanks, choices, answer };
      }),
      build: normalizeExerciseObject(example.build, `${examplePath}.build`, ["promptChinese", "chunks", "distractors", "answer"], (build, buildPath) => {
        const promptChinese = ensureString(build.promptChinese, `${buildPath}.promptChinese`);
        const chunks = ensureStringArray(build.chunks, `${buildPath}.chunks`);
        const distractors = ensureStringArray(build.distractors, `${buildPath}.distractors`);
        const answer = ensureStringArray(build.answer, `${buildPath}.answer`);
        ensureUniqueStrings(chunks, `${buildPath}.chunks`);
        ensureUniqueStrings(distractors, `${buildPath}.distractors`);
        ensureUniqueStrings(answer, `${buildPath}.answer`);
        ensureCoverage(chunks, answer, `${buildPath}.answer`);
        return { promptChinese, chunks, distractors, answer };
      }),
    };
  });
}

function normalizeResponse(value, path) {
  return normalizeExerciseObject(value, path, ["question", "chunks", "distractors", "answer"], (response, responsePath) => {
    const question = ensureString(response.question, `${responsePath}.question`);
    const chunks = ensureStringArray(response.chunks, `${responsePath}.chunks`);
    const distractors = ensureStringArray(response.distractors, `${responsePath}.distractors`);
    const answer = ensureStringArray(response.answer, `${responsePath}.answer`);
    ensureUniqueStrings(chunks, `${responsePath}.chunks`);
    ensureUniqueStrings(distractors, `${responsePath}.distractors`);
    ensureUniqueStrings(answer, `${responsePath}.answer`);
    ensureCoverage(chunks, answer, `${responsePath}.answer`);
    return { question, chunks, distractors, answer };
  });
}

function normalizeExpressionPack(pack, path) {
  if (!isPlainObject(pack)) {
    fail(`Missing or invalid object at ${path}`, path);
  }

  if (!("id" in pack)) {
    fail(`Missing id at ${path}.id`, `${path}.id`);
  }

  const normalized = {
    id: ensureString(pack.id, `${path}.id`),
    coreExpression: ensureString(pack.coreExpression, `${path}.coreExpression`),
    meaningChinese: ensureString(pack.meaningChinese, `${path}.meaningChinese`),
    baseExample: normalizeExample(pack.baseExample, `${path}.baseExample`),
    variations: Array.isArray(pack.variations)
      ? pack.variations.map((variation, index) => normalizeExample(variation, `${path}.variations[${index}]`))
      : fail(`Missing or invalid array at ${path}.variations`, `${path}.variations`),
    quickResponses: Array.isArray(pack.quickResponses)
      ? pack.quickResponses.map((response, index) => normalizeResponse(response, `${path}.quickResponses[${index}]`))
      : fail(`Missing or invalid array at ${path}.quickResponses`, `${path}.quickResponses`),
  };

  return normalized;
}

function normalizeTaskPack(pack, path) {
  if (!isPlainObject(pack)) {
    fail(`Missing or invalid object at ${path}`, path);
  }

  if (!("id" in pack)) {
    fail(`Missing id at ${path}.id`, `${path}.id`);
  }

  return {
    id: ensureString(pack.id, `${path}.id`),
    taskTitle: ensureString(pack.taskTitle, `${path}.taskTitle`),
    scenePrompt: ensureString(pack.scenePrompt, `${path}.scenePrompt`),
    need: normalizeExerciseObject(pack.need, `${path}.need`, ["coreExpression", "meaningChinese", "baseExample", "variations"], (need, needPath) => {
      return {
        coreExpression: ensureString(need.coreExpression, `${needPath}.coreExpression`),
        meaningChinese: ensureString(need.meaningChinese, `${needPath}.meaningChinese`),
        baseExample: normalizeExample(need.baseExample, `${needPath}.baseExample`),
        variations: Array.isArray(need.variations)
          ? need.variations.map((variation, index) => normalizeExample(variation, `${needPath}.variations[${index}]`))
          : fail(`Missing or invalid array at ${needPath}.variations`, `${needPath}.variations`),
      };
    }),
    handle: normalizeExerciseObject(pack.handle, `${path}.handle`, ["coreExpression", "meaningChinese", "baseExample", "variations"], (handle, handlePath) => {
      return {
        coreExpression: ensureString(handle.coreExpression, `${handlePath}.coreExpression`),
        meaningChinese: ensureString(handle.meaningChinese, `${handlePath}.meaningChinese`),
        baseExample: normalizeExample(handle.baseExample, `${handlePath}.baseExample`),
        variations: Array.isArray(handle.variations)
          ? handle.variations.map((variation, index) => normalizeExample(variation, `${handlePath}.variations[${index}]`))
          : fail(`Missing or invalid array at ${handlePath}.variations`, `${handlePath}.variations`),
      };
    }),
    dialogues: Array.isArray(pack.dialogues)
      ? pack.dialogues.map((dialogue, index) => normalizeExerciseObject(dialogue, `${path}.dialogues[${index}]`, ["scene", "need", "systemReply", "handle"], (item, itemPath) => {
          return {
            scene: ensureString(item.scene, `${itemPath}.scene`),
            need: normalizeResponse(item.need, `${itemPath}.need`),
            systemReply: ensureString(item.systemReply, `${itemPath}.systemReply`),
            handle: normalizeResponse(item.handle, `${itemPath}.handle`),
          };
        }))
      : fail(`Missing or invalid array at ${path}.dialogues`, `${path}.dialogues`),
  };
}

function normalizeStepInDialogue(dialogue, path) {
  return normalizeEmptyOrStructuredObject(dialogue, path, ["scene", "turns"], (value, valuePath) => {
    const scene = ensureString(value.scene, `${valuePath}.scene`);
    if (!Array.isArray(value.turns)) {
      fail(`Missing or invalid array at ${valuePath}.turns`, `${valuePath}.turns`);
    }

    const turns = value.turns.map((turn, index) => {
      if (!isPlainObject(turn)) {
        fail(`Missing or invalid object at ${valuePath}.turns[${index}]`, `${valuePath}.turns[${index}]`);
      }

      const normalizedTurn = {
        speaker: ensureString(turn.speaker, `${valuePath}.turns[${index}].speaker`),
        text: ensureString(turn.text, `${valuePath}.turns[${index}].text`),
      };

      if ("sourceModule" in turn) {
        const sourceModule = ensureString(turn.sourceModule, `${valuePath}.turns[${index}].sourceModule`);
        if (!["notice", "interpret", "interact_need", "interact_handle"].includes(sourceModule)) {
          fail(`Invalid sourceModule at ${valuePath}.turns[${index}].sourceModule`, `${valuePath}.turns[${index}].sourceModule`);
        }
        normalizedTurn.sourceModule = sourceModule;
      }

      if ("chunks" in turn || "answer" in turn || "distractors" in turn) {
        const chunks = Array.isArray(turn.chunks) ? ensureStringArray(turn.chunks, `${valuePath}.turns[${index}].chunks`) : [];
        const distractors = Array.isArray(turn.distractors) ? ensureStringArray(turn.distractors, `${valuePath}.turns[${index}].distractors`) : [];
        const answer = Array.isArray(turn.answer) ? ensureStringArray(turn.answer, `${valuePath}.turns[${index}].answer`) : [];

        if (chunks.length) {
          ensureUniqueStrings(chunks, `${valuePath}.turns[${index}].chunks`);
        }
        if (distractors.length) {
          ensureUniqueStrings(distractors, `${valuePath}.turns[${index}].distractors`);
        }
        if (answer.length) {
          ensureUniqueStrings(answer, `${valuePath}.turns[${index}].answer`);
          if (chunks.length) {
            ensureCoverage(chunks, answer, `${valuePath}.turns[${index}].answer`);
          }
        }

        normalizedTurn.chunks = chunks;
        normalizedTurn.distractors = distractors;
        normalizedTurn.answer = answer;
      }

      return normalizedTurn;
    });

    return {
      scene,
      turns,
    };
  });
}

function normalizeNoticeOrInterpretModule(module, path) {
  if (!isPlainObject(module)) {
    fail(`Missing or invalid object at ${path}`, path);
  }

  ensureSameKeys(module, ["title", "goal", "expressionPacks"], path);

  const expressionPacks = Array.isArray(module.expressionPacks)
    ? module.expressionPacks.map((pack, index) => normalizeExpressionPack(pack, `${path}.expressionPacks[${index}]`))
    : fail(`Missing or invalid array at ${path}.expressionPacks`, `${path}.expressionPacks`);

  ensureUniqueStrings(expressionPacks.map((pack) => pack.id), `${path}.expressionPacks.id`);

  return {
    title: ensureString(module.title, `${path}.title`),
    goal: ensureString(module.goal, `${path}.goal`),
    expressionPacks,
  };
}

function normalizeInteractModule(module, path) {
  if (!isPlainObject(module)) {
    fail(`Missing or invalid object at ${path}`, path);
  }

  ensureSameKeys(module, ["title", "goal", "taskPacks"], path);

  const taskPacks = Array.isArray(module.taskPacks)
    ? module.taskPacks.map((pack, index) => normalizeTaskPack(pack, `${path}.taskPacks[${index}]`))
    : fail(`Missing or invalid array at ${path}.taskPacks`, `${path}.taskPacks`);

  ensureUniqueStrings(taskPacks.map((pack) => pack.id), `${path}.taskPacks.id`);

  return {
    title: ensureString(module.title, `${path}.title`),
    goal: ensureString(module.goal, `${path}.goal`),
    taskPacks,
  };
}

function normalizeStepInModule(module, path) {
  if (!isPlainObject(module)) {
    fail(`Missing or invalid object at ${path}`, path);
  }

  ensureSameKeys(module, ["title", "goal", "dialogue"], path);

  return {
    title: ensureString(module.title, `${path}.title`),
    goal: ensureString(module.goal, `${path}.goal`),
    dialogue: normalizeStepInDialogue(module.dialogue, `${path}.dialogue`),
  };
}

function normalizeModules(modules) {
  if (!isPlainObject(modules)) {
    fail("Missing or invalid object at modules", "modules");
  }

  ensureExactKeyOrder(modules, MODULE_ORDER, "modules");

  return {
    notice: normalizeNoticeOrInterpretModule(modules.notice, "modules.notice"),
    interpret: normalizeNoticeOrInterpretModule(modules.interpret, "modules.interpret"),
    interact: normalizeInteractModule(modules.interact, "modules.interact"),
    stepIn: normalizeStepInModule(modules.stepIn, "modules.stepIn"),
  };
}

export function normalizeDeepCoursePayload(payload) {
  if (!isPlainObject(payload)) {
    fail("Deep course payload must be a JSON object", "root");
  }

  ensureSameKeys(payload, ["mode", "level", "overview", "modules"], "root");

  const mode = ensureString(payload.mode, "mode");
  if (mode !== "deep") {
    fail("Deep course payload must use mode=deep", "mode");
  }

  if (!isPlainObject(payload.overview)) {
    fail("Missing or invalid object at overview", "overview");
  }

  ensureSameKeys(payload.overview, ["keywords", "sceneDescriptionChinese", "startPromptChinese"], "overview");
  const keywords = ensureStringArray(payload.overview.keywords, "overview.keywords");
  ensureUniqueStrings(keywords, "overview.keywords");

  const normalized = {
    ...deepCourseContract,
    mode: "deep",
    level: normalizeLevel(payload.level),
    overview: {
      keywords,
      sceneDescriptionChinese: ensureString(payload.overview.sceneDescriptionChinese, "overview.sceneDescriptionChinese"),
      startPromptChinese: ensureString(payload.overview.startPromptChinese, "overview.startPromptChinese"),
    },
    modules: normalizeModules(payload.modules),
  };

  return normalized;
}
