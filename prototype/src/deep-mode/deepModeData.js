const chunk = (id, text, chinese = "") => ({ id, text, chinese });

function createExampleSequence({
  moduleId,
  packId,
  packIndex,
  exampleId,
  example,
  exampleIndex,
}) {
  return [
    {
      id: `${moduleId}-${packId}-${exampleId}-understand`,
      moduleId,
      packId,
      packIndex,
      exampleId,
      exampleIndex,
      kind: "exercise",
      phase: "understand",
      stageLabel: "Understand",
      title: "Understand",
      subtitle: "Reorder the Chinese chunks.",
      coreExpression: example.coreExpression,
      meaningChinese: example.meaningChinese,
      promptEnglish: example.english,
      promptChinese: example.chinese,
      exercise: example.understand,
      feedback: {
        success: {
          title: "Nice.",
          body: "You understood the sentence.",
        },
        error: {
          title: "Almost.",
          body: "Try the Chinese chunks again.",
        },
      },
      hint: "Start with the most concrete chunk.",
    },
    {
      id: `${moduleId}-${packId}-${exampleId}-focus`,
      moduleId,
      packId,
      packIndex,
      exampleId,
      exampleIndex,
      kind: "exercise",
      phase: "focus",
      stageLabel: "Focus",
      title: "Focus",
      subtitle: "Fill the core expression.",
      coreExpression: example.coreExpression,
      meaningChinese: example.meaningChinese,
      promptEnglish: example.focus.sentenceWithBlanks,
      promptChinese: example.chinese,
      exercise: example.focus,
      feedback: {
        success: {
          title: "Great.",
          body: "The core expression is in place.",
        },
        error: {
          title: "Not yet.",
          body: "Look at the missing core phrase again.",
        },
      },
      hint: "The first missing word usually starts the core phrase.",
    },
    {
      id: `${moduleId}-${packId}-${exampleId}-build`,
      moduleId,
      packId,
      packIndex,
      exampleId,
      exampleIndex,
      kind: "exercise",
      phase: "build",
      stageLabel: "Build",
      title: "Build",
      subtitle: "Rebuild the English sentence.",
      coreExpression: example.coreExpression,
      meaningChinese: example.meaningChinese,
      promptEnglish: example.english,
      promptChinese: example.build.promptChinese,
      exercise: example.build,
      feedback: {
        success: {
          title: "Nice work.",
          body: "You built the sentence.",
        },
        error: {
          title: "Close.",
          body: "Try the chunk order again.",
        },
      },
      hint: "Keep the fixed phrase together.",
    },
  ];
}

function createQuickResponseSequence({ moduleId, packId, packIndex, response, responseIndex }) {
  return {
    id: `${moduleId}-${packId}-quick-${responseIndex}`,
    moduleId,
    packId,
    packIndex,
    kind: "exercise",
    phase: "quickResponse",
    stageLabel: "Quick Response",
    title: "Quick Response",
    subtitle: "Answer with chunks.",
    coreExpression: response.coreExpression,
    meaningChinese: response.meaningChinese,
    promptEnglish: response.question,
    promptChinese: response.questionChinese,
    exercise: response,
    feedback: {
      success: {
        title: "Good answer.",
        body: "That sounds natural.",
      },
      error: {
        title: "Almost.",
        body: "Try the answer order once more.",
      },
    },
    hint: "The answer usually starts with the most direct reply.",
  };
}

function createInteractSequence({ moduleId, packId, packIndex, pack }) {
  const entries = [
    {
      id: `${moduleId}-${packId}-intro`,
      moduleId,
      packId,
      packIndex,
      kind: "intro",
      stageLabel: "Task Pack Intro",
      title: pack.taskTitle,
      subtitle: pack.scenePrompt,
      taskPack: pack,
    },
  ];

  entries.push(
    ...createExampleSequence({
      moduleId,
      packId,
      packIndex,
      exampleId: "need-base",
      example: pack.need.baseExample,
      exampleIndex: 0,
    }).map((entry) => ({
      ...entry,
      part: "need",
    })),
  );

  pack.need.variations.forEach((variation, variationIndex) => {
    entries.push(
      ...createExampleSequence({
        moduleId,
        packId,
        packIndex,
        exampleId: `need-variation-${variationIndex}`,
        example: variation,
        exampleIndex: variationIndex + 1,
      }).map((entry) => ({
        ...entry,
        part: "need",
      })),
    );
  });

  entries.push(
    ...createExampleSequence({
      moduleId,
      packId,
      packIndex,
      exampleId: "handle-base",
      example: pack.handle.baseExample,
      exampleIndex: 0,
    }).map((entry) => ({
      ...entry,
      part: "handle",
    })),
  );

  pack.handle.variations.forEach((variation, variationIndex) => {
    entries.push(
      ...createExampleSequence({
        moduleId,
        packId,
        packIndex,
        exampleId: `handle-variation-${variationIndex}`,
        example: variation,
        exampleIndex: variationIndex + 1,
      }).map((entry) => ({
        ...entry,
        part: "handle",
      })),
    );
  });

  entries.push({
    id: `${moduleId}-${packId}-dialogue`,
    moduleId,
    packId,
    packIndex,
    kind: "dialogue",
    stageLabel: "Dialogue Practice",
    title: "Dialogue Practice",
    subtitle: pack.scenePrompt,
    taskPack: pack,
    dialogue: pack.dialogues[0],
  });

  return entries;
}

