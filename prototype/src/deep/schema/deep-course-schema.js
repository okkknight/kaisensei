const deepCourseDefaultFixedCopy = {
  startPromptChinese: "点击开始这次学习之旅",
};

function createReorderExercise({ chunks, answer, distractors = [], highlight = "" }) {
  return {
    chunks,
    distractors,
    answer,
    highlight,
  };
}

function createVariation({ english, chinese, understand, focus, build }) {
  return {
    english,
    chinese,
    understand,
    focus,
    build,
  };
}

function createExpressionExample({ english, chinese, understand, focus, build, quickResponse }) {
  return {
    english,
    chinese,
    understand,
    focus,
    build,
    quickResponse,
  };
}

function createExpressionPack({
  id,
  coreExpression,
  meaningChinese,
  baseExample,
  variations,
}) {
  return {
    id,
    coreExpression,
    meaningChinese,
    baseExample,
    variations,
  };
}

function createTaskPack({
  id,
  taskTitle,
  scenePrompt,
  scenePromptChinese,
  need,
  handle,
  dialogues,
}) {
  return {
    id,
    taskTitle,
    scenePrompt,
    scenePromptChinese,
    need,
    handle,
    dialogues,
  };
}

export function createDeepCourseLesson(level = "Normal") {
  const normalizedLevel = String(level || "Normal").toLowerCase() === "advanced" ? "advanced" : "normal";

  return {
    mode: "deep",
    level: normalizedLevel,
    overview: {
      keywords: ["coffee", "table", "laptop"],
      sceneDescriptionChinese: "安静的桌面工作场景",
      startPromptChinese: deepCourseDefaultFixedCopy.startPromptChinese,
    },
    modules: {
      notice: {
        title: "Notice",
        goal: "Describe what is visible in the photo.",
        expressionPacks: [
          createExpressionPack({
            id: "notice-1",
            coreExpression: "a coffee mug",
            meaningChinese: "一个咖啡杯",
            baseExample: {
              english: "A coffee mug is next to the laptop.",
              chinese: "一个咖啡杯放在笔记本电脑旁边。",
              understand: createReorderExercise({
                chunks: ["一个咖啡杯", "放在", "笔记本电脑旁边"],
                distractors: ["在桌上"],
                highlight: "a coffee mug",
                answer: ["一个咖啡杯", "放在", "笔记本电脑旁边"],
              }),
              focus: {
                sentenceWithBlanks: "____ is next to the laptop.",
                choices: ["a coffee mug"],
                distractors: ["a laptop", "the desk"],
                answer: ["a coffee mug"],
              },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["A coffee mug", "is next to", "the laptop"],
                distractors: ["on the shelf"],
                answer: ["A coffee mug", "is next to", "the laptop"],
              },
              quickResponse: {
                question: "What is next to the laptop?",
                chunks: ["A coffee mug", "is next to", "the laptop"],
                distractors: ["A notebook"],
                answer: ["A coffee mug", "is next to", "the laptop"],
              },
            },
            variations: [],
          }),
          createExpressionPack({
            id: "notice-2",
            coreExpression: "a laptop",
            meaningChinese: "一台笔记本电脑",
            baseExample: {
              english: "A laptop is open on the desk.",
              chinese: "一台笔记本电脑打开着放在桌上。",
              understand: createReorderExercise({
                chunks: ["一台笔记本电脑", "打开着", "放在桌上"],
                distractors: ["靠近窗边"],
                highlight: "laptop",
                answer: ["一台笔记本电脑", "打开着", "放在桌上"],
              }),
              focus: {
                sentenceWithBlanks: "____ is open on the desk.",
                choices: ["a laptop"],
                distractors: ["a notebook", "the plant"],
                answer: ["a laptop"],
              },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["A laptop", "is open", "on the desk"],
                distractors: ["by the window"],
                answer: ["A laptop", "is open", "on the desk"],
              },
              quickResponse: {
                question: "What is open on the desk?",
                chunks: ["A laptop", "is open", "on the desk"],
                distractors: ["A plant"],
                answer: ["A laptop", "is open", "on the desk"],
              },
            },
            variations: [],
          }),
          createExpressionPack({
            id: "notice-3",
            coreExpression: "on the desk",
            meaningChinese: "在桌上",
            baseExample: {
              english: "A notebook is on the desk.",
              chinese: "一本笔记本放在桌上。",
              understand: createReorderExercise({
                chunks: ["一本笔记本", "放在", "桌上"],
                distractors: ["靠近窗边"],
                highlight: "on the desk",
                answer: ["一本笔记本", "放在", "桌上"],
              }),
              focus: {
                sentenceWithBlanks: "A notebook is ____ the desk.",
                choices: ["on", "under", "near"],
                distractors: ["under"],
                answer: ["on"],
              },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["A notebook", "is on", "the desk"],
                distractors: ["by the window"],
                answer: ["A notebook", "is on", "the desk"],
              },
              quickResponse: {
                question: "Where is the notebook?",
                chunks: ["It is", "on", "the desk"],
                distractors: ["under the chair"],
                answer: ["It is", "on", "the desk"],
              },
            },
            variations: [],
          }),
        ],
      },
      interpret: {
        title: "Interpret",
        goal: "Infer what may be happening in the scene.",
        expressionPacks: [
          createExpressionPack({
            id: "interpret-1",
            coreExpression: "a quiet work setup",
            meaningChinese: "安静的工作环境",
            baseExample: {
              english: "It looks like a quiet work setup.",
              chinese: "看起来像一个安静的工作环境。",
              understand: createReorderExercise({
                chunks: ["这看起来像", "一个", "安静的工作环境"],
                distractors: ["一个热闹派对"],
                highlight: "quiet work setup",
                answer: ["这看起来像", "一个", "安静的工作环境"],
              }),
              focus: {
                sentenceWithBlanks: "It looks like a ____ work ____.",
                choices: ["quiet", "setup", "busy"],
                distractors: ["busy"],
                answer: ["quiet", "setup"],
              },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["It looks like", "a quiet work", "setup"],
                distractors: ["a busy party"],
                answer: ["It looks like", "a quiet work", "setup"],
              },
              quickResponse: {
                question: "How does the space feel?",
                chunks: ["It feels", "calm", "and focused"],
                distractors: ["It feels loud and crowded."],
                answer: ["It feels", "calm", "and focused"],
              },
            },
            variations: [],
          }),
          createExpressionPack({
            id: "interpret-2",
            coreExpression: "ready for work",
            meaningChinese: "准备工作",
            baseExample: {
              english: "The laptop seems ready for work.",
              chinese: "这台笔记本电脑看起来已经准备好工作了。",
              understand: createReorderExercise({
                chunks: ["这台笔记本电脑", "看起来", "已经准备好工作了"],
                distractors: ["想睡一会儿"],
                highlight: "ready for work",
                answer: ["这台笔记本电脑", "看起来", "已经准备好工作了"],
              }),
              focus: {
                sentenceWithBlanks: "The laptop seems ready for ____.",
                choices: ["work", "sleep", "fun"],
                distractors: ["sleep"],
                answer: ["work"],
              },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["The laptop", "seems ready for", "work"],
                distractors: ["needs a nap"],
                answer: ["The laptop", "seems ready for", "work"],
              },
              quickResponse: {
                question: "What seems ready for work?",
                chunks: ["The laptop", "is", "ready for work"],
                distractors: ["The plant"],
                answer: ["The laptop", "is", "ready for work"],
              },
            },
            variations: [],
          }),
          createExpressionPack({
            id: "interpret-3",
            coreExpression: "feels calm",
            meaningChinese: "感觉很安静",
            baseExample: {
              english: "The place feels calm.",
              chinese: "这里感觉很安静。",
              understand: createReorderExercise({
                chunks: ["这里", "感觉", "很安静"],
                distractors: ["很吵"],
                highlight: "feels calm",
                answer: ["这里", "感觉", "很安静"],
              }),
              focus: {
                sentenceWithBlanks: "The place feels ____.",
                choices: ["calm", "busy", "noisy"],
                distractors: ["busy"],
                answer: ["calm"],
              },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["The place", "feels", "calm"],
                distractors: ["very noisy"],
                answer: ["The place", "feels", "calm"],
              },
              quickResponse: {
                question: "How does the place feel?",
                chunks: ["It feels", "calm"],
                distractors: ["It feels crowded"],
                answer: ["It feels", "calm"],
              },
            },
            variations: [],
          }),
        ],
      },
      interact: {
        title: "Interact",
        goal: "Express a need and respond naturally.",
        taskPacks: [
          createTaskPack({
            id: "interact-1",
            taskTitle: "Need a quick break",
            scenePrompt: "You are talking about a short break at your desk.",
            scenePromptChinese: "你正在桌边想休息一下。",
            need: {
              coreExpression: "a short break",
              meaningChinese: "我可以休息一下吗？",
              baseExample: {
              english: "Can I take a short break?",
              chinese: "我可以休息一下吗？",
              understand: createReorderExercise({
                  chunks: ["我可以", "休息一下", "吗"],
                  distractors: ["现在", "马上"],
                  highlight: "take a short break",
                  answer: ["我可以", "休息一下", "吗"],
              }),
                focus: {
                  sentenceWithBlanks: "Can I take a ____ ____?",
                  choices: ["short", "break", "quiet"],
                  distractors: ["quiet"],
                  answer: ["short", "break"],
                },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["Can I take", "a short", "break"],
                distractors: ["the keyboard"],
                answer: ["Can I take", "a short", "break"],
              },
            },
              variations: [],
            },
            handle: {
              coreExpression: "go ahead",
              meaningChinese: "当然，可以。",
              baseExample: {
              english: "Sure, go ahead.",
              chinese: "当然，可以。",
              understand: createReorderExercise({
                  chunks: ["当然", "可以", "啊"],
                  distractors: ["等等"],
                  highlight: "go ahead",
                  answer: ["当然", "可以", "啊"],
              }),
                focus: {
                  sentenceWithBlanks: "Sure, ____ ____.",
                  choices: ["go", "ahead", "back"],
                  distractors: ["back"],
                  answer: ["go", "ahead"],
                },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["Sure", "go", "ahead"],
                distractors: ["wait here"],
                answer: ["Sure", "go", "ahead"],
              },
            },
              variations: [],
            },
            dialogues: [
              {
                scene: "A coworker is sitting at the desk while you ask for a short break.",
                need: {
                  chunks: ["Can I take", "a short break"],
                  distractors: ["the keyboard"],
                  answer: ["Can I take", "a short break"],
                },
                systemReply: "No problem, take your time.",
                handle: {
                  chunks: ["Sure", "go ahead"],
                  distractors: ["I will work forever"],
                  answer: ["Sure", "go ahead"],
                },
              },
            ],
          }),
          createTaskPack({
            id: "interact-2",
            taskTitle: "Ask about coffee",
            scenePrompt: "You are talking with someone near the desk.",
            scenePromptChinese: "你正在桌边和别人聊咖啡。",
            need: {
              coreExpression: "some coffee",
              meaningChinese: "你想喝点咖啡吗？",
              baseExample: {
              english: "Do you want some coffee?",
              chinese: "你想喝点咖啡吗？",
              understand: createReorderExercise({
                  chunks: ["你想", "喝点咖啡", "吗"],
                  distractors: ["看本笔记"],
                  highlight: "some coffee",
                  answer: ["你想", "喝点咖啡", "吗"],
              }),
                focus: {
                  sentenceWithBlanks: "Do you want some ____?",
                  choices: ["coffee", "paper", "music"],
                  distractors: ["music"],
                  answer: ["coffee"],
                },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["Do you want", "some", "coffee"],
                distractors: ["a notebook"],
                answer: ["Do you want", "some", "coffee"],
              },
            },
              variations: [],
            },
            handle: {
              coreExpression: "please",
              meaningChinese: "好的，请。",
              baseExample: {
              english: "Yes, please.",
              chinese: "好的，请。",
              understand: createReorderExercise({
                  chunks: ["好的", "请", "吧"],
                  distractors: ["不用了"],
                  highlight: "please",
                  answer: ["好的", "请", "吧"],
              }),
                focus: {
                  sentenceWithBlanks: "Yes, ____.",
                  choices: ["please", "no", "thanks"],
                  distractors: ["thanks"],
                  answer: ["please"],
                },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["Yes", "please", "now"],
                distractors: ["no thanks"],
                answer: ["Yes", "please", "now"],
              },
            },
              variations: [],
            },
            dialogues: [
              {
                scene: "A colleague asks if you want a coffee break together.",
                need: {
                  chunks: ["Do you want", "some coffee"],
                  distractors: ["a notebook"],
                  answer: ["Do you want", "some coffee"],
                },
                systemReply: "Sounds good.",
                handle: {
                  chunks: ["Yes", "please"],
                  distractors: ["stay busy forever"],
                  answer: ["Yes", "please"],
                },
              },
            ],
          }),
        ],
      },
      stepIn: {
        title: "Step In",
        goal: "Keep the conversation moving.",
        dialogue: {
          scene: "You are at a desk with your laptop, and a coworker is nearby.",
          turns: [
            {
              speaker: "system",
              text: "Looks like a long afternoon.",
            },
            {
              speaker: "user",
              text: "A coffee mug is next to the laptop.",
              sourceModule: "notice",
              chunks: ["A coffee mug", "is next to", "the laptop"],
              distractors: ["on the shelf"],
              answer: ["A coffee mug", "is next to", "the laptop"],
            },
            {
              speaker: "system",
              text: "Yeah, it feels pretty calm here.",
            },
            {
              speaker: "user",
              text: "It looks like a quiet work setup.",
              sourceModule: "interpret",
              chunks: ["It looks like", "a quiet work setup"],
              distractors: ["a busy party"],
              answer: ["It looks like", "a quiet work setup"],
            },
            {
              speaker: "system",
              text: "I could use a quick break.",
            },
            {
              speaker: "user",
              text: "Can I take a short break?",
              sourceModule: "interact_need",
              chunks: ["Can I take", "a short break"],
              distractors: ["the keyboard"],
              answer: ["Can I take", "a short break"],
            },
            {
              speaker: "system",
              text: "Sure, go ahead.",
            },
            {
              speaker: "user",
              text: "Sure, go ahead.",
              sourceModule: "interact_handle",
              chunks: ["Sure", "go ahead"],
              distractors: ["wait here"],
              answer: ["Sure", "go ahead"],
            },
          ],
        },
      },
    },
  };
}

