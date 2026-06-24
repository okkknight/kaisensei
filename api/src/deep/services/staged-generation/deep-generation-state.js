import { lessonJobGenerationActiveStages, lessonJobGenerationStages } from "../../../contracts/job.js";

export function getDeepGenerationStageIndex(stage) {
  return lessonJobGenerationStages.indexOf(stage);
}

export function getDeepGenerationNextStage(stage) {
  const index = getDeepGenerationStageIndex(stage);
  if (index < 0) {
    return "complete";
  }

  return lessonJobGenerationActiveStages[Math.min(index + 1, lessonJobGenerationActiveStages.length - 1)];
}

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

export function setDeepGenerationStageState(generation, stage, stageState, patch = {}) {
  const nextGeneration = cloneDeepGenerationState(generation);

  if (stage in nextGeneration.stageStates) {
    nextGeneration.stageStates[stage] = stageState;
  }

  if (patch.activeStage !== undefined) {
    nextGeneration.activeStage = patch.activeStage;
  }

  if (patch.errorStage !== undefined) {
    nextGeneration.errorStage = patch.errorStage;
  }

  if (patch.errorMessage !== undefined) {
    nextGeneration.errorMessage = patch.errorMessage;
  }

  if (patch.frozenLesson !== undefined) {
    nextGeneration.frozenLesson = {
      ...nextGeneration.frozenLesson,
      ...patch.frozenLesson,
    };
  }

  return nextGeneration;
}
