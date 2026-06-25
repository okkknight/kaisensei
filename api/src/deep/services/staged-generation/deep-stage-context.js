import { lessonJobGenerationStages } from "../../../contracts/job.js";

const stageBackgroundKeys = {
  overview_notice: ["overview"],
  interpret: ["overview", "notice"],
  interact: ["overview", "notice", "interpret"],
  step_in: ["overview", "notice", "interpret", "interact"],
};

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneValue(item)]));
  }

  return value;
}

function pickBackground(frozenLesson, keys) {
  return Object.fromEntries(keys.map((key) => [key, cloneValue(frozenLesson?.[key] ?? null)]));
}

export function isDeepStage(stage) {
  return lessonJobGenerationStages.includes(stage);
}

export function getDeepStageBackground(frozenLesson = {}, stage) {
  const keys = stageBackgroundKeys[stage] || [];
  return pickBackground(frozenLesson, keys);
}

export function getStepInFrozenBackgroundSummarySource(background = {}) {
  return pickBackground(background, ["overview", "notice", "interpret", "interact"]);
}

export function createDeepStageContext({
  stage,
  level,
  frozenLesson = {},
  imageBuffer = null,
  mimeType = "",
  traceId = "",
} = {}) {
  return {
    stage,
    level,
    traceId,
    imageBuffer,
    mimeType,
    background: getDeepStageBackground(frozenLesson, stage),
  };
}

export function mergeDeepStageResult(frozenLesson = {}, stage, fragment = {}) {
  const nextFrozenLesson = cloneValue(frozenLesson);

  if (stage === "overview_notice") {
    if (fragment.overview) {
      nextFrozenLesson.overview = cloneValue(fragment.overview);
    }
    if (fragment.modules?.notice) {
      nextFrozenLesson.notice = cloneValue(fragment.modules.notice);
    }
  }

  if (stage === "interpret" && fragment.modules?.interpret) {
    nextFrozenLesson.interpret = cloneValue(fragment.modules.interpret);
  }

  if (stage === "interact" && fragment.modules?.interact) {
    nextFrozenLesson.interact = cloneValue(fragment.modules.interact);
  }

  if (stage === "step_in" && fragment.modules?.stepIn) {
    nextFrozenLesson.stepIn = cloneValue(fragment.modules.stepIn);
  }

  return nextFrozenLesson;
}
