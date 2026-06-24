const deepGenerationStageOrder = ["overview_notice", "interpret", "interact", "step_in"];
const deepGenerationStageNextMap = {
  overview_notice: "interpret",
  interpret: "interact",
  interact: "step_in",
  step_in: null,
};
const deepModulePhaseToStageMap = {
  notice: "interpret",
  interpret: "interact",
  interact: "step_in",
  stepIn: null,
};

function normalizeLevel(level) {
  return String(level || "Normal").toLowerCase() === "advanced" ? "advanced" : "normal";
}

function hasFrozenStage(generation, stage) {
  return Boolean(generation?.frozenLesson?.[stage]);
}

export function getDeepGenerationReadyStage(generation) {
  if (!generation || typeof generation !== "object") {
    return null;
  }

  if (generation.stageStates?.step_in === "ready" && hasFrozenStage(generation, "stepIn")) {
    return "step_in";
  }

  if (generation.stageStates?.interact === "ready" && hasFrozenStage(generation, "interact")) {
    return "interact";
  }

  if (generation.stageStates?.interpret === "ready" && hasFrozenStage(generation, "interpret")) {
    return "interpret";
  }

  if (generation.stageStates?.overview_notice === "ready" && hasFrozenStage(generation, "overview") && hasFrozenStage(generation, "notice")) {
    return "overview_notice";
  }

  return null;
}

export function createDeepCourseLessonSnapshot(job) {
  if (!job) {
    return null;
  }

  if (job.lesson) {
    return {
      lesson: job.lesson,
      readyStage: "complete",
      isComplete: true,
    };
  }

  const readyStage = getDeepGenerationReadyStage(job.generation);
  if (!readyStage) {
    return null;
  }

  const frozenLesson = job.generation?.frozenLesson || {};

  return {
    lesson: {
      mode: "deep",
      level: normalizeLevel(job.level),
      overview: frozenLesson.overview || null,
      modules: {
        notice: frozenLesson.notice || null,
        interpret: frozenLesson.interpret || null,
        interact: frozenLesson.interact || null,
        stepIn: frozenLesson.stepIn || null,
      },
    },
    readyStage,
    isComplete: false,
  };
}

export function hasDeepLessonSnapshot(job) {
  return Boolean(createDeepCourseLessonSnapshot(job));
}

export function getDeepGenerationStageOrder() {
  return [...deepGenerationStageOrder];
}

export function getDeepGenerationStageStatus(generation, stage) {
  if (!generation || !stage) {
    return null;
  }

  return generation.stageStates?.[stage] ?? null;
}

export function getDeepGenerationNextStage(stage) {
  return deepGenerationStageNextMap[stage] ?? null;
}

export function getDeepGenerationNextStageForModule(modulePhase) {
  return deepModulePhaseToStageMap[modulePhase] ?? null;
}

export function getDeepGenerationGateState(generation, modulePhase) {
  const nextStage = getDeepGenerationNextStageForModule(modulePhase);
  const nextStageState = nextStage ? getDeepGenerationStageStatus(generation, nextStage) : null;

  return {
    nextStage,
    nextStageState,
    isReady: nextStageState === "ready",
    isFailed: nextStageState === "failed",
    isRunning: nextStageState === "running" || nextStageState === "pending",
  };
}
