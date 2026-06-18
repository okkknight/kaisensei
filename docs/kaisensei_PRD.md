# kaisensei 产品设计文档 v2

## 1. 产品定义

**kaisensei** 是一个手机网页英语学习工具。

核心体验：

> 拍一张照片，生成一节 1 分钟场景英语小课。

用户不是在浏览 AI 对照片的多种描述，而是在围绕一张真实照片完成一个完整的语言学习闭环：

```text
See → Learn → Build → Use
```

对应中文：

```text
看懂 → 学词块 → 拼原句 → 用到生活里
```

---

## 2. 产品一句话

**用身边真实场景，学会一句真正能用的英语。**

---

## 3. 核心变化

旧思路偏向：

```text
Describe / Explain / Comment / Practice
```

这些更像 AI 输出风格，不像学习动作。

新版 kaisensei 改成：

```text
See / Learn / Build / Use
```

每一步都有明确学习目的：

| 步骤 | 学习动作 | 用户在做什么 |
|---|---|---|
| See | 理解输入 | 看懂照片对应的一句自然英文 |
| Learn | 词块学习 | 学会句子里的可复用表达块 |
| Build | 控制输出 | 用词块拼出原始句子 |
| Use | 场景迁移输出 | 回答一个生活问题，用词块拼出自己的回答 |

---

## 4. 产品气质

kaisensei 不应该像传统英语学习软件。

它应该像：

> 一个轻松、有点可爱、会鼓励你的英语小教练。

### 风格关键词

```text
friendly
playful
soft
warm
cartoon-light
clean
encouraging
not childish
not corporate
not flashy
```

中文理解：

```text
轻松
有亲和力
有一点卡通感
不死板
不花哨
不幼稚
```

### 参考感觉

接近 Duolingo 那种轻松、有生命力的学习氛围，但不要太吵、太游戏化、太花哨。

### 避免

不要做成：

- 考试软件
- 背单词软件
- 教材阅读器
- 普通 AI 聊天工具
- 科技感过强的视觉识别 App
- 过度二次元或 IP 同人产品

---

## 5. 目标用户

### 主要用户

- 想练日常英语表达的人
- 有一定词汇量，但说不出自然句子的人
- 不喜欢死记硬背的人
- 希望把英语融入真实生活场景的人
- 适合碎片化学习的人

### 典型场景

- 拍桌面，学办公/学习表达
- 拍厨房，学生活物品和动作
- 拍街景，学环境描述
- 拍商品，学购物表达
- 拍房间，学家居表达
- 拍食物，学饮食表达

---

## 6. MVP 核心流程

```text
打开页面
↓
进入相机页
↓
拍照 / 上传照片
↓
AI 生成一节 Quick Lesson
↓
进入 See
↓
Continue 到 Learn
↓
Continue 到 Build
↓
完成拼句
↓
Continue 到 Use
↓
回答生活场景问题
↓
Finish / Retake
```

MVP 只做 **Quick Lesson**，目标是 1 分钟左右完成一张照片的小课。

---

## 7. 页面状态

MVP 主要有三个状态：

```text
Camera Mode
Loading Mode
Lesson Mode
```

---

## 8. Camera Mode 相机页

### 目标

让用户一打开就知道：这是一个拍照学习工具。

### 页面结构

```text
┌────────────────────────┐
│                        │
│      Camera Preview    │
│                        │
│                        │
├────────────────────────┤
│      kaisensei         │
│  Take a photo.         │
│  Learn one sentence.   │
│                        │
│         ○              │
│      拍照按钮           │
│                        │
│  Upload       Normal   │
└────────────────────────┘
```

### 关键元素

- 相机预览
- 拍照按钮
- 上传图片入口
- 难度选择：Normal / Advanced
- 友好引导文案

### 推荐文案

```text
Take a photo. Learn one sentence.
```

或：

```text
Snap a scene. Build the English.
```

---

## 9. Loading Mode 加载页

拍照后，进入轻量加载状态。

### 文案

```text
Looking at your scene...
Building your mini lesson...
```

### 视觉

- 小教练 mascot
- loading dots
- 柔和背景
- 不要冷冰冰的 spinner

---

## 10. Lesson Mode 小课页

小课由 4 个连续步骤组成：

```text
1 / 4 See
2 / 4 Learn
3 / 4 Build
4 / 4 Use
```

### 页面通用元素