export const deepModeCourse = {
  lessonId: "deep_workspace_cafe_01",
  mode: "deep",
  level: "normal",
  photoSummary: "A desk with a coffee mug, laptop, notebook, and plant.",
  overview: {
    keywords: ["coffee", "table", "laptop"],
    sceneDescriptionChinese: "窗边安静的午后工作时光",
    startPromptChinese: "点击开始这次学习之旅",
  },
  modules: {
    notice: {
      title: "Notice",
      goal: "Describe what is visible in the photo.",
      milestone: {
        title: "Great job!",
        description: "You can now describe what is right in front of you.",
        capability: "You noticed visible objects and positions clearly.",
        cta: "Continue to Interpret",
      },
      expressionPacks: [
        {
          id: "notice_next_to",
          coreExpression: "next to",
          meaningChinese: "在……旁边",
          baseExample: {
            id: "notice_next_to_base",
            english: "A laptop is sitting next to the coffee mug.",
            chinese: "一台笔记本电脑放在咖啡杯旁边。",
            understand: {
              chunks: [
                chunk("notice_next_to_base_u1", "一台笔记本电脑"),
                chunk("notice_next_to_base_u2", "放在"),
                chunk("notice_next_to_base_u3", "咖啡杯旁边"),
              ],
              distractors: [chunk("notice_next_to_base_u4", "窗外的街道")],
              answerIds: [
                "notice_next_to_base_u1",
                "notice_next_to_base_u2",
                "notice_next_to_base_u3",
              ],
            },
            focus: {
              sentenceWithBlanks: "A laptop is sitting ___ ___ the coffee mug.",
              choices: [
                chunk("notice_next_to_base_f1", "next"),
                chunk("notice_next_to_base_f2", "to"),
                chunk("notice_next_to_base_f3", "under"),
              ],
              distractors: [chunk("notice_next_to_base_f4", "inside")],
              answerIds: ["notice_next_to_base_f1", "notice_next_to_base_f2"],
            },
            build: {
              promptChinese: "一台笔记本电脑放在咖啡杯旁边。",
              chunks: [
                chunk("notice_next_to_base_b1", "A laptop"),
                chunk("notice_next_to_base_b2", "is sitting"),
                chunk("notice_next_to_base_b3", "next to"),
                chunk("notice_next_to_base_b4", "the coffee mug"),
              ],
              distractors: [chunk("notice_next_to_base_bd1", "by the window")],
              answerIds: [
                "notice_next_to_base_b1",
                "notice_next_to_base_b2",
                "notice_next_to_base_b3",
                "notice_next_to_base_b4",
              ],
            },
            quickResponse: {
              question: "Where is the laptop?",
              questionChinese: "笔记本电脑在哪里？",
              chunks: [
                chunk("notice_next_to_base_q1", "It is"),
                chunk("notice_next_to_base_q2", "next to"),
                chunk("notice_next_to_base_q3", "the coffee mug"),
              ],
              distractors: [chunk("notice_next_to_base_q4", "on the road")],
              answerIds: [
                "notice_next_to_base_q1",
                "notice_next_to_base_q2",
                "notice_next_to_base_q3",
              ],
            },
          },
          variations: [
            {
              id: "notice_next_to_var1",
              english: "The notebook is next to a small plate.",
              chinese: "笔记本在一个小盘子旁边。",
              understand: {
                chunks: [
                  chunk("notice_next_to_var1_u1", "笔记本"),
                  chunk("notice_next_to_var1_u2", "在小盘子旁边"),
                ],
                distractors: [chunk("notice_next_to_var1_u3", "在抽屉里")],
                answerIds: ["notice_next_to_var1_u1", "notice_next_to_var1_u2"],
              },
              focus: {
                sentenceWithBlanks: "The notebook is ___ ___ a small plate.",
                choices: [
                  chunk("notice_next_to_var1_f1", "next"),
                  chunk("notice_next_to_var1_f2", "to"),
                  chunk("notice_next_to_var1_f3", "under"),
                ],
                distractors: [chunk("notice_next_to_var1_f4", "behind")],
                answerIds: ["notice_next_to_var1_f1", "notice_next_to_var1_f2"],
              },
              build: {
                promptChinese: "笔记本在一个小盘子旁边。",
                chunks: [
                  chunk("notice_next_to_var1_b1", "The notebook"),
                  chunk("notice_next_to_var1_b2", "is next to"),
                  chunk("notice_next_to_var1_b3", "a small plate"),
                ],
                distractors: [chunk("notice_next_to_var1_bd1", "under the lamp")],
                answerIds: [
                  "notice_next_to_var1_b1",
                  "notice_next_to_var1_b2",
                  "notice_next_to_var1_b3",
                ],
              },
            },
          ],
          quickResponses: [
            {
              id: "notice_next_to_quick_1",
              coreExpression: "next to",
              meaningChinese: "在……旁边",
              question: "Where is the laptop?",
              questionChinese: "笔记本电脑在哪里？",
              chunks: [
                chunk("notice_next_to_quick_1_q1", "It is"),
                chunk("notice_next_to_quick_1_q2", "next to"),
                chunk("notice_next_to_quick_1_q3", "the coffee mug"),
              ],
              distractors: [chunk("notice_next_to_quick_1_q4", "in the drawer")],
              answerIds: [
                "notice_next_to_quick_1_q1",
                "notice_next_to_quick_1_q2",
                "notice_next_to_quick_1_q3",
              ],
            },
          ],
        },
        {
          id: "notice_by_window",
          coreExpression: "by the window",
          meaningChinese: "在窗边",
          baseExample: {
            id: "notice_by_window_base",
            english: "The coffee mug is by the window.",
            chinese: "咖啡杯放在窗边。",
            understand: {
              chunks: [
                chunk("notice_by_window_base_u1", "咖啡杯"),
                chunk("notice_by_window_base_u2", "放在"),
                chunk("notice_by_window_base_u3", "窗边"),
              ],
              distractors: [chunk("notice_by_window_base_u4", "在门口")],
              answerIds: [
                "notice_by_window_base_u1",
                "notice_by_window_base_u2",
                "notice_by_window_base_u3",
              ],
            },
            focus: {
              sentenceWithBlanks: "The coffee mug is ___ ___ window.",
              choices: [
                chunk("notice_by_window_base_f1", "by"),
                chunk("notice_by_window_base_f2", "the"),
                chunk("notice_by_window_base_f3", "behind"),
              ],
              distractors: [chunk("notice_by_window_base_f4", "under")],
              answerIds: ["notice_by_window_base_f1", "notice_by_window_base_f2"],
            },
            build: {
              promptChinese: "咖啡杯放在窗边。",
              chunks: [
                chunk("notice_by_window_base_b1", "The coffee mug"),
                chunk("notice_by_window_base_b2", "is by the window"),
              ],
              distractors: [chunk("notice_by_window_base_bd1", "near the keyboard")],
              answerIds: ["notice_by_window_base_b1", "notice_by_window_base_b2"],
            },
            quickResponse: {
              question: "Where is the coffee mug?",
              questionChinese: "咖啡杯在哪里？",
              chunks: [
                chunk("notice_by_window_base_q1", "It is"),
                chunk("notice_by_window_base_q2", "by the window"),
              ],
              distractors: [chunk("notice_by_window_base_q3", "under the chair")],
              answerIds: ["notice_by_window_base_q1", "notice_by_window_base_q2"],
            },
          },
          variations: [
            {
              id: "notice_by_window_var1",
              english: "The plant sits by the window too.",
              chinese: "植物也放在窗边。",
              understand: {
                chunks: [
                  chunk("notice_by_window_var1_u1", "植物"),
                  chunk("notice_by_window_var1_u2", "也在窗边"),
                ],
                distractors: [chunk("notice_by_window_var1_u3", "在书包里")],
                answerIds: ["notice_by_window_var1_u1", "notice_by_window_var1_u2"],
              },
              focus: {
                sentenceWithBlanks: "The plant sits ___ ___ window too.",
                choices: [
                  chunk("notice_by_window_var1_f1", "by"),
                  chunk("notice_by_window_var1_f2", "the"),
                  chunk("notice_by_window_var1_f3", "in"),
                ],
                distractors: [chunk("notice_by_window_var1_f4", "behind")],
                answerIds: ["notice_by_window_var1_f1", "notice_by_window_var1_f2"],
              },
              build: {
                promptChinese: "植物也放在窗边。",
                chunks: [
                  chunk("notice_by_window_var1_b1", "The plant"),
                  chunk("notice_by_window_var1_b2", "sits by the window"),
                  chunk("notice_by_window_var1_b3", "too"),
                ],
                distractors: [chunk("notice_by_window_var1_bd1", "under the desk")],
                answerIds: [
                  "notice_by_window_var1_b1",
                  "notice_by_window_var1_b2",
                  "notice_by_window_var1_b3",
                ],
              },
            },
          ],
          quickResponses: [
            {
              id: "notice_by_window_quick_1",
              coreExpression: "by the window",
              meaningChinese: "在窗边",
              question: "Where is the coffee mug?",
              questionChinese: "咖啡杯在哪里？",
              chunks: [
                chunk("notice_by_window_quick_1_q1", "It is"),
                chunk("notice_by_window_quick_1_q2", "by the window"),
              ],
              distractors: [chunk("notice_by_window_quick_1_q3", "under the chair")],
              answerIds: ["notice_by_window_quick_1_q1", "notice_by_window_quick_1_q2"],
            },
          ],
        },
      ],
    },
    interpret: {
      title: "Interpret",
      goal: "Infer what may be happening in the scene.",
      milestone: {
        title: "Nice thinking.",
        description: "You can now make careful guesses from what you see.",
        capability: "You used photo clues to make a cautious inference.",
        cta: "Continue to Interact",
      },
      expressionPacks: [
        {
          id: "interpret_looks_like",
          coreExpression: "looks like",
          meaningChinese: "看起来好像",
          baseExample: {
            id: "interpret_looks_like_base",
            english: "It looks like someone is working on a report.",
            chinese: "看起来有人正在写报告。",
            understand: {
              chunks: [
                chunk("interpret_looks_like_base_u1", "看起来"),
                chunk("interpret_looks_like_base_u2", "有人正在写报告"),
                chunk("interpret_looks_like_base_u3", "而且很专注"),
              ],
              distractors: [chunk("interpret_looks_like_base_u4", "正在跑步")],
              answerIds: [
                "interpret_looks_like_base_u1",
                "interpret_looks_like_base_u2",
                "interpret_looks_like_base_u3",
              ],
            },
            focus: {
              sentenceWithBlanks: "It ___ ___ like someone is working on a report.",
              choices: [
                chunk("interpret_looks_like_base_f1", "looks"),
                chunk("interpret_looks_like_base_f2", "like"),
                chunk("interpret_looks_like_base_f3", "seems"),
              ],
              distractors: [chunk("interpret_looks_like_base_f4", "feels")],
              answerIds: ["interpret_looks_like_base_f1", "interpret_looks_like_base_f2"],
            },
            build: {
              promptChinese: "看起来有人正在写报告。",
              chunks: [
                chunk("interpret_looks_like_base_b1", "It looks like"),
                chunk("interpret_looks_like_base_b2", "someone is working on a report"),
              ],
              distractors: [chunk("interpret_looks_like_base_bd1", "while the room is empty")],
              answerIds: ["interpret_looks_like_base_b1", "interpret_looks_like_base_b2"],
            },
            quickResponse: {
              question: "What do you think is happening here?",
              questionChinese: "你觉得这里正在发生什么？",
              chunks: [
                chunk("interpret_looks_like_base_q1", "It looks like"),
                chunk("interpret_looks_like_base_q2", "someone is working on a report"),
              ],
              distractors: [chunk("interpret_looks_like_base_q3", "someone is taking photos")],
              answerIds: ["interpret_looks_like_base_q1", "interpret_looks_like_base_q2"],
            },
          },
          variations: [
            {
              id: "interpret_looks_like_var1",
              english: "It looks like the room is set up for focused work.",
              chinese: "看起来这个房间是为专注工作准备的。",
              understand: {
                chunks: [
                  chunk("interpret_looks_like_var1_u1", "看起来"),
                  chunk("interpret_looks_like_var1_u2", "这个房间是为专注工作准备的"),
                ],
                distractors: [chunk("interpret_looks_like_var1_u3", "是为了开派对")],
                answerIds: ["interpret_looks_like_var1_u1", "interpret_looks_like_var1_u2"],
              },
              focus: {
                sentenceWithBlanks: "It looks like the room is set up for ___ work.",
                choices: [
                  chunk("interpret_looks_like_var1_f1", "focused"),
                  chunk("interpret_looks_like_var1_f2", "busy"),
                  chunk("interpret_looks_like_var1_f3", "noisy"),
                ],
                distractors: [chunk("interpret_looks_like_var1_f4", "sleepy")],
                answerIds: ["interpret_looks_like_var1_f1"],
              },
              build: {
                promptChinese: "看起来这个房间是为专注工作准备的。",
                chunks: [
                  chunk("interpret_looks_like_var1_b1", "It looks like"),
                  chunk("interpret_looks_like_var1_b2", "the room is set up"),
                  chunk("interpret_looks_like_var1_b3", "for focused work"),
                ],
                distractors: [chunk("interpret_looks_like_var1_bd1", "for a loud party")],
                answerIds: [
                  "interpret_looks_like_var1_b1",
                  "interpret_looks_like_var1_b2",
                  "interpret_looks_like_var1_b3",
                ],
              },
            },
          ],
          quickResponses: [
            {
              id: "interpret_looks_like_quick_1",
              coreExpression: "looks like",
              meaningChinese: "看起来好像",
              question: "What do you think is happening here?",
              questionChinese: "你觉得这里正在发生什么？",
              chunks: [
                chunk("interpret_looks_like_quick_1_q1", "It looks like"),
                chunk("interpret_looks_like_quick_1_q2", "someone is working on a report"),
              ],
              distractors: [chunk("interpret_looks_like_quick_1_q3", "someone is taking photos")],
              answerIds: ["interpret_looks_like_quick_1_q1", "interpret_looks_like_quick_1_q2"],
            },
          ],
        },
        {
          id: "interpret_quiet_place",
          coreExpression: "a quiet place",
          meaningChinese: "一个安静的地方",
          baseExample: {
            id: "interpret_quiet_place_base",
            english: "It seems like this is a quiet place to work.",
            chinese: "看起来这是个适合工作的安静地方。",
            understand: {
              chunks: [
                chunk("interpret_quiet_place_base_u1", "看起来"),
                chunk("interpret_quiet_place_base_u2", "这是个安静的工作地方"),
                chunk("interpret_quiet_place_base_u3", "很适合专注"),
              ],
              distractors: [chunk("interpret_quiet_place_base_u4", "很热闹")],
              answerIds: [
                "interpret_quiet_place_base_u1",
                "interpret_quiet_place_base_u2",
                "interpret_quiet_place_base_u3",
              ],
            },
            focus: {
              sentenceWithBlanks: "It seems like this is ___ ___ to work.",
              choices: [
                chunk("interpret_quiet_place_base_f1", "a"),
                chunk("interpret_quiet_place_base_f2", "quiet"),
                chunk("interpret_quiet_place_base_f3", "loud"),
              ],
              distractors: [chunk("interpret_quiet_place_base_f4", "crowded")],
              answerIds: ["interpret_quiet_place_base_f1", "interpret_quiet_place_base_f2"],
            },
            build: {
              promptChinese: "看起来这是个适合工作的安静地方。",
              chunks: [
                chunk("interpret_quiet_place_base_b1", "It seems like"),
                chunk("interpret_quiet_place_base_b2", "this is a quiet place"),
                chunk("interpret_quiet_place_base_b3", "to work"),
              ],
              distractors: [chunk("interpret_quiet_place_base_bd1", "for a dance show")],
              answerIds: [
                "interpret_quiet_place_base_b1",
                "interpret_quiet_place_base_b2",
                "interpret_quiet_place_base_b3",
              ],
            },
            quickResponse: {
              question: "How would you describe this place?",
              questionChinese: "你会怎么形容这个地方？",
              chunks: [
                chunk("interpret_quiet_place_base_q1", "It seems like"),
                chunk("interpret_quiet_place_base_q2", "this is a quiet place to work"),
              ],
              distractors: [chunk("interpret_quiet_place_base_q3", "this is a busy gym")],
              answerIds: ["interpret_quiet_place_base_q1", "interpret_quiet_place_base_q2"],
            },
          },
          variations: [
            {
              id: "interpret_quiet_place_var1",
              english: "It feels like a calm spot for an afternoon focus session.",
              chinese: "这里像是一个适合下午专注的安静角落。",
              understand: {
                chunks: [
                  chunk("interpret_quiet_place_var1_u1", "这里像是"),
                  chunk("interpret_quiet_place_var1_u2", "一个适合下午专注的安静角落"),
                ],
                distractors: [chunk("interpret_quiet_place_var1_u3", "一个嘈杂的会场")],
                answerIds: ["interpret_quiet_place_var1_u1", "interpret_quiet_place_var1_u2"],
              },
              focus: {
                sentenceWithBlanks: "It feels like a calm spot for an ___ focus session.",
                choices: [
                  chunk("interpret_quiet_place_var1_f1", "afternoon"),
                  chunk("interpret_quiet_place_var1_f2", "evening"),
                  chunk("interpret_quiet_place_var1_f3", "urgent"),
                ],
                distractors: [chunk("interpret_quiet_place_var1_f4", "noisy")],
                answerIds: ["interpret_quiet_place_var1_f1"],
              },
              build: {
                promptChinese: "这里像是一个适合下午专注的安静角落。",
                chunks: [
                  chunk("interpret_quiet_place_var1_b1", "It feels like"),
                  chunk("interpret_quiet_place_var1_b2", "a calm spot"),
                  chunk("interpret_quiet_place_var1_b3", "for an afternoon focus session"),
                ],
                distractors: [chunk("interpret_quiet_place_var1_bd1", "for a loud celebration")],
                answerIds: [
                  "interpret_quiet_place_var1_b1",
                  "interpret_quiet_place_var1_b2",
                  "interpret_quiet_place_var1_b3",
                ],
              },
            },
          ],
          quickResponses: [
            {
              id: "interpret_quiet_place_quick_1",
              coreExpression: "a quiet place",
              meaningChinese: "一个安静的地方",
              question: "How would you describe this place?",
              questionChinese: "你会怎么形容这个地方？",
              chunks: [
                chunk("interpret_quiet_place_quick_1_q1", "It seems like"),
                chunk("interpret_quiet_place_quick_1_q2", "this is a quiet place to work"),
              ],
              distractors: [chunk("interpret_quiet_place_quick_1_q3", "this is a busy gym")],
              answerIds: ["interpret_quiet_place_quick_1_q1", "interpret_quiet_place_quick_1_q2"],
            },
          ],
        },
      ],
    },
    interact: {
      title: "Interact",
      goal: "Express a need and respond naturally.",
      milestone: {
        title: "Great conversation.",
        description: "You can ask for help and answer naturally in the scene.",
        capability: "You practiced a real request and a natural reply.",
        cta: "Continue to Step In",
      },
      taskPacks: [
        {
          id: "task_outlet",
          taskTitle: "Ask to use a power outlet",
          scenePrompt: "You need to charge your laptop.",
          need: {
            coreExpression: "Could I use this outlet?",
            meaningChinese: "我可以用这个插座吗？",
            baseExample: {
              id: "task_outlet_need_base",
              english: "Could I use this outlet?",
              chinese: "我可以用这个插座吗？",
              understand: {
                chunks: [
                  chunk("task_outlet_need_base_u1", "我可以"),
                  chunk("task_outlet_need_base_u2", "用这个插座"),
                  chunk("task_outlet_need_base_u3", "吗"),
                ],
                distractors: [chunk("task_outlet_need_base_u4", "在这里")],
                answerIds: ["task_outlet_need_base_u1", "task_outlet_need_base_u2", "task_outlet_need_base_u3"],
              },
              focus: {
                sentenceWithBlanks: "Could I ___ ___ outlet?",
                choices: [
                  chunk("task_outlet_need_base_f1", "use"),
                  chunk("task_outlet_need_base_f2", "this"),
                  chunk("task_outlet_need_base_f3", "that"),
                ],
                distractors: [chunk("task_outlet_need_base_f4", "for")],
                answerIds: ["task_outlet_need_base_f1", "task_outlet_need_base_f2"],
              },
              build: {
                promptChinese: "我可以用这个插座吗？",
                chunks: [
                  chunk("task_outlet_need_base_b1", "Could I"),
                  chunk("task_outlet_need_base_b2", "use this outlet"),
                ],
                distractors: [chunk("task_outlet_need_base_bd1", "nearby")],
                answerIds: ["task_outlet_need_base_b1", "task_outlet_need_base_b2"],
              },
            },
            variations: [
              {
                id: "task_outlet_need_var1",
                english: "Could I plug in my laptop here?",
                chinese: "我可以在这里给电脑插电吗？",
                understand: {
                  chunks: [
                    chunk("task_outlet_need_var1_u1", "我可以"),
                    chunk("task_outlet_need_var1_u2", "在这里给电脑插电吗"),
                  ],
                  distractors: [chunk("task_outlet_need_var1_u3", "先去吃午饭")],
                  answerIds: ["task_outlet_need_var1_u1", "task_outlet_need_var1_u2"],
                },
                focus: {
                  sentenceWithBlanks: "Could I ___ in my laptop here?",
                  choices: [
                    chunk("task_outlet_need_var1_f1", "plug"),
                    chunk("task_outlet_need_var1_f2", "sit"),
                    chunk("task_outlet_need_var1_f3", "talk"),
                  ],
                  distractors: [chunk("task_outlet_need_var1_f4", "sleep")],
                  answerIds: ["task_outlet_need_var1_f1"],
                },
                build: {
                  promptChinese: "我可以在这里给电脑插电吗？",
                  chunks: [
                    chunk("task_outlet_need_var1_b1", "Could I"),
                    chunk("task_outlet_need_var1_b2", "plug in my laptop"),
                    chunk("task_outlet_need_var1_b3", "here"),
                  ],
                  distractors: [chunk("task_outlet_need_var1_bd1", "for a minute")],
                  answerIds: [
                    "task_outlet_need_var1_b1",
                    "task_outlet_need_var1_b2",
                    "task_outlet_need_var1_b3",
                  ],
                },
              },
            ],
          },
          handle: {
            coreExpression: "Sure, thanks.",
            meaningChinese: "好的，谢谢。",
            baseExample: {
              id: "task_outlet_handle_base",
              english: "Sure, thanks.",
              chinese: "好的，谢谢。",
              understand: {
                chunks: [
                  chunk("task_outlet_handle_base_u1", "好的"),
                  chunk("task_outlet_handle_base_u2", "谢谢"),
                ],
                distractors: [chunk("task_outlet_handle_base_u3", "没问题")],
                answerIds: ["task_outlet_handle_base_u1", "task_outlet_handle_base_u2"],
              },
              focus: {
                sentenceWithBlanks: "___, ____.",
                choices: [
                  chunk("task_outlet_handle_base_f1", "Sure"),
                  chunk("task_outlet_handle_base_f2", "thanks"),
                  chunk("task_outlet_handle_base_f3", "please"),
                ],
                distractors: [chunk("task_outlet_handle_base_f4", "hello")],
                answerIds: ["task_outlet_handle_base_f1", "task_outlet_handle_base_f2"],
              },
              build: {
                promptChinese: "好的，谢谢。",
                chunks: [chunk("task_outlet_handle_base_b1", "Sure"), chunk("task_outlet_handle_base_b2", "thanks")],
                distractors: [chunk("task_outlet_handle_base_bd1", "maybe later")],
                answerIds: ["task_outlet_handle_base_b1", "task_outlet_handle_base_b2"],
              },
            },
            variations: [
              {
                id: "task_outlet_handle_var1",
                english: "Of course, thank you.",
                chinese: "当然，谢谢你。",
                understand: {
                  chunks: [
                    chunk("task_outlet_handle_var1_u1", "当然"),
                    chunk("task_outlet_handle_var1_u2", "谢谢你"),
                  ],
                  distractors: [chunk("task_outlet_handle_var1_u3", "没关系")],
                  answerIds: ["task_outlet_handle_var1_u1", "task_outlet_handle_var1_u2"],
                },
                focus: {
                  sentenceWithBlanks: "___ course, thank you.",
                  choices: [
                    chunk("task_outlet_handle_var1_f1", "Of"),
                    chunk("task_outlet_handle_var1_f2", "That"),
                    chunk("task_outlet_handle_var1_f3", "No"),
                  ],
                  distractors: [chunk("task_outlet_handle_var1_f4", "Yes")],
                  answerIds: ["task_outlet_handle_var1_f1"],
                },
                build: {
                  promptChinese: "当然，谢谢你。",
                  chunks: [chunk("task_outlet_handle_var1_b1", "Of course"), chunk("task_outlet_handle_var1_b2", "thank you")],
                  distractors: [chunk("task_outlet_handle_var1_bd1", "for sure")],
                  answerIds: ["task_outlet_handle_var1_b1", "task_outlet_handle_var1_b2"],
                },
              },
            ],
          },
          dialogues: [
            {
              id: "task_outlet_dialogue",
              scene: "You are at a café and need to charge your laptop.",
              steps: [
                {
                  speaker: "system",
                  text: "Need some help?",
                },
                {
                  speaker: "user",
                  source: "need",
                  exercise: {
                    chunks: [
                      chunk("task_outlet_dialogue_need_1", "Could I"),
                      chunk("task_outlet_dialogue_need_2", "use this outlet"),
                    ],
                    distractors: [chunk("task_outlet_dialogue_need_3", "near the plant")],
                    answerIds: ["task_outlet_dialogue_need_1", "task_outlet_dialogue_need_2"],
                  },
                  targetText: "Could I use this outlet?",
                },
                {
                  speaker: "system",
                  text: "Of course. Go ahead.",
                },
                {
                  speaker: "user",
                  source: "handle",
                  exercise: {
                    chunks: [chunk("task_outlet_dialogue_handle_1", "Sure"), chunk("task_outlet_dialogue_handle_2", "thanks")],
                    distractors: [chunk("task_outlet_dialogue_handle_3", "later")],
                    answerIds: ["task_outlet_dialogue_handle_1", "task_outlet_dialogue_handle_2"],
                  },
                  targetText: "Sure, thanks.",
                },
              ],
            },
          ],
        },
        {
          id: "task_quieter_seat",
          taskTitle: "Ask for a quieter seat",
          scenePrompt: "You want to keep working without distractions.",
          need: {
            coreExpression: "Is there a quieter seat nearby?",
            meaningChinese: "附近有更安静的座位吗？",
            baseExample: {
              id: "task_quieter_need_base",
              english: "Is there a quieter seat nearby?",
              chinese: "附近有更安静的座位吗？",
              understand: {
                chunks: [
                  chunk("task_quieter_need_base_u1", "附近"),
                  chunk("task_quieter_need_base_u2", "有更安静的座位"),
                  chunk("task_quieter_need_base_u3", "吗"),
                ],
                distractors: [chunk("task_quieter_need_base_u4", "在外面等")],
                answerIds: ["task_quieter_need_base_u1", "task_quieter_need_base_u2", "task_quieter_need_base_u3"],
              },
              focus: {
                sentenceWithBlanks: "Is there a ___ seat nearby?",
                choices: [
                  chunk("task_quieter_need_base_f1", "quieter"),
                  chunk("task_quieter_need_base_f2", "bigger"),
                  chunk("task_quieter_need_base_f3", "heavier"),
                ],
                distractors: [chunk("task_quieter_need_base_f4", "louder")],
                answerIds: ["task_quieter_need_base_f1"],
              },
              build: {
                promptChinese: "附近有更安静的座位吗？",
                chunks: [
                  chunk("task_quieter_need_base_b1", "Is there"),
                  chunk("task_quieter_need_base_b2", "a quieter seat nearby"),
                ],
                distractors: [chunk("task_quieter_need_base_bd1", "for the kitchen")],
                answerIds: ["task_quieter_need_base_b1", "task_quieter_need_base_b2"],
              },
            },
            variations: [
              {
                id: "task_quieter_need_var1",
                english: "Could I move to a quieter seat?",
                chinese: "我可以换到更安静的座位吗？",
                understand: {
                  chunks: [
                    chunk("task_quieter_need_var1_u1", "我可以"),
                    chunk("task_quieter_need_var1_u2", "换到更安静的座位吗"),
                  ],
                  distractors: [chunk("task_quieter_need_var1_u3", "去门口站着")],
                  answerIds: ["task_quieter_need_var1_u1", "task_quieter_need_var1_u2"],
                },
                focus: {
                  sentenceWithBlanks: "Could I move to a ___ seat?",
                  choices: [
                    chunk("task_quieter_need_var1_f1", "quieter"),
                    chunk("task_quieter_need_var1_f2", "closer"),
                    chunk("task_quieter_need_var1_f3", "higher"),
                  ],
                  distractors: [chunk("task_quieter_need_var1_f4", "smaller")],
                  answerIds: ["task_quieter_need_var1_f1"],
                },
                build: {
                  promptChinese: "我可以换到更安静的座位吗？",
                  chunks: [
                    chunk("task_quieter_need_var1_b1", "Could I move"),
                    chunk("task_quieter_need_var1_b2", "to a quieter seat"),
                  ],
                  distractors: [chunk("task_quieter_need_var1_bd1", "near the door")],
                  answerIds: ["task_quieter_need_var1_b1", "task_quieter_need_var1_b2"],
                },
              },
            ],
          },
          handle: {
            coreExpression: "That would be great, thanks.",
            meaningChinese: "那就太好了，谢谢。",
            baseExample: {
              id: "task_quieter_handle_base",
              english: "That would be great, thanks.",
              chinese: "那就太好了，谢谢。",
              understand: {
                chunks: [
                  chunk("task_quieter_handle_base_u1", "那就太好了"),
                  chunk("task_quieter_handle_base_u2", "谢谢"),
                ],
                distractors: [chunk("task_quieter_handle_base_u3", "我先等等")],
                answerIds: ["task_quieter_handle_base_u1", "task_quieter_handle_base_u2"],
              },
              focus: {
                sentenceWithBlanks: "That would be ___, ____.",
                choices: [
                  chunk("task_quieter_handle_base_f1", "great"),
                  chunk("task_quieter_handle_base_f2", "thanks"),
                  chunk("task_quieter_handle_base_f3", "fine"),
                ],
                distractors: [chunk("task_quieter_handle_base_f4", "later")],
                answerIds: ["task_quieter_handle_base_f1", "task_quieter_handle_base_f2"],
              },
              build: {
                promptChinese: "那就太好了，谢谢。",
                chunks: [
                  chunk("task_quieter_handle_base_b1", "That would be great"),
                  chunk("task_quieter_handle_base_b2", "thanks"),
                ],
                distractors: [chunk("task_quieter_handle_base_bd1", "please")],
                answerIds: ["task_quieter_handle_base_b1", "task_quieter_handle_base_b2"],
              },
            },
            variations: [
              {
                id: "task_quieter_handle_var1",
                english: "Yes, that works for me.",
                chinese: "可以，那样我也方便。",
                understand: {
                  chunks: [
                    chunk("task_quieter_handle_var1_u1", "可以"),
                    chunk("task_quieter_handle_var1_u2", "那样我也方便"),
                  ],
                  distractors: [chunk("task_quieter_handle_var1_u3", "我不需要")],
                  answerIds: ["task_quieter_handle_var1_u1", "task_quieter_handle_var1_u2"],
                },
                focus: {
                  sentenceWithBlanks: "Yes, that ___ for me.",
                  choices: [
                    chunk("task_quieter_handle_var1_f1", "works"),
                    chunk("task_quieter_handle_var1_f2", "runs"),
                    chunk("task_quieter_handle_var1_f3", "falls"),
                  ],
                  distractors: [chunk("task_quieter_handle_var1_f4", "calls")],
                  answerIds: ["task_quieter_handle_var1_f1"],
                },
                build: {
                  promptChinese: "可以，那样我也方便。",
                  chunks: [chunk("task_quieter_handle_var1_b1", "Yes"), chunk("task_quieter_handle_var1_b2", "that works for me")],
                  distractors: [chunk("task_quieter_handle_var1_bd1", "thank you anyway")],
                  answerIds: ["task_quieter_handle_var1_b1", "task_quieter_handle_var1_b2"],
                },
              },
            ],
          },
          dialogues: [
            {
              id: "task_quieter_dialogue",
              scene: "You want to keep working without distractions.",
              steps: [
                {
                  speaker: "system",
                  text: "Need a different seat?",
                },
                {
                  speaker: "user",
                  source: "need",
                  exercise: {
                    chunks: [
                      chunk("task_quieter_dialogue_need_1", "Is there"),
                      chunk("task_quieter_dialogue_need_2", "a quieter seat nearby"),
                    ],
                    distractors: [chunk("task_quieter_dialogue_need_3", "next to the door")],
                    answerIds: ["task_quieter_dialogue_need_1", "task_quieter_dialogue_need_2"],
                  },
                  targetText: "Is there a quieter seat nearby?",
                },
                {
                  speaker: "system",
                  text: "Yes. The corner table is quieter.",
                },
                {
                  speaker: "user",
                  source: "handle",
                  exercise: {
                    chunks: [
                      chunk("task_quieter_dialogue_handle_1", "That would be great"),
                      chunk("task_quieter_dialogue_handle_2", "thanks"),
                    ],
                    distractors: [chunk("task_quieter_dialogue_handle_3", "I will stay here")],
                    answerIds: ["task_quieter_dialogue_handle_1", "task_quieter_dialogue_handle_2"],
                  },
                  targetText: "That would be great, thanks.",
                },
              ],
            },
          ],
        },
      ],
    },
    stepIn: {
      title: "Step In",
      goal: "Complete one full scene conversation.",
      scene: "You are sitting in a café with your laptop.",
      milestone: {
        title: "Scene complete.",
        description: "You used what you learned in one full conversation.",
        capability: "You noticed, interpreted, asked, and responded naturally.",
        cta: "See Course Complete",
      },
      dialogue: {
        id: "step_in_dialogue",
        scene: "You are sitting in a café with your laptop.",
        turns: [
          {
            speaker: "system",
            text: "What do you notice around you?",
          },
          {
            speaker: "user",
            sourceModule: "notice",
            exercise: {
              chunks: [
                chunk("step_in_notice_1", "A laptop"),
                chunk("step_in_notice_2", "is sitting next to"),
                chunk("step_in_notice_3", "the coffee mug"),
              ],
              distractors: [chunk("step_in_notice_4", "under the table")],
              answerIds: ["step_in_notice_1", "step_in_notice_2", "step_in_notice_3"],
            },
            targetText: "A laptop is sitting next to the coffee mug.",
          },
          {
            speaker: "system",
            text: "What do you think is happening here?",
          },
          {
            speaker: "user",
            sourceModule: "interpret",
            exercise: {
              chunks: [
                chunk("step_in_interpret_1", "It looks like"),
                chunk("step_in_interpret_2", "someone is working on a report"),
              ],
              distractors: [chunk("step_in_interpret_3", "someone is leaving for lunch")],
              answerIds: ["step_in_interpret_1", "step_in_interpret_2"],
            },
            targetText: "It looks like someone is working on a report.",
          },
          {
            speaker: "system",
            text: "You need to keep working here.",
          },
          {
            speaker: "user",
            sourceModule: "interact",
            exercise: {
              chunks: [chunk("step_in_need_1", "Could I"), chunk("step_in_need_2", "use this outlet")],
              distractors: [chunk("step_in_need_3", "sit by the window")],
              answerIds: ["step_in_need_1", "step_in_need_2"],
            },
            targetText: "Could I use this outlet?",
          },
          {
            speaker: "system",
            text: "Of course. Go ahead.",
          },
          {
            speaker: "user",
            sourceModule: "interact",
            exercise: {
              chunks: [chunk("step_in_handle_1", "Sure"), chunk("step_in_handle_2", "thanks")],
              distractors: [chunk("step_in_handle_3", "maybe later")],
              answerIds: ["step_in_handle_1", "step_in_handle_2"],
            },
            targetText: "Sure, thanks.",
          },
        ],
      },
    },
    completion: {
      title: "Deep Mode complete.",
      description: "You turned one real scene into one full conversation.",
      reviewCta: "Review This Scene",
      retryCta: "Try Another Photo",
      moduleStatuses: [
        { id: "notice", label: "Notice", detail: "Objective descriptions" },
        { id: "interpret", label: "Interpret", detail: "Cautious inferences" },
        { id: "interact", label: "Interact", detail: "Needs and replies" },
        { id: "stepIn", label: "Step In", detail: "Full scene conversation" },
      ],
    },
  },
};

