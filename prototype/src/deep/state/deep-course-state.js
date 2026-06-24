import { DEEP_PHASE_ORDER, DEEP_MODULE_ORDER, getDeepModuleIndex, isDeepModulePhase } from "../course/module-registry.js";

export function getCompletedPhases(phase) {
  const currentIndex = DEEP_PHASE_ORDER.indexOf(phase);
  if (currentIndex <= 0) {
    return [];
  }

  return DEEP_PHASE_ORDER.slice(0, currentIndex).filter((item) => isDeepModulePhase(item));
}

export function getNextDeepPhase(phase) {
  const currentIndex = DEEP_PHASE_ORDER.indexOf(phase);
  if (currentIndex < 0) {
    return "loading";
  }

  return DEEP_PHASE_ORDER[Math.min(currentIndex + 1, DEEP_PHASE_ORDER.length - 1)];
}

export function getPreviousDeepPhase(phase) {
  const currentIndex = DEEP_PHASE_ORDER.indexOf(phase);
  if (currentIndex <= 0) {
    return "loading";
  }

  return DEEP_PHASE_ORDER[Math.max(currentIndex - 1, 0)];
}

export function createDeepCourseState({
  level = "Normal",
  photoPreviewUrl = "",
  phase = "loading",
  loadingMessageIndex = 0,
  lessonReadyStage = null,
} = {}) {
  const moduleIndex = isDeepModulePhase(phase) ? getDeepModuleIndex(phase) : -1;

  return {
    mode: "deep",
    level,
    photoPreviewUrl,
    phase,
    lessonReadyStage,
    moduleIndex,
    completedPhases: getCompletedPhases(phase),
    phases: DEEP_PHASE_ORDER,
    modulePhases: DEEP_MODULE_ORDER,
    loadingMessageIndex,
  };
}
