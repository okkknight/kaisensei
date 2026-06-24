import { lessonJobGenerationActiveStages, lessonJobGenerationStages } from "../../../contracts/job.js";

function createStageStates() {
  return Object.fromEntries(lessonJobGenerationStages.map((stage) => [stage, "pending"]));
}

export function createDeepGenerationState() {
  return {
    activeStage: lessonJobGenerationActiveStages[0],
    stageStates: createStageStates(),
    frozenLesson: {
      overview: null,
      notice: null,
      interpret: null,
      interact: null,
      stepIn: null,
    },
    errorStage: null,
    errorMessage: null,
  };
}

export function cloneDeepGenerationState(generation) {
  if (!generation) {
    return createDeepGenerationState();
  }

  return {
    activeStage: generation.activeStage,
    stageStates: {
      ...createStageStates(),
      ...(generation.stageStates || {}),
    },
    frozenLesson: {
      overview: null,
      notice: null,
      interpret: null,
      interact: null,
      stepIn: null,
      ...(generation.frozenLesson || {}),
    },
    errorStage: generation.errorStage ?? null,
    errorMessage: generation.errorMessage ?? null,
  };
}
