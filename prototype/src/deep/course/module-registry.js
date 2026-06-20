export const DEEP_PHASE_ORDER = ["loading", "overview", "notice", "interpret", "interact", "stepIn", "completion"];

export const DEEP_MODULE_ORDER = ["notice", "interpret", "interact", "stepIn"];

export const DEEP_PHASE_META = {
  loading: {
    label: "Loading",
    family: "loading",
  },
  overview: {
    label: "Overview",
    family: "entry",
  },
  notice: {
    label: "Notice",
    family: "singleExercise",
    title: "Notice",
    description: "Describe what is visible in the photo.",
  },
  interpret: {
    label: "Interpret",
    family: "singleExercise",
    title: "Interpret",
    description: "Infer what may be happening in the scene.",
  },
  interact: {
    label: "Interact",
    family: "taskPack",
    title: "Interact",
    description: "Express a need and respond naturally.",
  },
  stepIn: {
    label: "Step In",
    family: "dialogueFlow",
    title: "Step In",
    description: "Complete one full scene conversation.",
  },
  completion: {
    label: "Completion",
    family: "summary",
    title: "Completion",
    description: "Review what you built across the course.",
  },
};

export function getDeepModuleIndex(phase) {
  return DEEP_MODULE_ORDER.indexOf(phase);
}

export function isDeepModulePhase(phase) {
  return DEEP_MODULE_ORDER.includes(phase);
}
