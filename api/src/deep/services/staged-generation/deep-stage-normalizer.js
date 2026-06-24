import { deepCourseDefaultConfig } from "../../config/course.js";
import {
  normalizeExpressionPack,
  normalizeLevel,
  normalizeOverview,
  normalizeStepInDialogue,
  normalizeTaskPack,
} from "../course-normalizer.js";
import { LessonValidationError } from "../../../shared/ai/errors.js";

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function fail(message, path) {
  throw new LessonValidationError(`${message}${path ? ` at ${path}` : ""}`, {
    code: "validation_error",
    path: path || "",
  });
}

function ensureStageObject(payload, path) {
  if (!isPlainObject(payload)) {
    fail("Missing or invalid object", path);
  }
  return payload;
}

function readModuleSource(payload, moduleName) {
  if (isPlainObject(payload?.modules) && payload.modules[moduleName]) {
    return payload.modules[moduleName];
  }

  if (isPlainObject(payload?.[moduleName])) {
    return payload[moduleName];
  }

  return null;
}

function normalizeNoticeModule(modulePayload, config = deepCourseDefaultConfig) {
  const payload = ensureStageObject(modulePayload, "modules.notice");
  const packs = Array.isArray(payload.expressionPacks) ? payload.expressionPacks : [];
  if (packs.length !== config.notice.coreExpressionCount) {
    fail("Invalid notice expression pack count", "modules.notice.expressionPacks");
  }

  return {
    ...payload,
    title: "Notice",
    goal: "Describe what is visible in the photo.",
    expressionPacks: packs.map((pack, index) => normalizeExpressionPack(pack, `modules.notice.expressionPacks[${index}]`, config.notice, config.exercise)),
  };
}

function normalizeInterpretModule(modulePayload, config = deepCourseDefaultConfig) {
  const payload = ensureStageObject(modulePayload, "modules.interpret");
  const packs = Array.isArray(payload.expressionPacks) ? payload.expressionPacks : [];
  if (packs.length !== config.interpret.coreExpressionCount) {
    fail("Invalid interpret expression pack count", "modules.interpret.expressionPacks");
  }

  return {
    ...payload,
    title: "Interpret",
    goal: "Infer what may be happening in the scene.",
    expressionPacks: packs.map((pack, index) => normalizeExpressionPack(pack, `modules.interpret.expressionPacks[${index}]`, config.interpret, config.exercise)),
  };
}

function normalizeInteractModule(modulePayload, config = deepCourseDefaultConfig) {
  const payload = ensureStageObject(modulePayload, "modules.interact");
  const packs = Array.isArray(payload.taskPacks) ? payload.taskPacks : [];
  if (packs.length !== config.interact.taskPackCount) {
    fail("Invalid interact task pack count", "modules.interact.taskPacks");
  }

  return {
    ...payload,
    title: "Interact",
    goal: "Express a need and respond naturally.",
    taskPacks: packs.map((pack, index) => normalizeTaskPack(pack, `modules.interact.taskPacks[${index}]`, config.interact, config.exercise)),
  };
}

function normalizeStepInModule(modulePayload, config = deepCourseDefaultConfig) {
  const payload = ensureStageObject(modulePayload, "modules.stepIn");
  const dialogue = normalizeStepInDialogue(payload.dialogue || {}, config.stepIn, config.exercise);

  return {
    ...payload,
    title: "Step In",
    goal: "Complete one full scene conversation.",
    dialogue,
  };
}

export function normalizeDeepStagePayload({ stage, payload, config = deepCourseDefaultConfig } = {}) {
  if (!stage) {
    fail("Missing stage");
  }

  if (!isPlainObject(payload)) {
    fail("Missing or invalid stage payload");
  }

  const level = normalizeLevel(payload.level ?? "Normal");

  if (stage === "overview_notice") {
    const overview = normalizeOverview(payload.overview || {}, config);
    const notice = normalizeNoticeModule(readModuleSource(payload, "notice"), config);

    return {
      mode: "deep",
      level,
      overview,
      modules: {
        notice,
      },
    };
  }

  if (stage === "interpret") {
    const interpret = normalizeInterpretModule(readModuleSource(payload, "interpret"), config);

    return {
      mode: "deep",
      level,
      modules: {
        interpret,
      },
    };
  }

  if (stage === "interact") {
    const interact = normalizeInteractModule(readModuleSource(payload, "interact"), config);

    return {
      mode: "deep",
      level,
      modules: {
        interact,
      },
    };
  }

  if (stage === "step_in") {
    const stepIn = normalizeStepInModule(readModuleSource(payload, "stepIn"), config);

    return {
      mode: "deep",
      level,
      modules: {
        stepIn,
      },
    };
  }

  fail(`Unsupported stage ${stage}`);
}
