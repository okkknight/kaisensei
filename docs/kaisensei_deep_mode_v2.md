# kaisensei 深度学习模式产品设计 v2

## 1. 目标

Deep Mode 是独立于 Quick Mode 的深度课程模式。

Quick Mode 解决：

> 拍一张照片，快速生成一个 1 分钟英语练习。

Deep Mode 解决：

> 基于一张真实照片，生成一节“真实场景互动表达课”，让用户学会在这个场景里观察、理解、表达需求、主动开口和回应别人。

Deep Mode 前期只做文字输入，不做语音输入。但所有内容都按“口语表达训练”设计。

---

## 2. 和 Quick Mode 的关系

Deep Mode 与 Quick Mode 完全隔离。

不要复用 Quick Mode 的课程流程：

```text
See -> Learn -> Build -> Use
```

Deep Mode 使用独立流程：

```text
See it -> Read it -> Need it -> Say it -> Handle it -> Scene Wrap
```

建议架构上独立：

```text
api/src/contracts/deep-lesson.js
api/src/services/deep-lesson-normalizer.js
api/src/services/deep-course-provider.js
prototype/src/deep/
docs/deep-course-protocol.md
```

Quick Mode 和 Deep Mode 可以共享拍照入口、图片上传、loading 状态，但课程生成、课程结构、校验和 UI flow 应分开。

---

## 3. Deep Mode 课程定义

Deep Mode 不是：

- 图片描述课
- 单词表
- 语法课
- 聊天机器人
- Quick Mode 加长版
- 通用英语主题课

Deep Mode 是：

> 基于真实照片生成的文字版场景口语训练。

课程要围绕照片里的真实生活场景，让用户练习：

1. 我看到了什么
2. 这个场景可能意味着什么
3. 如果我在这里，我可能需要表达什么
4. 我应该怎么主动开口
5. 对方回应后，我怎么自然接住
6. 最后我能不能综合说完整个场景

---

## 4. 标准课程流程

### 4.1 See it

目标：训练观察型表达。

用户学习如何描述眼前所见，不是罗列所有物体。

常见表达方向：

```text
I see...
I notice...
There is / There are...
next to / behind / in front of / on the left
The first thing I notice is...
```

---

### 4.2 Read it

目标：训练推测型表达。

用户根据照片推测正在发生什么、人物状态、场景氛围或可能原因。

常见表达方向：

```text
It looks like...
It seems like...
Maybe...
They might be...
This feels like...
```

---

### 4.3 Need it

目标：训练需求型表达。

用户思考：如果我真的在这个场景里，我可能需要说什么。

常见表达方向：

```text
I need to...
I'm looking for...
I want to...
Could I...?
Can I...?
Do you know where...?
```

---

### 4.4 Say it

目标：训练主动开口。

用户学习在当前场景中完成一个具体小任务，例如问座位、问 Wi-Fi、借充电口、点单、请求帮助。

常见表达方向：

```text
Is this seat taken?
Could I sit here?
Could I use this outlet?
Can I get the Wi-Fi password?
Could you help me with this?
```

---

### 4.5 Handle it

目标：训练接话和回应。

真实互动不是说出一句就结束，用户还要学会接住对方的回应。

常见表达方向：

```text
Thanks.
No worries.
That's okay.
Thanks anyway.
I'll be quick.
Sure, no problem.
I appreciate it.
```

---

### 4.6 Scene Wrap

目标：最终挑战。

用户需要综合使用前面至少 3 个模块学到的表达，完成一次短场景表达或短互动。

Scene Wrap 不是普通总结，而是最后检验：

> 用户是否真的能围绕这张照片完成一段真实场景表达。

---

## 5. 课程生成协议

AI 必须按照以下协议生成课程。

### 5.1 输入

