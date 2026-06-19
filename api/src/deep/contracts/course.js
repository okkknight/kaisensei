export const deepModuleOrder = ["notice", "interpret", "interact", "stepIn"];

export const deepCourseContract = {
  mode: "deep",
  level: "normal",
  overview: {
    keywords: [],
    sceneDescriptionChinese: "",
    startPromptChinese: "",
  },
  modules: {
    notice: {
      title: "Notice",
      goal: "Describe what is visible in the photo.",
      expressionPacks: [],
    },
    interpret: {
      title: "Interpret",
      goal: "Infer what may be happening in the scene.",
      expressionPacks: [],
    },
    interact: {
      title: "Interact",
      goal: "Express a need and respond naturally.",
      taskPacks: [],
    },
    stepIn: {
      title: "Step In",
      goal: "Complete one full scene conversation.",
      dialogue: {},
    },
  },
};
