export const deepModuleOrder = ["notice", "interpret", "interact", "stepIn"];

const deepExerciseContract = {
  chunks: [],
  distractors: [],
  answer: [],
};

const deepFocusContract = {
  sentenceWithBlanks: "",
  choices: [],
  distractors: [],
  answer: [],
};

const deepExampleContract = {
  english: "",
  chinese: "",
  understand: deepExerciseContract,
  focus: deepFocusContract,
  build: {
    promptChinese: "",
    chunks: [],
    distractors: [],
    answer: [],
  },
  quickResponse: {
    questionChinese: "",
    question: "",
    chunks: [],
    distractors: [],
    answer: [],
  },
};

const deepTaskDialogueContract = {
  scene: "",
  need: deepExerciseContract,
  systemReply: "",
  handle: deepExerciseContract,
};

const deepTaskPackContract = {
  id: "",
  taskTitle: "",
  scenePrompt: "",
  scenePromptChinese: "",
  need: {
    coreExpression: "",
    meaningChinese: "",
    baseExample: deepExampleContract,
    variations: [],
  },
  handle: {
    coreExpression: "",
    meaningChinese: "",
    baseExample: deepExampleContract,
    variations: [],
  },
  dialogues: [deepTaskDialogueContract],
};

const deepStepInTurnContract = {
  speaker: "",
  text: "",
  sourceModule: "",
  chunks: [],
  distractors: [],
  answer: [],
};

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
      dialogue: {
        scene: "",
        sceneChinese: "",
        turns: [],
      },
    },
  },
};

export const deepCourseContractShape = {
  ...deepCourseContract,
  modules: {
    ...deepCourseContract.modules,
    interact: {
      ...deepCourseContract.modules.interact,
      taskPacks: [deepTaskPackContract],
    },
    stepIn: {
      ...deepCourseContract.modules.stepIn,
      dialogue: {
        scene: "",
        sceneChinese: "",
        turns: [deepStepInTurnContract],
      },
    },
  },
};
