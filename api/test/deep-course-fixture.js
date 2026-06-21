function makeUnderstandExercise(label) {
  return {
    chunks: [`${label} A`, `${label} B`],
    distractors: [`${label} extra`],
    answer: [`${label} A`, `${label} B`],
  };
}

function makeFocusExercise(label) {
  return {
    sentenceWithBlanks: `${label} ____ ____ the desk.`,
    choices: ["next", "to", "under"],
    distractors: ["under"],
    answer: ["next", "to"],
  };
}

function makeBuildExercise(label) {
  return {
    promptChinese: `${label} 的英文怎么说？`,
    chunks: [`${label} A`, `${label} B`],
    distractors: [`${label} extra`],
    answer: [`${label} A`, `${label} B`],
  };
}

function makeQuickResponse(label) {
  return {
    question: `Quick response for ${label}?`,
    chunks: [`${label} reply A`, `${label} reply B`],
    distractors: [`${label} reply extra`],
    answer: [`${label} reply A`, `${label} reply B`],
  };
}

function makeBaseExample(label) {
  return {
    english: `${label} example sentence.`,
    chinese: `${label} 示例句子。`,
    understand: makeUnderstandExercise(`${label} understand`),
    focus: makeFocusExercise(`${label} focus`),
    build: makeBuildExercise(`${label} build`),
  };
}

function makeExpressionPack(id, coreExpression) {
  return {
    id,
    coreExpression,
    meaningChinese: `${coreExpression} 的中文意思`,
    baseExample: makeBaseExample(coreExpression),
    variations: [makeBaseExample(`${coreExpression} variation`)],
    quickResponses: [makeQuickResponse(coreExpression)],
  };
}

function makeDialogueTurn(label, sourceModule) {
  return {
    speaker: "user",
    text: `${label} user line.`,
    sourceModule,
    chunks: [`${label} turn A`, `${label} turn B`],
    distractors: [`${label} turn extra`],
    answer: [`${label} turn A`, `${label} turn B`],
  };
}

function makeSystemTurn(label) {
  return {
    speaker: "system",
    text: `${label} system line.`,
  };
}

function makeTaskPack(id, label) {
  return {
    id,
    taskTitle: `${label} task`,
    scenePrompt: `${label} scene prompt`,
    need: {
      coreExpression: `${label} need`,
      meaningChinese: `${label} 需求`,
      baseExample: makeBaseExample(`${label} need`),
      variations: [makeBaseExample(`${label} need variation`)],
    },
    handle: {
      coreExpression: `${label} handle`,
      meaningChinese: `${label} 应对`,
      baseExample: makeBaseExample(`${label} handle`),
      variations: [makeBaseExample(`${label} handle variation`)],
    },
    dialogues: [
      {
        scene: `${label} dialogue scene`,
        need: makeBuildExercise(`${label} dialogue need`),
        systemReply: `${label} bridge reply`,
        handle: makeBuildExercise(`${label} dialogue handle`),
      },
    ],
  };
}

export function buildValidDeepCoursePayload() {
  return {
    mode: "deep",
    level: "Normal",
    overview: {
      keywords: ["coffee", "table", "laptop"],
      sceneDescriptionChinese: "咖啡桌上的安静下午",
      startPromptChinese: "点击开始这次学习之旅",
    },
    modules: {
      notice: {
        title: "Notice",
        goal: "Describe what is visible in the photo.",
        expressionPacks: [
          makeExpressionPack("notice-1", "next to"),
          makeExpressionPack("notice-2", "on the desk"),
        ],
      },
      interpret: {
        title: "Interpret",
        goal: "Infer what may be happening in the scene.",
        expressionPacks: [
          makeExpressionPack("interpret-1", "looks like work"),
          makeExpressionPack("interpret-2", "feels calm"),
        ],
      },
      interact: {
        title: "Interact",
        goal: "Express a need and respond naturally.",
        taskPacks: [
          makeTaskPack("task-1", "task one"),
          makeTaskPack("task-2", "task two"),
        ],
      },
      stepIn: {
        title: "Step In",
        goal: "Complete one full scene conversation.",
        dialogue: {
          scene: "A quiet desk scene",
          turns: [
            makeSystemTurn("notice 1"),
            makeDialogueTurn("notice 1", "notice"),
            makeSystemTurn("interpret 1"),
            makeDialogueTurn("interpret 1", "interpret"),
            makeSystemTurn("need 1"),
            makeDialogueTurn("need 1", "interact"),
            makeSystemTurn("handle 1"),
            makeDialogueTurn("handle 1", "interact"),
          ],
        },
      },
    },
  };
}