- 顶部返回按钮
- 顶部轻量进度条
- 当前步骤标题
- 照片缩略图
- 主要学习卡片
- 底部主按钮
- Normal / Advanced 难度入口

### 导航方式

MVP 以按钮为主：

```text
Continue
Back
Check
Finish
```

可以保留左右滑动，但不要让它成为主要交互。因为这是一节有顺序的小课，不是平级 Tab。

---

## 11. Step 1：See 看懂

### 目标

给用户一句最自然、最值得记住的照片英文表达。

### 示例

照片：桌上有咖啡杯、电脑、笔记本。

```text
A coffee mug is sitting next to a laptop on the desk.
```

### 页面内容

```text
See

Here’s a natural sentence for this scene.

A coffee mug is sitting next to a laptop on the desk.

[Play]
[中文解释]
[Continue]
```

### 设计原则

- 只给一句核心英文
- 不列举太多物体
- 不写成长段说明
- 英文视觉上最突出
- 中文解释默认弱化或折叠

---

## 12. Step 2：Learn 学词块

### 目标

把 See 句子拆成可复用的英语词块。

不是学孤立单词，而是学表达单位。

### 示例

原句：

```text
A coffee mug is sitting next to a laptop on the desk.
```

词块：

```text
A coffee mug
is sitting
next to
a laptop
on the desk
```

### 页面内容

```text
Learn

Learn the useful chunks.

[A coffee mug]
一个咖啡杯

[is sitting]
放着

[next to]
在……旁边

[a laptop]
一台笔记本电脑

[on the desk]
在桌上

Tip:
Use “next to” when two things are close together.

[Continue]
```

### 设计原则

- 词块像积木一样展示
- 每个词块有短中文
- 不讲复杂语法术语
- 不把句子拆得太碎
- 尽量教可迁移表达

---

## 13. Step 3：Build 拼原句

### 目标

用户通过词块重排，把 See 里的原句拼出来。

这是第一次主动输出，但仍然是控制型输出。

### 示例

目标句：

```text
A coffee mug is sitting next to a laptop on the desk.
```

乱序词块：

```text
on the desk
is sitting
next to
A coffee mug
a laptop
```

正确顺序：

```text
A coffee mug / is sitting / next to / a laptop / on the desk
```

### 页面结构

```text
Build

Put the chunks in order.

Answer:
[ 空答案区 ]

Chunks:
[on the desk] [is sitting] [next to]
[A coffee mug] [a laptop]

[Check]
[Reset]
```

### 交互规则

MVP 使用点击排序，不先做拖拽。

```text
点击乱序词块 → 进入答案区
点击答案区词块 → 回到乱序区
点击 Reset → 全部重置
点击 Check → 判断顺序
正确后显示绿色反馈，并允许 Continue
错误后显示轻量提示，允许继续调整
```

### 反馈文案

正确：

```text
Nice. This sentence is yours now.
```

或：

```text
Great job. You built the sentence.
```

错误：

```text
Almost. Try again.
```

更具体时：

```text
Almost. Try putting the place at the end.
```

### 设计原则

- Build 只负责复原原句
- 不要在这里做生活场景迁移
- 不要拆成单词级碎片
- 错误反馈不要像考试

---

## 14. Step 4：Use 生活场景问答

### 新定义

Use 不再是单纯展示一个使用例句。

新版 Use 是：

> AI 提一个和照片相关的生活场景问题，用户用词块拼出回答。

它是第二次主动输出，也是整节课的迁移环节。

---

### 14.1 Use 与 Build 的区别

#### Build

练的是：

```text
复原照片原句
```

例如：

```text
A coffee mug is sitting next to a laptop on the desk.
```

#### Use

练的是：

```text
回答一个生活问题
```

例如问题：

```text
What do you usually keep next to your laptop while you work?
```

用户拼出回答：

```text
I usually keep a coffee mug next to my laptop while I work.
```

两者交互类似，但学习目的不同：

| Step | 目标 | 句子类型 |
|---|---|---|
| Build | 重建原句 | 照片描述句 |
| Use | 场景迁移回答 | 真实生活回答句 |

---

### 14.2 Use 页面结构

```text
Use

Answer the question.

Q:
What do you usually keep next to your laptop while you work?

中文小字：
你工作时通常把什么放在笔记本电脑旁边？

Your answer:
[ 空答案区 ]

Chunks:
[while I work] [next to] [I usually keep]
[my laptop] [a coffee mug]

[Check]
[Reset]
```

正确后展示：

