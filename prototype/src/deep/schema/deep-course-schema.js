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
                chunks: ["A coffee mug"],
                distractors: ["A notebook"],
                answer: ["A coffee mug"],
              },
            },
            variations: [
              createExpressionExample({
                english: "A coffee mug sits beside the laptop.",
                chinese: "杯子放在笔记本电脑旁边。",
                understand: createReorderExercise({
                  chunks: ["这个杯子", "放在", "笔记本电脑旁边"],
                  distractors: ["在桌上"],
                  highlight: "a coffee mug",
                  answer: ["这个杯子", "放在", "笔记本电脑旁边"],
                }),
                focus: {
                  sentenceWithBlanks: "____ sits beside the laptop.",
                  choices: ["a coffee mug"],
                  distractors: ["the desk", "a notebook"],
                  answer: ["a coffee mug"],
                },
                build: {
                  promptChinese: "把以下词组排列成正确的句子",
                  chunks: ["A coffee mug", "sits beside", "the laptop"],
                  distractors: ["on the shelf"],
                  answer: ["A coffee mug", "sits beside", "the laptop"],
                },
                quickResponse: {
                  question: "What sits beside the laptop?",
                  chunks: ["A coffee mug"],
                  distractors: ["A notebook"],
                  answer: ["A coffee mug"],
                },
              }),
            ],
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
                chunks: ["A laptop"],
                distractors: ["A plant"],
                answer: ["A laptop"],
              },
            },
            variations: [
              createExpressionExample({
                english: "The laptop is ready for work.",
                chinese: "这台笔记本电脑准备好工作了。",
                understand: createReorderExercise({
                  chunks: ["这台笔记本电脑", "看起来", "已经准备好工作了"],
                  distractors: ["准备去午休"],
                  highlight: "laptop",
                  answer: ["这台笔记本电脑", "看起来", "已经准备好工作了"],
                }),
                focus: {
                  sentenceWithBlanks: "____ is ready for work.",
                  choices: ["a laptop"],
                  distractors: ["a notebook", "a phone"],
                  answer: ["a laptop"],
                },
                build: {
                  promptChinese: "把以下词组排列成正确的句子",
                  chunks: ["The laptop", "is ready for work"],
                  distractors: ["by the window"],
                  answer: ["The laptop", "is ready for work"],
                },
                quickResponse: {
                  question: "What is ready for work?",
                  chunks: ["A laptop"],
                  distractors: ["A plant"],
                  answer: ["A laptop"],
                },
              }),
            ],
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
                chunks: ["这看起来像", "一个安静的工作环境"],
                distractors: ["一个热闹派对"],
                highlight: "quiet work setup",
                answer: ["这看起来像", "一个安静的工作环境"],
              }),
              focus: {
                sentenceWithBlanks: "It looks like a ____ work ____.",
                choices: ["quiet", "setup", "busy"],
                distractors: ["busy"],
                answer: ["quiet", "setup"],
              },
              build: {
                promptChinese: "把以下词组排列成正确的句子",
                chunks: ["It looks like", "a quiet work setup"],
                distractors: ["a busy party"],
                answer: ["It looks like", "a quiet work setup"],
              },
              quickResponse: {
                question: "How does the space feel?",
                chunks: ["It feels calm and focused."],
                distractors: ["It feels loud and crowded."],
                answer: ["It feels calm and focused."],
              },
            },
            variations: [
              createExpressionExample({
                english: "The desk feels like a quiet work setup.",
                chinese: "这张桌子感觉像一个安静的工作环境。",
                understand: createReorderExercise({
                  chunks: ["这张桌子", "感觉像", "一个安静的工作环境"],
                  distractors: ["一趟短途散步"],
                  highlight: "a quiet work setup",
                  answer: ["这张桌子", "感觉像", "一个安静的工作环境"],
                }),
                focus: {
                  sentenceWithBlanks: "The desk feels like a ____ work ____.",
                  choices: ["quiet", "setup", "sleep"],
                  distractors: ["sleep"],
                  answer: ["quiet", "setup"],
                },
                build: {
                  promptChinese: "把以下词组排列成正确的句子",
                  chunks: ["The desk", "feels like", "a quiet work setup"],
                  distractors: ["a short walk"],
                  answer: ["The desk", "feels like", "a quiet work setup"],
                },
                quickResponse: {
                  question: "How does the desk feel?",
                  chunks: ["It feels calm and focused."],
                  distractors: ["It feels loud and crowded."],
                  answer: ["It feels calm and focused."],
                },
              }),
            ],
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
                chunks: ["The laptop", "seems ready for work"],
                distractors: ["needs a nap"],
                answer: ["The laptop", "seems ready for work"],
              },
              quickResponse: {
                question: "What seems ready for work?",
                chunks: ["The laptop"],
                distractors: ["The plant"],
                answer: ["The laptop"],
              },
            },
            variations: [
              createExpressionExample({
                english: "Someone seems ready for work here.",
                chinese: "这里看起来有人已经准备好工作了。",
                understand: createReorderExercise({
                  chunks: ["这里看起来有人", "已经准备好工作了"],
                  distractors: ["出去吃午饭"],
                  highlight: "ready for work",
                  answer: ["这里看起来有人", "已经准备好工作了"],
                }),
                focus: {
                  sentenceWithBlanks: "Someone seems ready for ____ here.",
                  choices: ["work", "sleep", "fun"],
                  distractors: ["sleep"],
                  answer: ["work"],
                },
                build: {
                  promptChinese: "把以下词组排列成正确的句子",
                  chunks: ["Someone seems", "ready for work", "here"],
                  distractors: ["going out for lunch"],
                  answer: ["Someone seems", "ready for work", "here"],
                },
                quickResponse: {
                  question: "Who seems ready for work here?",
                  chunks: ["Someone"],
                  distractors: ["Nobody"],
                  answer: ["Someone"],
                },
              }),
            ],
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
                  chunks: ["Can I take", "a short break"],
                  distractors: ["the keyboard"],
                  answer: ["Can I take", "a short break"],
                },
              },
              variations: [
                createVariation({
              english: "Could I take a short break now?",
              chinese: "我现在可以休息一下吗？",
              understand: createReorderExercise({
                  chunks: ["我现在可以", "休息一下", "吗"],
                  distractors: ["去一趟商店"],
                  highlight: "a short break",
                  answer: ["我现在可以", "休息一下", "吗"],
              }),
                  focus: {
                    sentenceWithBlanks: "Could I take a short break ____?",
                    choices: ["now", "later", "please"],
                    distractors: ["later"],
                    answer: ["now"],
                  },
                  build: {
                    promptChinese: "把以下词组排列成正确的句子",
                    chunks: ["Could I take", "a short break now"],
                    distractors: ["for a meal"],
                    answer: ["Could I take", "a short break now"],
                  },
                }),
              ],
            },
            handle: {
              coreExpression: "go ahead",
              meaningChinese: "当然，可以。",
              baseExample: {
              english: "Sure, go ahead.",
              chinese: "当然，可以。",
              understand: createReorderExercise({
                  chunks: ["当然", "可以"],
                  distractors: ["等等"],
                  highlight: "go ahead",
                  answer: ["当然", "可以"],
              }),
                focus: {
                  sentenceWithBlanks: "Sure, ____ ____.",
                  choices: ["go", "ahead", "back"],
                  distractors: ["back"],
                  answer: ["go", "ahead"],
                },
                build: {
                  promptChinese: "把以下词组排列成正确的句子",
                  chunks: ["Sure", "go ahead"],
                  distractors: ["wait here"],
                  answer: ["Sure", "go ahead"],
                },
              },
              variations: [
                createVariation({
              english: "Of course, go ahead.",
              chinese: "当然，可以。",
              understand: createReorderExercise({
                  chunks: ["当然", "可以"],
                  distractors: ["现在就赶快"],
                  highlight: "go ahead",
                  answer: ["当然", "可以"],
              }),
                  focus: {
                    sentenceWithBlanks: "Of course, ____ ____.",
                    choices: ["go", "ahead", "back"],
                    distractors: ["back"],
                    answer: ["go", "ahead"],
                  },
                  build: {
                    promptChinese: "把以下词组排列成正确的句子",
                    chunks: ["Of course", "go ahead"],
                    distractors: ["rush now"],
                    answer: ["Of course", "go ahead"],
                  },
                }),
              ],
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
                  chunks: ["Do you want", "some coffee"],
                  distractors: ["a notebook"],
                  answer: ["Do you want", "some coffee"],
                },
              },
              variations: [
                createVariation({
              english: "Would you like some coffee?",
              chinese: "你想喝点咖啡吗？",
              understand: createReorderExercise({
                    chunks: ["你想", "喝点咖啡", "吗"],
                    distractors: ["来一杯茶"],
                    highlight: "some coffee",
                    answer: ["你想", "喝点咖啡", "吗"],
              }),
                  focus: {
                    sentenceWithBlanks: "Would you like some ____?",
                    choices: ["coffee", "tea", "water"],
                    distractors: ["water"],
                    answer: ["coffee"],
                  },
                  build: {
                    promptChinese: "把以下词组排列成正确的句子",
                    chunks: ["Would you like", "some coffee"],
                    distractors: ["a cup of tea"],
                    answer: ["Would you like", "some coffee"],
                  },
                }),
              ],
            },
            handle: {
              coreExpression: "please",
              meaningChinese: "好的，请。",
              baseExample: {
              english: "Yes, please.",
              chinese: "好的，请。",
              understand: createReorderExercise({
                    chunks: ["好的", "请"],
                    distractors: ["不用了"],
                    highlight: "please",
                    answer: ["好的", "请"],
              }),
                focus: {
                  sentenceWithBlanks: "Yes, ____.",
                  choices: ["please", "no", "thanks"],
                  distractors: ["thanks"],
                  answer: ["please"],
                },
                build: {
                  promptChinese: "把以下词组排列成正确的句子",
                  chunks: ["Yes", "please"],
                  distractors: ["no thanks"],
                  answer: ["Yes", "please"],
                },
              },
              variations: [
                createVariation({
              english: "Sure, please.",
              chinese: "好的，请。",
              understand: createReorderExercise({
                    chunks: ["好的", "请"],
                    distractors: ["今天不行"],
                    highlight: "please",
                    answer: ["好的", "请"],
              }),
                  focus: {
                    sentenceWithBlanks: "Sure, ____.",
                    choices: ["please", "no", "thanks"],
                    distractors: ["thanks"],
                    answer: ["please"],
                  },
                  build: {
                    promptChinese: "把以下词组排列成正确的句子",
                    chunks: ["Sure", "please"],
                    distractors: ["not today"],
                    answer: ["Sure", "please"],
                  },
                }),
              ],
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
        goal: "Complete one full scene conversation.",
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