```json
{
  "mode": "deep",
  "level": "normal",
  "imageContext": "<photo or image description>",
  "config": {
    "corePackSize": {
      "see_it": 2,
      "read_it": 2,
      "need_it": 2,
      "say_it": 3,
      "handle_it": 2
    },
    "loopConfig": {
      "variationsPerExpression": 1,
      "buildPerVariation": 1,
      "tryPerVariation": 1
    },
    "difficulty": {
      "vocabularyLevel": "daily",
      "expressionStyle": "natural",
      "sentenceLength": "short",
      "supportChinese": true,
      "typedAnswerStrictness": "tolerant"
    }
  }
}
```

---

### 5.2 参数说明

#### corePackSize

控制每个模块生成多少个核心表达。

默认值：

```json
{
  "see_it": 2,
  "read_it": 2,
  "need_it": 2,
  "say_it": 3,
  "handle_it": 2
}
```

每个模块有自己的 Core Pack，不要求全课程复用同一组表达。

要求：

- 模块之间可以使用不同核心表达
- 每个模块内部必须围绕自己的 Core Pack 重复练习
- Scene Wrap 必须综合复用至少 3 个模块的表达

---

#### loopConfig

控制每个核心表达如何练习。

默认值：

```json
{
  "variationsPerExpression": 1,
  "buildPerVariation": 1,
  "tryPerVariation": 1
}
```

含义：

- 一个核心表达可以生成多个变形表达
- 每个变形表达都要配一组 Build 和 Try
- Build 用来重建表达
- Try 用来让用户用这个表达完成一次短回答

例：

核心表达：

```text
It looks like...
```

变形表达：

```text
It looks like someone is working.
```

Build：

```text
looks like / someone / is working / It
```

Try：

```text
What might be happening here?
```

---

#### difficulty

控制难度，但不改变课程本质。

Normal：

```json
{
  "vocabularyLevel": "daily",
  "expressionStyle": "natural",
  "sentenceLength": "short"
}
```

Advanced：

```json
{
  "vocabularyLevel": "richer",
  "expressionStyle": "more_native",
  "sentenceLength": "medium"
}
```

注意：

- Advanced 不是考试英语
- Advanced 只是表达更自然、更丰富、更接近真实口语
- 不要生成复杂长句
- 不要变成语法讲解课

---

## 6. 模块内部结构

每个模块必须包含：