```text
I usually keep a coffee mug next to my laptop while I work.

[Play]
[Finish]
```

---

### 14.3 Use 交互规则

Use 与 Build 共用词块重排组件。

流程：

```text
显示生活场景问题
↓
显示乱序回答词块
↓
用户点击词块拼回答
↓
点击 Check
↓
判断是否正确
↓
正确后播放回答句 / 完成
↓
错误则轻量提示并允许重试
```

---

### 14.4 Use 反馈文案

正确：

```text
Nice. Now you can use this in real life.
```

或：

```text
Good. You answered with a real sentence.
```

错误：

```text
Almost. Try starting with “I usually keep...”.
```

或：

```text
Close. Think about who is doing the action first.
```

---

### 14.5 Use 设计原则

- Use 必须有问题，不只是例句
- 用户必须拼出回答
- 回答要和真实生活有关
- 问题不要太抽象
- 句子不要太长
- 词块数量建议 4-6 个
- 中文提示可以有，但要弱化
- 正确后要有完成感

---

## 15. 难度等级

只保留两个等级：

```text
Normal / Advanced
```

### Normal 默认

特点：

- 自然
- 清晰
- 句子不长
- 适合大多数用户
- 优先日常口语表达

示例：

```text
A coffee mug is sitting next to a laptop on the desk.
```

### Advanced

特点：

- 更地道
- 可以用更高级但常见的词汇和搭配
- 依然要实用、口语化，像真实生活里会说的话
- 可以加入一点细节或更顺滑的句法，但不要学术化
- 但不要变成长篇

示例：

```text
A coffee mug sits beside the laptop, ready for a long afternoon of work.
```

### 切换规则

MVP 可采用：

```text
切换 Normal / Advanced → 仅影响下一次生成，不重做当前课程
```

如果使用 mock 数据：

```text
切换 Normal / Advanced → 切换对应 mock lesson
```

---

## 16. AI 输出结构

建议 AI 一次返回整节 Quick Lesson。

```ts
export type Level = "Normal" | "Advanced";

export type LessonStep = "See" | "Learn" | "Build" | "Use";

export type Chunk = {
  id: string;
  text: string;
  chinese: string;
};

export type ReorderExercise = {
  targetSentence: string;
  chunks: Chunk[];
  correctOrder: string[];
};

export type UseExercise = {
  situation: string;
  question: string;
  targetAnswer: string;
  answerChunks: Chunk[];
  correctOrder: string[];
  speakText: string;
};

export type KaisenLesson = {
  level: Level;
  see: {
    sentence: string;
    chinese: string;
    speakText: string;
  };
  learn: {
    chunks: Chunk[];
    note: string;
  };
  build: ReorderExercise;
  use: UseExercise;
};
```

---

## 17. 示例 JSON

```json
{
  "level": "Normal",
  "see": {
    "sentence": "A coffee mug is sitting next to a laptop on the desk.",
    "chinese": "一个咖啡杯放在桌上，旁边是一台笔记本电脑。",
    "speakText": "A coffee mug is sitting next to a laptop on the desk."
  },
  "learn": {
    "chunks": [
      {
        "id": "c1",
        "text": "A coffee mug",
        "chinese": "一个咖啡杯"
      },
      {
        "id": "c2",
        "text": "is sitting",
        "chinese": "放着"
      },
      {
        "id": "c3",
        "text": "next to",
        "chinese": "在……旁边"
      },
      {
        "id": "c4",
        "text": "a laptop",
        "chinese": "一台笔记本电脑"
      },
      {
        "id": "c5",
        "text": "on the desk",
        "chinese": "在桌上"
      }
    ],
    "note": "Use “next to” when two things are close together."
  },
  "build": {
    "targetSentence": "A coffee mug is sitting next to a laptop on the desk.",
    "chunks": [
      {
        "id": "c5",
        "text": "on the desk",
        "chinese": "在桌上"
      },
      {
        "id": "c2",
        "text": "is sitting",
        "chinese": "放着"
      },
      {
        "id": "c3",
        "text": "next to",
        "chinese": "在……旁边"
      },
      {
        "id": "c1",
        "text": "A coffee mug",
        "chinese": "一个咖啡杯"
      },
      {
        "id": "c4",
        "text": "a laptop",
        "chinese": "一台笔记本电脑"
      }
    ],
    "correctOrder": ["c1", "c2", "c3", "c4", "c5"]
  },
  "use": {
    "situation": "You are talking about your workspace.",
    "question": "What do you usually keep next to your laptop while you work?",
    "targetAnswer": "I usually keep a coffee mug next to my laptop while I work.",
    "answerChunks": [
      {
        "id": "u1",
        "text": "while I work",
        "chinese": "当我工作时"
      },
      {
        "id": "u2",
        "text": "next to",
        "chinese": "在……旁边"
      },
      {
        "id": "u3",
        "text": "I usually keep",
        "chinese": "我通常放"
      },
      {
        "id": "u4",
        "text": "my laptop",
        "chinese": "我的笔记本电脑"
      },
      {
        "id": "u5",
        "text": "a coffee mug",
        "chinese": "一个咖啡杯"
      }
    ],
    "correctOrder": ["u3", "u5", "u2", "u4", "u1"],
    "speakText": "I usually keep a coffee mug next to my laptop while I work."
  }
}
```

