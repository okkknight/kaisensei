import { DEEP_PHASES } from "../course/module-registry.js";

export function createDeepCourseState({ level = "Normal", photoPreviewUrl = "" } = {}) {
  return {
    mode: "deep",
    level,
    photoPreviewUrl,
    phase: "overview",
    completedPhases: [],
    phases: DEEP_PHASES,
  };
}