export function buildModuleSequences(course = deepModeCourse) {
  const noticeSequences = course.modules.notice.expressionPacks.flatMap((pack, packIndex) => {
    const entries = [];
    entries.push(...createExampleSequence({
      moduleId: "notice",
      packId: pack.id,
      packIndex,
      exampleId: "base",
      example: pack.baseExample,
      exampleIndex: 0,
    }));

    pack.variations.forEach((variation, variationIndex) => {
      entries.push(...createExampleSequence({
        moduleId: "notice",
        packId: pack.id,
        packIndex,
        exampleId: `variation-${variationIndex}`,
        example: variation,
        exampleIndex: variationIndex + 1,
      }));
    });

    pack.quickResponses.forEach((response, responseIndex) => {
      entries.push(createQuickResponseSequence({
        moduleId: "notice",
        packId: pack.id,
        packIndex,
        response,
        responseIndex,
      }));
    });

    return entries;
  });

  const interpretSequences = course.modules.interpret.expressionPacks.flatMap((pack, packIndex) => {
    const entries = [];
    entries.push(...createExampleSequence({
      moduleId: "interpret",
      packId: pack.id,
      packIndex,
      exampleId: "base",
      example: pack.baseExample,
      exampleIndex: 0,
    }));

    pack.variations.forEach((variation, variationIndex) => {
      entries.push(...createExampleSequence({
        moduleId: "interpret",
        packId: pack.id,
        packIndex,
        exampleId: `variation-${variationIndex}`,
        example: variation,
        exampleIndex: variationIndex + 1,
      }));
    });

    pack.quickResponses.forEach((response, responseIndex) => {
      entries.push(createQuickResponseSequence({
        moduleId: "interpret",
        packId: pack.id,
        packIndex,
        response,
        responseIndex,
      }));
    });

    return entries;
  });

  const interactSequences = course.modules.interact.taskPacks.flatMap((pack, packIndex) =>
    createInteractSequence({ moduleId: "interact", packId: pack.id, packIndex, pack }),
  );

  const stepInSequences = [
    {
      id: course.modules.stepIn.dialogue.id,
      moduleId: "stepIn",
      kind: "dialogue",
      stageLabel: "Step In",
      title: "Step In",
      subtitle: course.modules.stepIn.scene,
      dialogue: course.modules.stepIn.dialogue,
    },
  ];

  return {
    notice: noticeSequences,
    interpret: interpretSequences,
    interact: interactSequences,
    stepIn: stepInSequences,
  };
}

export const deepModeSequences = buildModuleSequences(deepModeCourse);
