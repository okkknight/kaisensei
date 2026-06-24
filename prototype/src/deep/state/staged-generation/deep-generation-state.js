const deepGenerationStageOrder = ["overview_notice", "interpret", "interact", "step_in"];

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