---

## 18. Prompt 设计

### System Prompt

```text
You are kaisensei, a friendly photo-based English coach.

The user will provide one photo.
Your job is to turn the photo into a short English micro-lesson.

The lesson must follow this path:
See -> Learn -> Build -> Use.

Return JSON only.
Do not include markdown.
Do not include extra commentary.
```

### User Prompt Template

```text
Generate a photo-based English micro-lesson.

Level: {Normal | Advanced}

Rules:
- Focus on one useful sentence from the photo.
- The sentence should be natural spoken English.
- For See and Build, describe the visible scene from an observer's perspective.
- Prefer third-person or objective phrasing for See and Build.
- Avoid first-person and second-person pronouns in See and Build unless they are clearly visible in the photo as text or speech.
- If a person is visible, describe what they are doing or what is happening around them, not what the viewer is doing.
- Do not list too many objects.
- Teach chunks, not isolated words.
- Learn chunks should be cut naturally from the sentence, centered on high-frequency words, phrases, collocations, and fixed expressions rather than mechanical sentence slices. Prefer 3-4 chunks for simple scenes and 4-5 for richer scenes.
- Avoid clause-by-clause slicing or equal-sized chunks; merge obvious neighbors when that sounds more natural.
- Build exercise should reconstruct the See sentence with re-segmented natural-language chunks, not the same chunking used in Learn.
- Build chunks should be chosen around grammar and flow, such as noun phrases, verb phrases, and prepositional phrases, so the sentence feels like real assembly. Build should be slightly more challenging than Learn.
- Use exercise must feel like a real conversation in a specific setting, not a generic photo prompt.
- Use exercise must ask a concrete spoken question from a specific person, such as a coworker, friend, teacher, barista, roommate, or interviewer.
- Use question must not mention the picture, photo, image, or scene.
- Use question should feel like a conversational follow-up, such as a reaction, confirmation, opinion, or simple personal answer.
- Use exercise must provide a target answer.
- Use answer must naturally reuse 1-2 chunks or collocations from Learn, but not all of them.
- Use answer should add at least one new idea, reaction, opinion, or personal detail so it feels like a real reply instead of a paraphrase of See.
- Use answer must be split into 4-6 reusable chunks.
- The user will reorder the chunks to answer the question.
- Use may use first-person or second-person phrasing because it practices how the user would answer in real life.
- Keep Chinese explanations short.
- Avoid grammar jargon.
- If something is uncertain in the image, say what seems visible instead of guessing.
- Keep the whole lesson short enough to finish in about one minute.

Return this JSON shape:
{
  "level": "Normal" | "Advanced",
  "see": {
    "sentence": string,
    "chinese": string,
    "speakText": string
  },
  "learn": {
    "chunks": [
      {
        "id": string,
        "text": string,
        "chinese": string
      }
    ],
    "note": string
  },
  "build": {
    "targetSentence": string,
    "chunks": [
      {
        "id": string,
        "text": string,
        "chinese": string
      }
    ],
    "correctOrder": string[]
  },
  "use": {
    "situation": string,
    "question": string,
    "targetAnswer": string,
    "answerChunks": [
      {
        "id": string,
        "text": string,
        "chinese": string
      }
    ],
    "correctOrder": string[],
    "speakText": string
  }
}
```

---

## 19. 语音策略

MVP 使用浏览器 TTS 或现有 TTS 服务。

### 可播放内容

- See 句子
- Use 回答句
- Learn 词块后续可选
- Build 暂时不需要播放

### 规则

- 只朗读英文
- 不朗读中文
- 播放按钮要明显
- 播放中有 active 状态

---