```json
{
  "id": "read_it",
  "title": "Read it",
  "goal": "Guess what may be happening in the scene.",
  "corePack": [
    {
      "expression": "It looks like...",
      "meaningChinese": "看起来像是……",
      "usage": "Use it when you guess what is happening from what you can see.",
      "variations": [
        {
          "sentence": "It looks like someone is working.",
          "meaningChinese": "看起来有人正在工作。",
          "build": [
            {
              "type": "word_order",
              "prompt": "Build the sentence.",
              "chunks": ["It", "looks like", "someone", "is working"],
              "answer": "It looks like someone is working."
            }
          ],
          "try": [
            {
              "type": "short_answer",
              "prompt": "What might be happening here?",
              "requiredExpression": "It looks like",
              "suggestedAnswer": "It looks like someone is working."
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 7. 练习类型

V2 只支持文字输入。

### 7.1 fill_blank

用于低压力识别。

```json
{
  "type": "fill_blank",
  "prompt": "It ___ like someone is working.",
  "choices": ["looks", "watches", "sees"],
  "answer": "looks"
}
```

---

### 7.2 word_order

用于重建表达。

```json
{
  "type": "word_order",
  "prompt": "Build the sentence.",
  "chunks": ["Could", "I", "use", "this outlet"],
  "answer": "Could I use this outlet?"
}
```

---

### 7.3 multiple_choice

用于选择自然表达或自然回应。

```json
{
  "type": "multiple_choice",
  "prompt": "How do you ask if a seat is free?",
  "choices": [
    "Is this seat taken?",
    "Does this chair have a person?",
    "Is this chair busy?"
  ],
  "answer": "Is this seat taken?"
}
```

---

### 7.4 short_answer

用于手输短句或句子。

```json
{
  "type": "short_answer",
  "prompt": "Ask if you can use the outlet.",
  "requiredExpression": "Could I use",
  "suggestedAnswer": "Could I use this outlet?"
}
```

检查规则：

- 忽略大小写
- 忽略标点
- 忽略多余空格
- 不要求和 suggestedAnswer 完全一致
- 优先检查是否自然表达了意图
- 如果设置了 requiredExpression，应检查是否使用或接近使用该表达

---

## 8. 标准输出 JSON

AI 最终必须输出：

```json
{
  "mode": "deep",
  "level": "normal",
  "scene": {
    "title": "Working from a cafe",
    "summary": "A person is sitting at a cafe with a laptop and coffee.",
    "interactionGoal": "Talk about working or studying in a cafe."
  },
  "modules": [
    {
      "id": "see_it",
      "title": "See it",
      "goal": "Describe what you notice.",
      "corePack": []
    },
    {
      "id": "read_it",
      "title": "Read it",
      "goal": "Guess what may be happening.",
      "corePack": []
    },
    {
      "id": "need_it",
      "title": "Need it",
      "goal": "Express what you may need in this scene.",
      "corePack": []
    },
    {
      "id": "say_it",
      "title": "Say it",
      "goal": "Say useful lines to complete a real task.",
      "corePack": []
    },
    {
      "id": "handle_it",
      "title": "Handle it",
      "goal": "Respond naturally to realistic replies.",
      "corePack": []
    }
  ],
  "sceneWrap": {
    "title": "Scene Wrap",
    "prompt": "Use expressions from at least three parts to complete the scene.",
    "requiredModuleIds": ["see_it", "need_it", "handle_it"],
    "tasks": [
      {
        "type": "short_answer",
        "prompt": "Say one sentence about what you notice.",
        "suggestedAnswer": "I notice an open laptop on the table."
      },
      {
        "type": "short_answer",
        "prompt": "Ask for something you may need here.",
        "suggestedAnswer": "Could I use this outlet?"
      },
      {
        "type": "short_answer",
        "prompt": "Respond politely if someone says no.",
        "suggestedAnswer": "No worries, thanks anyway."
      }
    ]
  },
  "takeaways": [
    "I notice...",
    "It looks like...",
    "Could I use this outlet?",
    "No worries, thanks anyway."
  ]
}
```

---

## 9. 生成约束

AI 生成课程时必须遵守：

- 必须基于真实照片场景
- 不要生成通用主题课
- 不要列出照片里的所有物体
- 不要把课程做成单词表
- 不要写成长篇解释
- 不要设计语音输入
- 不要要求严格语法考试式回答
- 每个模块必须有 Core Pack
- 每个 Core Pack 必须有 variations
- 每个 variation 必须有 Build 和 Try
- 每个模块内部必须重复使用自己的核心表达
- Scene Wrap 必须复用至少 3 个模块的表达
- 表达要自然、口语、高频、实用
- 中文只用于辅助理解，不要喧宾夺主

---

## 10. 校验规则

normalizer 至少检查：

- `mode` 必须是 `"deep"`
- `modules` 必须包含 5 个固定模块
- 模块顺序必须是：`see_it`, `read_it`, `need_it`, `say_it`, `handle_it`
- 每个模块必须有 `corePack`
- 每个 core expression 必须有 `expression`, `meaningChinese`, `variations`
- 每个 variation 必须有 `sentence`, `build`, `try`
- `build` 和 `try` 数量应符合 `loopConfig`
- drill type 必须是允许类型之一
- `sceneWrap` 必须存在
- `sceneWrap` 必须要求复用至少 3 个模块
- `takeaways` 必须存在，数量建议 3-6 条

如果 AI 输出缺字段，normalizer 可以做轻量补全；如果结构严重错误，应拒绝并重新生成。

---

## 11. 一句话总结

Deep Mode 的核心不是“从照片生成更多英语内容”，而是：

> 从真实照片生成一场文字版场景口语训练，让用户学会在这个场景里观察、理解、表达需求、主动开口和自然回应。