export const DEEP_COURSE_SCHEMA = createDeepCourseLesson("Normal");

export function createDeepCourseViewModel({ lesson, photoPreviewUrl = "" } = {}) {
  if (!lesson) {
    return null;
  }

  const noticePacks = lesson?.modules?.notice?.expressionPacks ?? [];
  const interpretPacks = lesson?.modules?.interpret?.expressionPacks ?? [];
  const interactTaskPacks = lesson?.modules?.interact?.taskPacks ?? [];
  const interactDialogues = interactTaskPacks.flatMap((taskPack) => taskPack?.dialogues ?? []);
  const stepInTurns = lesson?.modules?.stepIn?.dialogue?.turns ?? [];

  return {
    overviewVM: {
      photoPreviewUrl,
      keywords: lesson?.overview?.keywords ?? [],
      sceneDescriptionChinese: lesson?.overview?.sceneDescriptionChinese ?? "",
    },
    noticeVM: {
      title: lesson?.modules?.notice?.title ?? "Notice",
      goal: lesson?.modules?.notice?.goal ?? "",
      expressionPacks: noticePacks,
    },
    interpretVM: {
      title: lesson?.modules?.interpret?.title ?? "Interpret",
      goal: lesson?.modules?.interpret?.goal ?? "",
      expressionPacks: interpretPacks,
    },
    interactVM: {
      title: lesson?.modules?.interact?.title ?? "Interact",
      goal: lesson?.modules?.interact?.goal ?? "",
      taskPacks: interactTaskPacks,
      dialogues: interactDialogues,
    },
    stepInVM: {
      title: lesson?.modules?.stepIn?.title ?? "Step In",
      goal: lesson?.modules?.stepIn?.goal ?? "",
      scene: lesson?.modules?.stepIn?.dialogue?.scene ?? "",
      turns: stepInTurns,
    },
    completionVM: {
      photoPreviewUrl,
      noticeItems: noticePacks.map((pack) => ({
        title: pack?.coreExpression ?? "",
        body: pack?.meaningChinese ?? "",
      })),
      interpretItems: interpretPacks.map((pack) => ({
        title: pack?.coreExpression ?? "",
        body: pack?.meaningChinese ?? "",
      })),
      interactItems: interactTaskPacks.flatMap((taskPack) => [
        {
          title: taskPack?.need?.coreExpression ?? "",
          body: taskPack?.need?.meaningChinese ?? "",
        },
        {
          title: taskPack?.handle?.coreExpression ?? "",
          body: taskPack?.handle?.meaningChinese ?? "",
        },
      ]),
      turns: stepInTurns,
      stageSummaries: {
        notice: noticePacks.map((pack) => ({
          title: pack?.coreExpression ?? "",
          body: pack?.meaningChinese ?? "",
        })),
        interpret: interpretPacks.map((pack) => ({
          title: pack?.coreExpression ?? "",
          body: pack?.meaningChinese ?? "",
        })),
        interact: interactTaskPacks.flatMap((taskPack) => [
          {
            title: taskPack?.need?.coreExpression ?? "",
            body: taskPack?.need?.meaningChinese ?? "",
          },
          {
            title: taskPack?.handle?.coreExpression ?? "",
            body: taskPack?.handle?.meaningChinese ?? "",
          },
        ]),
        stepIn: stepInTurns.map((turn) => ({
          speaker: turn?.speaker ?? "system",
          label: turn?.speaker === "system" ? "System" : "You",
          text: turn?.text ?? "",
        })),
      },
    },
  };
}
