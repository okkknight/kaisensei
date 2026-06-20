const deepCourseDefaultFixedCopy = {
  startPromptChinese: "点击开始这次学习之旅",
};

function createReorderExercise({ chunks, answer, distractors = [] }) {
  return {
    chunks,
    distractors,
    answer,
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

function createQuickResponse({ question, chunks, answer, distractors = [] }) {
  return {
    question,
    chunks,
    distractors,
    answer,
  };
}

function createExpressionPack({
  id,
  coreExpression,
  meaningChinese,
  baseExample,
  variations,
  quickResponses,
}) {
  return {
    id,
    coreExpression,
    meaningChinese,
    baseExample,
    variations,
    quickResponses,
  };
}

function createTaskPack({
  id,
  taskTitle,
  scenePrompt,
  need,
  handle,
  dialogues,
}) {
  return {
    id,
    taskTitle,
    scenePrompt,
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
                chunks: ["A coffee mug", "is next to", "the laptop"],
                distractors: ["on the shelf"],
                answer: ["A coffee mug", "is next to", "the laptop"],
              }),
              focus: {
                sentenceWithBlanks: "A coffee mug is ____ ____ the laptop.",
                choices: ["next", "to", "under"],
                distractors: ["under"],
                answer: ["next", "to"],
              },
              build: {
                promptChinese: "把这个句子拼出来。",
                chunks: ["A coffee mug", "is next to", "the laptop"],
                distractors: ["on the shelf"],
                answer: ["A coffee mug", "is next to", "the laptop"],
              },
            },
            variations: [
              createVariation({
                english: "The mug sits beside the laptop.",
                chinese: "杯子放在笔记本电脑旁边。",
                understand: createReorderExercise({
                  chunks: ["The mug", "sits beside", "the laptop"],
                  distractors: ["on the shelf"],
                  answer: ["The mug", "sits beside", "the laptop"],
                }),
                focus: {
                  sentenceWithBlanks: "The mug sits ____ ____ the laptop.",
                  choices: ["beside", "the", "under"],
                  distractors: ["under"],
                  answer: ["beside", "the"],
                },
                build: {
                  promptChinese: "把这个句子拼出来。",
                  chunks: ["The mug", "sits beside", "the laptop"],
                  distractors: ["on the shelf"],
                  answer: ["The mug", "sits beside", "the laptop"],
                },
              }),
            ],
            quickResponses: [
              createQuickResponse({
                question: "What is next to the laptop?",
                chunks: ["A coffee mug"],
                distractors: ["A notebook"],
                answer: ["A coffee mug"],
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
                chunks: ["A laptop", "is open", "on the desk"],
                distractors: ["by the window"],
                answer: ["A laptop", "is open", "on the desk"],
              }),
              focus: {
                sentenceWithBlanks: "A laptop is ____ on the ____.",
                choices: ["open", "desk", "table"],
                distractors: ["table"],
                answer: ["open", "desk"],
              },
              build: {
                promptChinese: "把这个句子拼出来。",
                chunks: ["A laptop", "is open", "on the desk"],
                distractors: ["by the window"],
                answer: ["A laptop", "is open", "on the desk"],
              },
            },
            variations: [
              createVariation({
                english: "The laptop is ready for work.",
                chinese: "这台笔记本电脑准备好工作了。",
                understand: createReorderExercise({
                  chunks: ["The laptop", "is ready for work"],
                  distractors: ["by the window"],
                  answer: ["The laptop", "is ready for work"],
                }),
                focus: {
                  sentenceWithBlanks: "The laptop is ____ for ____.",
                  choices: ["ready", "work", "sleep"],
                  distractors: ["sleep"],
                  answer: ["ready", "work"],
                },
                build: {
                  promptChinese: "把这个句子拼出来。",
                  chunks: ["The laptop", "is ready for work"],
                  distractors: ["by the window"],
                  answer: ["The laptop", "is ready for work"],
                },
              }),
            ],
            quickResponses: [
              createQuickResponse({
                question: "What is open on the desk?",
                chunks: ["A laptop"],
                distractors: ["A plant"],
                answer: ["A laptop"],
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
                chunks: ["It looks like", "a quiet work setup"],
                distractors: ["a busy party"],
                answer: ["It looks like", "a quiet work setup"],
              }),
              focus: {
                sentenceWithBlanks: "It looks like a ____ work ____.",
                choices: ["quiet", "setup", "busy"],
                distractors: ["busy"],
                answer: ["quiet", "setup"],
              },
              build: {
                promptChinese: "把这个句子拼出来。",
                chunks: ["It looks like", "a quiet work setup"],
                distractors: ["a busy party"],
                answer: ["It looks like", "a quiet work setup"],
              },
            },
            variations: [
              createVariation({
                english: "The desk seems ready for a long afternoon of work.",
                chinese: "这张桌子看起来已经准备好迎接一个长长的工作下午。",
                understand: createReorderExercise({
                  chunks: ["The desk", "seems ready for", "a long afternoon of work"],
                  distractors: ["a short walk"],
                  answer: ["The desk", "seems ready for", "a long afternoon of work"],
                }),
                focus: {
                  sentenceWithBlanks: "The desk seems ready for a ____ afternoon of ____.",
                  choices: ["long", "work", "sleep"],
                  distractors: ["sleep"],
                  answer: ["long", "work"],
                },
                build: {
                  promptChinese: "把这个句子拼出来。",
                  chunks: ["The desk", "seems ready for", "a long afternoon of work"],
                  distractors: ["a short walk"],
                  answer: ["The desk", "seems ready for", "a long afternoon of work"],
                },
              }),
            ],
            quickResponses: [
              createQuickResponse({
                question: "How does the space feel?",
                chunks: ["It feels calm and focused."],
                distractors: ["It feels loud and crowded."],
                answer: ["It feels calm and focused."],
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
                chunks: ["The laptop", "seems ready for work"],
                distractors: ["needs a nap"],
                answer: ["The laptop", "seems ready for work"],
              }),
              focus: {
                sentenceWithBlanks: "The laptop seems ready for ____.",
                choices: ["work", "sleep", "fun"],
                distractors: ["sleep"],
                answer: ["work"],
              },
              build: {
                promptChinese: "把这个句子拼出来。",
                chunks: ["The laptop", "seems ready for work"],
                distractors: ["needs a nap"],
                answer: ["The laptop", "seems ready for work"],
              },
            },
            variations: [
              createVariation({
                english: "Someone might be settling in to work here.",
                chinese: "这里可能有人正准备开始工作。",
                understand: createReorderExercise({
                  chunks: ["Someone might be", "settling in to work", "here"],
                  distractors: ["going out for lunch"],
                  answer: ["Someone might be", "settling in to work", "here"],
                }),
                focus: {
                  sentenceWithBlanks: "Someone might be ____ in to ____ here.",
                  choices: ["settling", "work", "sleep"],
                  distractors: ["sleep"],
                  answer: ["settling", "work"],
                },
                build: {
                  promptChinese: "把这个句子拼出来。",
                  chunks: ["Someone might be", "settling in to work", "here"],
                  distractors: ["going out for lunch"],
                  answer: ["Someone might be", "settling in to work", "here"],
                },
              }),
            ],
            quickResponses: [
              createQuickResponse({
                question: "What might someone be doing here?",
                chunks: ["Getting ready to work."],
                distractors: ["Starting a party."],
                answer: ["Getting ready to work."],
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
            need: {
              coreExpression: "Can I take a short break?",
              meaningChinese: "我可以休息一下吗？",
              baseExample: {
                english: "Can I take a short break?",
                chinese: "我可以休息一下吗？",
                understand: createReorderExercise({
                  chunks: ["Can I take", "a short break"],
                  distractors: ["the keyboard"],
                  answer: ["Can I take", "a short break"],
                }),
                focus: {
                  sentenceWithBlanks: "Can I take a ____ ____?",
                  choices: ["short", "break", "quiet"],
                  distractors: ["quiet"],
                  answer: ["short", "break"],
                },
                build: {
                  promptChinese: "把这个请求拼出来。",
                  chunks: ["Can I take", "a short break"],
                  distractors: ["the keyboard"],
                  answer: ["Can I take", "a short break"],
                },
              },
              variations: [
                createVariation({
                  english: "Could I step away for a minute?",
                  chinese: "我可以离开一分钟吗？",
                  understand: createReorderExercise({
                    chunks: ["Could I step away", "for a minute"],
                    distractors: ["for a meal"],
                    answer: ["Could I step away", "for a minute"],
                  }),
                  focus: {
                    sentenceWithBlanks: "Could I step away for a ____?",
                    choices: ["minute", "day", "week"],
                    distractors: ["week"],
                    answer: ["minute"],
                  },
                  build: {
                    promptChinese: "把这个请求拼出来。",
                    chunks: ["Could I step away", "for a minute"],
                    distractors: ["for a meal"],
                    answer: ["Could I step away", "for a minute"],
                  },
                }),
              ],
            },
            handle: {
              coreExpression: "Sure, go ahead.",
              meaningChinese: "当然，可以。",
              baseExample: {
                english: "Sure, go ahead.",
                chinese: "当然，可以。",
                understand: createReorderExercise({
                  chunks: ["Sure", "go ahead"],
                  distractors: ["wait here"],
                  answer: ["Sure", "go ahead"],
                }),
                focus: {
                  sentenceWithBlanks: "Sure, ____ ____.",
                  choices: ["go", "ahead", "back"],
                  distractors: ["back"],
                  answer: ["go", "ahead"],
                },
                build: {
                  promptChinese: "把这个回应拼出来。",
                  chunks: ["Sure", "go ahead"],
                  distractors: ["wait here"],
                  answer: ["Sure", "go ahead"],
                },
              },
              variations: [
                createVariation({
                  english: "Of course, take your time.",
                  chinese: "当然，慢慢来。",
                  understand: createReorderExercise({
                    chunks: ["Of course", "take your time"],
                    distractors: ["rush now"],
                    answer: ["Of course", "take your time"],
                  }),
                  focus: {
                    sentenceWithBlanks: "Of course, take your ____.",
                    choices: ["time", "book", "seat"],
                    distractors: ["seat"],
                    answer: ["time"],
                  },
                  build: {
                    promptChinese: "把这个回应拼出来。",
                    chunks: ["Of course", "take your time"],
                    distractors: ["rush now"],
                    answer: ["Of course", "take your time"],
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
                systemReply: "Sure, go ahead.",
                handle: {
                  chunks: ["Thanks", "I'll be right back"],
                  distractors: ["I will work forever"],
                  answer: ["Thanks", "I'll be right back"],
                },
              },
            ],
          }),
          createTaskPack({
            id: "interact-2",
            taskTitle: "Ask about coffee",
            scenePrompt: "You are talking with someone near the desk.",
            need: {
              coreExpression: "Do you want some coffee?",
              meaningChinese: "你想喝点咖啡吗？",
              baseExample: {
                english: "Do you want some coffee?",
                chinese: "你想喝点咖啡吗？",
                understand: createReorderExercise({
                  chunks: ["Do you want", "some coffee"],
                  distractors: ["a notebook"],
                  answer: ["Do you want", "some coffee"],
                }),
                focus: {
                  sentenceWithBlanks: "Do you want some ____?",
                  choices: ["coffee", "paper", "music"],
                  distractors: ["music"],
                  answer: ["coffee"],
                },
                build: {
                  promptChinese: "把这个问句拼出来。",
                  chunks: ["Do you want", "some coffee"],
                  distractors: ["a notebook"],
                  answer: ["Do you want", "some coffee"],
                },
              },
              variations: [
                createVariation({
                  english: "Would you like a cup of coffee?",
                  chinese: "你想来一杯咖啡吗？",
                  understand: createReorderExercise({
                    chunks: ["Would you like", "a cup of coffee"],
                    distractors: ["a cup of tea"],
                    answer: ["Would you like", "a cup of coffee"],
                  }),
                  focus: {
                    sentenceWithBlanks: "Would you like a cup of ____?",
                    choices: ["coffee", "tea", "water"],
                    distractors: ["water"],
                    answer: ["coffee"],
                  },
                  build: {
                    promptChinese: "把这个问句拼出来。",
                    chunks: ["Would you like", "a cup of coffee"],
                    distractors: ["a cup of tea"],
                    answer: ["Would you like", "a cup of coffee"],
                  },
                }),
              ],
            },
            handle: {
              coreExpression: "Yes, please.",
              meaningChinese: "好的，请。",
              baseExample: {
                english: "Yes, please.",
                chinese: "好的，请。",
                understand: createReorderExercise({
                  chunks: ["Yes", "please"],
                  distractors: ["no thanks"],
                  answer: ["Yes", "please"],
                }),
                focus: {
                  sentenceWithBlanks: "Yes, ____.",
                  choices: ["please", "no", "thanks"],
                  distractors: ["thanks"],
                  answer: ["please"],
                },
                build: {
                  promptChinese: "把这个回应拼出来。",
                  chunks: ["Yes", "please"],
                  distractors: ["no thanks"],
                  answer: ["Yes", "please"],
                },
              },
              variations: [
                createVariation({
                  english: "Sure, that sounds great.",
                  chinese: "当然，听起来不错。",
                  understand: createReorderExercise({
                    chunks: ["Sure", "that sounds great"],
                    distractors: ["not today"],
                    answer: ["Sure", "that sounds great"],
                  }),
                  focus: {
                    sentenceWithBlanks: "Sure, that sounds ____.",
                    choices: ["great", "tiny", "slow"],
                    distractors: ["slow"],
                    answer: ["great"],
                  },
                  build: {
                    promptChinese: "把这个回应拼出来。",
                    chunks: ["Sure", "that sounds great"],
                    distractors: ["not today"],
                    answer: ["Sure", "that sounds great"],
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
                systemReply: "Yes, please.",
                handle: {
                  chunks: ["Let's", "take a quick break"],
                  distractors: ["stay busy forever"],
                  answer: ["Let's", "take a quick break"],
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
          scene: "The desk is set for a focused afternoon of work.",
          turns: [
            {
              speaker: "system",
              text: "What do you see on the desk?",
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
              text: "How does the space feel?",
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
              text: "How would you ask for a short break?",
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
              text: "How would someone respond?",
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