## 20. 视觉设计方向

### 整体感觉

```text
轻松
卡通
温暖
有人味
清爽
不花哨
```

### 组件建议

- 大圆角卡片
- 小教练 mascot
- 词块积木 chip
- 轻量进度条
- 黄色主按钮
- 绿色正确反馈
- 友好错误提示
- 柔和背景
- 大拇指友好的点击区域

### 文案风格

不要：

```text
Complete the sentence reconstruction exercise.
```

要：

```text
Build the sentence.
```

不要：

```text
Correct. You have completed this task.
```

要：

```text
Nice. This sentence is yours now.
```

---

## 21. MVP 功能清单

### 必须做

- 手机网页
- 相机 / 上传图片
- 拍照后生成 Quick Lesson
- Loading 状态
- See Step
- Learn Step
- Build Step
- Use Step：生活场景问答 + 拼句回答
- Normal / Advanced 两档难度
- Build 词块重排
- Use 词块重排
- Check 答案
- 正确 / 错误反馈
- 播放英文语音
- 中文解释弱化展示
- 重新拍照
- 基础错误状态

### 暂时不做

- 登录
- 历史记录
- 学习打卡
- 复杂积分系统
- 口语跟读评分
- 用户录音
- Deep Mode 完整实现（作为独立 V2，不属于本 PRD 的 Quick Lesson 首版）
- 社区分享
- 支付
- iOS 原生 App
- 实时摄像头连续识别

---

## 22. 关键组件建议

```text
CameraScreen
LoadingLesson
LessonScreen
StepProgress
LevelSelector
PhotoPreview
SeeStep
LearnStep
BuildStep
UseStep
ReorderExercise
ChunkChip
VoiceButton
FeedbackCard
MascotBubble
PrimaryButton
ErrorState
```

其中 `ReorderExercise` 应该能被 Build 和 Use 复用。

---

## 23. 验收标准

第一版完成后，应满足：

1. 用户打开手机网页后，可以拍照或上传图片。
2. 拍照后生成一节 Quick Lesson。
3. 小课包含 See / Learn / Build / Use 四步。
4. 默认难度是 Normal。
5. 用户可以切换 Advanced。
6. See 只聚焦一句自然英文。
7. Learn 展示 3-5 个词块。
8. Build 可以完成照片原句的词块重排。
9. Use 会提出生活场景问题。
10. Use 用户可以通过词块重排回答问题。
11. Build 和 Use 都有 Check 和反馈。
12. 英文可以播放。
13. 中文解释不喧宾夺主。
14. 整体风格轻松、卡通、有人味，但不花哨。
15. 用户可以在 1 分钟左右完成一张照片的小课。

---

## 24. 当前结论

kaisensei 的第一版闭环应该是：

```text
一张照片
一句核心英文
几个可复用词块
一次原句重排
一次生活问答重排
```

它不是“AI 帮你描述照片”，而是：

> 用一张照片，练出一句真实能用的英语。

---

## 25. Deep Mode V2 边界确认

Deep Mode 是与 Quick Mode 并列的独立模式，不是 Quick Lesson 的加长版。

### 入口

- Deep Mode 通过现有相机页里的模式切换进入
- 不新增独立首页，不把入口拆到别的页面

### 共享能力

- 只要是与具体课程实现无关的能力，都可以在 Quick Mode 和 Deep Mode 之间共享
- 例如拍照入口、上传、loading 壳、基础按钮、通用反馈、基础 TTS 播放能力都可以复用
- 课程生成、课程结构、校验逻辑、题型和课程 UI flow 必须独立

### 首发范围

- Deep Mode V1 必须一次性覆盖完整能力，不做半成品交付
- 路线可以拆阶段，但整体计划必须包含全部能力
- 课程必须支持真实图片端到端生成

### 输出与校验

- Deep Mode 使用独立输出 schema，结构与 Quick Lesson 分开
- `short_answer` 先只做 tolerant 文本匹配
- 对结构严重错误的输出先严格拒绝，不做轻量补全
- 后续是否补轻量修复，再根据验收情况决定

### 输入与播放

- Deep Mode 前期不做语音输入
- 英文 TTS 播放保留，题目朗读按钮保留
- 只是不做语音作答

### 课程目标

- Deep Mode 的目标是文字版场景口语训练
- 它不是图片描述课、单词表、语法课或聊天机器人
- 课程要覆盖：`See it -> Read it -> Need it -> Say it -> Handle it -> Scene Wrap`
