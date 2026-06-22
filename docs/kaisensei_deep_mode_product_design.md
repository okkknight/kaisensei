# kaisensei Deep Mode 产品设计方案 v3

## 1. 模式定位

Deep Mode 是独立于 Quick Mode 的深度课程模式。

Quick Mode 解决：

> 拍一张照片，快速生成一组短练习。

Deep Mode 解决：

> 基于一张真实照片，生成一套围绕真实场景的文字版口语训练，让用户逐步学会观察、理解、互动，并最终完成一段完整场景对话。

Deep Mode 前期只支持文字交互，不做语音输入，但所有内容都按真实口语表达设计。

Deep Mode 与 Quick Mode 的课程结构、生成协议、页面流程和数据结构完全分离。二者只共享拍照、上传和图片输入能力；英文 TTS 播放和题目朗读保留，但由 Deep Mode 自己实现，不作为跨模式共享边界。

---

## 2. 用户端四个阶段

用户端统一使用以下模块名称：

```text
Notice → Interpret → Interact → Step In
```

对应含义：

| 模块 | 中文理解 | 训练目标 |
|---|---|---|
| Notice | 观察 | 描述照片中真实可见的内容 |
| Interpret | 理解 | 推测正在发生什么、人物状态、氛围和原因 |
| Interact | 互动 | 表达需求，并自然接住对方回应 |
| Step In | 进入场景 | 综合前面内容，完成一段完整真实对话 |

内部协议可以继续使用稳定字段：

```text
notice
interpret
interact
step_in
```

---

## 3. 总体用户流程

```text
拍照或上传
↓
选择 Deep Mode
↓
生成课程
↓
课程纵览页
↓
Notice
↓
Notice 里程碑
↓
Interpret
↓
Interpret 里程碑
↓
Interact
↓
Interact 里程碑
↓
Step In
↓
课程完成
```

生成课程后不能切换到 Quick Mode。用户返回拍照页后，才可以重新选择模式。

---

## 4. 课程纵览页

### 4.1 页面目标

只做一件事：

> 让用户快速理解这张照片被识别成了什么场景，并点击进入课程。

不展示模块列表，不展示复杂进度，不展示 Quick / Deep 切换。

### 4.2 页面结构

页面顶部：

- 返回按钮
- 页面标题或品牌名
- 不显示模式切换

页面中间只展示一个可点击的引导卡片。

引导卡片分上下两部分。

#### 上半部分

- 展示用户拍摄照片
- 使用照片原图裁切
- 图片为卡片主视觉

#### 下半部分

固定三行：

第一行：照片关键词，英文显示。

```text
coffee · table · laptop
```

要求：

- 由 AI 识别照片中的客观内容
- 默认 3 个关键词
- 使用高频、具体、可见的名词
- 不要加入推测内容

第二行：场景描述，中文显示，来自后端返回值。

```text
咖啡厅里悠闲的下午茶时间
```

要求：

- 由后端返回场景描述文本，前端直接渲染
- 如果生成侧需要补充这行文案，应遵循合理、保守的情境推测
- 可以包含地点、活动或氛围
- 不要编造具体人物关系或无法判断的事实
- 只输出一句简短描述

第三行：固定引导语。

```text
点击开始这次学习之旅
```

### 4.3 交互

点击整张引导卡片：

- 当前纵览页保持在左侧
- Notice 页面从右侧快速滑入
- 进入沉浸式学习流程
- 后续模块之间都使用横向滑入过渡，不返回纵览页

---

## 5. 学习页通用布局

Notice、Interpret、Interact、Step In 使用统一页面骨架。

### 5.1 顶部区域

左侧：

- 返回按钮
- 返回时弹出确认，避免误退出当前课程

中间：

- 四段主进度条
- 对应 Notice、Interpret、Interact、Step In
- 当前模块高亮
- 已完成模块使用完成色
- 未开始模块使用弱色

右侧：

- 用户照片的正方形缩略图
- 点击可放大查看原图
- 关闭后回到当前练习，不改变进度

### 5.2 模块内次级进度

在主进度条下方显示模块内部进度，例如：

```text
Notice · 4 / 14
```

模块内部进度按实际题目数量计算，不固定写死。

### 5.3 中间内容区

主要展示当前内容卡片、问题、候选词块和用户已选择内容。

每个页面只聚焦一个任务，不同时展示多组题目。

### 5.4 底部操作区

固定在页面底部：

- 清空或重置
- 提示
- 验证

验证按钮只有在用户完成必要选择后才可用。

---

# 6. Notice 模块

## 6.1 训练目标

训练观察型表达：

> 用户学习如何描述照片中真实可见的内容。

表达内容必须客观，不加入推测。

可覆盖：

- 物品
- 人物
- 动作
- 位置
- 空间关系
- 环境细节

## 6.2 内容结构

Notice 由以下部分组成：

```text
每个例句依次完成：
Understand
↓
Focus
↓
Build
↓
Quick Response
↓
下一个例句
```

每个核心表达对应：

- 1 条基础例句
- 若干条变式例句
- 每条例句都经过同一组四步练习
- Quick Response 跟随每个例句单独出现，不在整个 Expression Pack 末尾统一汇总

默认：

- 2 个核心表达
- 每个核心表达 1 条基础例句
- 每个核心表达 1 条变式例句
- 每个例句 1 道 Quick Response

数量必须可配置。

---

## 6.3 核心表达要求

每个核心表达必须：

- 从照片真实内容中发展出来
- 是自然、高频的口语表达
- 适合描述眼前场景
- 不能只是孤立单词
- 可以是词组、固定搭配或句型

示例：

```text
next to
on the table
I notice...
There is...
be sitting by...
```

---

## 6.4 基础例句要求

基础例句必须：

- 直接描述照片中的客观事实
- 每句聚焦一个核心表达
- 不重复描述同一个角度
- 可以分别描述位置、人物、物品或动作
- 句子短而自然

示例：

```text
A laptop is sitting next to the coffee.
There is a notebook on the table.
Someone is sitting by the window.
```

---

## 6.5 每条例句的三步练习

每条基础例句和变式例句都依次经过：

```text
Understand → Focus → Build
```

用户端中文可以显示为：

```text
看懂 → 补全 → 拼句
```

### A. Understand

目标：

> 先理解英文例句的自然中文含义。

页面内容：

- 上方内容卡片展示英文例句
- 当前核心表达使用强调色
- 下方展示若干自然分词的中文词块
- 可加入 1 个无用中文干扰词块

用户操作：

- 点击中文词块
- 按顺序组成自然中文句子
- 点击验证

验证成功：

- 弹出轻量成功反馈
- 自动进入下一页

验证失败：

- 保留当前选择
- 标记错误位置或提示重新调整
- 不直接显示完整答案

### B. Focus

目标：

> 在完整英文句子中识别并补全核心表达。

页面内容：

- 展示当前英文例句
- 设置 2 至 3 个空格
- 空格必须覆盖当前核心表达
- 下方展示英文候选词
- 可加入 1 个干扰词

用户操作：

- 点击候选词填入空格
- 点击验证

### C. Build

目标：

> 根据中文意思，重新拼出完整英文句子。

页面内容：

- 上方展示一句中文含义
- 中间为用户答案区域
- 下方展示自然切分的英文词块
- 可加入 1 个英文干扰词块

用户操作：

- 依次点击词块组成英文句子
- 可点击已选词块撤回
- 点击验证

切分原则：

- 按自然词组和固定搭配切分
- 核心表达尽量保持为一个词块
- 不按单词机械切碎
- 不与 Understand 的中文切分强行一一对应

---

## 6.6 变式例句

基础例句完成后，进入同一核心表达的变式例句。

变式例句要求：

- 保留同一个核心表达
- 更换句子结构或表达角度
- 仍围绕当前照片场景
- 可以做轻度合理发散
- 不得跳到无关主题

每条变式例句仍完整经过：

```text
Understand → Focus → Build
```

示例：

基础例句：

```text
A laptop is sitting next to the coffee.
```

变式例句：

```text
The notebook is next to a small plate.
```

---

## 6.7 Quick Response

Quick Response 跟随每个例句结束后立即出现。

Quick Response 不是对话流，而是单轮问答。

页面结构：

- 上方显示一个与照片相关的问题
- 中间为用户答案区
- 下方为英文词组候选区
- 可加入 1 个干扰词组
- 用户通过词组重排生成答案

要求：

- 每道题对应一个核心表达
- 问题必须自然
- 答案必须复用对应核心表达
- 不要求用户自由输入
- 每题单独验证
- 完成后自动进入下一题

示例：

```text
Question:
Where is the laptop?

Answer:
It is next to the coffee.
```

---

## 6.8 Notice 里程碑页

Notice 全部完成后，显示里程碑页。

内容：

- 模块名：Notice
- 完成提示
- 本模块学到的核心表达
- 一句能力总结

示例：

```text
You can now describe what you see.
```

主按钮：

```text
Continue to Interpret
```

点击后进入 Interpret。

---

# 7. Interpret 模块

## 7.1 训练目标

训练推测型表达：

> 用户根据照片推测正在发生什么、人物状态、场景氛围或可能原因。

## 7.2 流程

Interpret 与 Notice 完全复用同一套页面和练习交互：

```text
基础例句
→ Understand
→ Focus
→ Build
→ 变式例句
→ Quick Response
→ 里程碑
```

区别只在课程生成规则。

## 7.3 内容生成要求

Interpret 的核心表达可以围绕：

```text
It looks like...
It seems like...
Maybe...
They might be...
This place feels...
Someone may be...
```

基础例句要求：

- 必须是合理推测，不是虚构事实
- 推测要能够从照片线索中得到支持
- 可以描述行为、状态、氛围或原因
- 避免绝对断言
- 使用自然的模糊表达

示例：

```text
It looks like someone is taking a short break.
The café seems quiet and relaxed.
They might be working on something.
```

变式例句继续围绕照片场景做轻度发散。

Quick Response 问题可包括：

```text
What might be happening here?
How does this place feel?
Why might someone choose this seat?
```

---

# 8. Interact 模块

## 8.1 训练目标

训练任务型互动：

> 用户在真实场景中表达需求，并在对方回复后自然回应。

Interact 合并原来的 Need、Say 和 Handle。

## 8.2 Task Pack

Interact 不按普通表达列表组织，而是按 Task Pack 组织。

每个 Task Pack 包含：

```text
一个真实任务
一个 Need 核心表达
一个 Handle 核心表达
Need 例句与变式
Handle 例句与变式
Dialogue Practice
```

默认：

- 2 个 Task Pack
- 每个 Task Pack 1 个 Need 核心表达
- 每个 Task Pack 1 个 Handle 核心表达
- Need 和 Handle 各 1 条基础例句
- Need 和 Handle 各 1 条变式例句
- 每个 Task Pack 1 轮 Dialogue Practice

数量必须可配置。

---

## 8.3 Task Pack 示例

```text
Task:
Ask to use a power outlet.

Need:
Could I use this outlet?

Handle:
Sure, thank you.
```

另一个 Task Pack 可以是：

```text
Task:
Ask whether a seat is free.

Need:
Is this seat taken?

Handle:
No worries, thanks anyway.
```

---

## 8.4 Need 与 Handle 的例句训练

Need 和 Handle 的基础例句与变式例句，仍复用 Notice / Interpret 的三步交互：

```text
Understand → Focus → Build
```

要求：

### Need

- 必须表达清晰具体的真实需求
- 与照片场景高度相关
- 适合用户主动开口
- 优先使用礼貌、自然、高频表达

### Handle

- 必须对应对方可能给出的真实回应
- 可以是接受、拒绝或条件式回应
- 用户回复要自然、简短、礼貌
- 不能脱离 Need 单独生成

---

## 8.5 Dialogue Practice

Interact 的 Dialogue Practice 使用同页面连续对话流。

页面开始时显示：

- 场景说明
- 当前任务
- 必要时显示对方身份

示例：

```text
You need to charge your laptop.
Ask the person next to you if you can use the outlet.
```

### 第一步：Need

页面底部出现 Need 候选词组。

用户完成词组重排并验证后：

- 正确句子作为用户消息气泡加入对话流
- 候选区收起
- 系统在同一页面生成一个不暴露 Handle 目标表达的桥接回复气泡

### 第二步：Handle

系统回复出现后：

- 页面底部出现 Handle 候选词组
- 用户重排并验证
- 正确句子作为用户第二条消息气泡加入对话流

完成后：

- 显示本轮任务完成状态
- 进入下一个 Task Pack 或里程碑页

要求：

- Need 和 Handle 必须属于同一个 Task Pack
- 对方回复必须与 Need 自然对应，但不能直接说出当前练习的 Handle 目标表达
- 对话保持短小，不追加额外轮次
- 一轮 Dialogue Practice 固定为：用户 Need → 系统回复 → 用户 Handle

---

## 8.6 Interact 里程碑页

内容：

- 模块名：Interact
- 已完成的真实任务
- 学到的 Need 表达
- 学到的 Handle 表达
- 一句能力总结

示例：

```text
You can now ask for what you need and respond naturally.
```

主按钮：

```text
Continue to Step In
```

---

# 9. Step In 模块

## 9.1 训练目标

Step In 是最终挑战。

> 用户综合使用 Notice、Interpret、Interact 中学到的表达，完成一段同一场景里的连续真实对话。

## 9.2 内容抽取规则

系统从已完成课程中抽取：

- 1 个 Notice 核心表达
- 1 个 Interpret 核心表达
- 1 个 Need 核心表达
- 1 个 Handle 核心表达

组合成一个完整互动任务。

不能重新引入新的核心表达。

## 9.3 页面形式

Step In 完全使用 Dialogue Practice 对话流界面。

区别是对话更完整，而且系统始终扮演同一个场景角色，持续接话，而不是像老师一样逐题提问。

推荐流程：

```text
系统以场景角色开场
↓
用户用 Notice 表达描述眼前情况
↓
系统继续接话或自然回应
↓
用户用 Interpret 表达做出判断
↓
系统继续推进同一场景
↓
用户用 Need 表达提出需求
↓
系统用角色语气回复
↓
用户用 Handle 表达自然接话
```

所有用户输入仍使用词组重排，不做自由输入。

每一步：

- 下方展示候选词组
- 可加入一个干扰词组
- 用户重排
- 验证后作为消息气泡加入对话
- 系统继续下一条消息

## 9.4 完成反馈

完成 Step In 后，显示课程完成页。

内容：

- 用户照片
- 完成提示
- 四个阶段的核心表达摘要
- 用户最终完成的完整对话
- 再次练习按钮
- 返回拍照页按钮

---

# 10. 练习反馈规则

## 10.1 正确

- 使用轻量成功动画
- 不打断学习节奏
- 短暂停留后自动进入下一页或下一状态
- 不弹出大面积模态框

## 10.2 错误

第一次错误：

- 不直接展示答案
- 提示用户调整顺序或重新选择
- 可高亮明显错误的词块

第二次错误：

- 提供局部提示
- 例如固定第一个词块、减少干扰项或高亮核心表达

继续错误：

- 允许显示正确答案
- 用户确认后进入下一题
- 该题记录为需要复习

## 10.3 Hint

Hint 的作用：

- 提示当前核心表达
- 提示首个词块
- 暂时移除干扰词块

Hint 不直接一次性展示完整答案。

---

# 11. 双层进度设计

## 11.1 主进度

顶部固定四段：

```text
Notice | Interpret | Interact | Step In
```

视觉规则：

- 已完成：完成色
- 当前：高亮色
- 未开始：弱色
- 不显示百分比

## 11.2 模块内进度

显示当前模块题目完成度：

```text
6 / 14
```

计算范围包括：

- Understand
- Focus
- Build
- Quick Response 或 Dialogue Practice

里程碑页不计入题目数。

---

# 12. 课程生成协议

## 12.1 输入结构

```json
{
  "mode": "deep",
  "level": "normal",
  "imageContext": "<image or image description>",
  "config": {
    "notice": {
      "coreExpressionCount": 3,
      "variationsPerExpression": 0,
      "quickResponsePerExample": 1
    },
    "interpret": {
      "coreExpressionCount": 3,
      "variationsPerExpression": 0,
      "quickResponsePerExample": 1
    },
    "interact": {
      "taskPackCount": 2,
      "variationsPerNeedExpression": 0,
      "variationsPerHandleExpression": 0,
      "dialoguesPerTaskPack": 1
    },
    "stepIn": {
      "noticeExpressionCount": 1,
      "interpretExpressionCount": 1,
      "needExpressionCount": 1,
      "handleExpressionCount": 1
    },
    "exercise": {
      "understandDistractorCount": 1,
      "focusBlankCount": 2,
      "focusDistractorCount": 1,
      "buildDistractorCount": 1,
      "dialogueDistractorCount": 1
    },
    "difficulty": {
      "vocabularyLevel": "daily",
      "expressionStyle": "natural",
      "sentenceLength": "short",
      "supportChinese": true
    }
  }
}
```

生成入口建议保持 mode-driven 的统一 job 入口，由同一套 job 系统按 `mode` 分流到不同课程 schema。Deep Mode 只是一条独立 schema，不要再拆出另一套平行入口。

---

## 12.2 难度规则

Normal：

- 高频日常词汇
- 短句
- 表达直接
- 词块较大
- 干扰项明显
- 场景推测保守

Advanced：

- 词汇和搭配更丰富
- 表达更自然、更接近母语口语
- 句子略长
- 词块切分更细
- 干扰项更接近正确答案
- 推测角度可以更复杂，但仍必须合理

Advanced 不能变成考试英语、长难句或语法讲解课。

---

# 13. 标准课程 JSON

```json
{
  "mode": "deep",
  "level": "normal",
  "overview": {
    "keywords": ["coffee", "table", "laptop"],
    "sceneDescriptionChinese": "咖啡厅里悠闲的下午茶时间",
    "startPromptChinese": "点击开始这次学习之旅"
  },
  "modules": {
    "notice": {
      "title": "Notice",
      "goal": "Describe what is visible in the photo.",
      "expressionPacks": []
    },
    "interpret": {
      "title": "Interpret",
      "goal": "Infer what may be happening in the scene.",
      "expressionPacks": []
    },
    "interact": {
      "title": "Interact",
      "goal": "Express a need and respond naturally.",
      "taskPacks": []
    },
    "stepIn": {
      "title": "Step In",
      "goal": "Complete one full scene conversation.",
      "dialogue": {}
    }
  }
}
```

---

# 14. Notice / Interpret 的 Expression Pack

说明：

- `meaningChinese` 表示表达释义，不是页面任务说明
- `baseExample.chinese` 表示目标句中文
- `build.promptChinese` 表示固定任务说明文案
- `variations[*].chinese` 同样表示目标句中文
- 页面实现时不要把这几类中文字段混用

```json
{
  "id": "notice_expression_1",
  "coreExpression": "next to",
  "meaningChinese": "在……旁边",
  "baseExample": {
    "english": "A laptop is sitting next to the coffee.",
    "chinese": "一台笔记本电脑放在咖啡旁边。",
    "understand": {
      "chunks": ["一台笔记本电脑", "放在", "咖啡旁边"],
      "distractors": ["窗户外面"]
    },
    "focus": {
      "sentenceWithBlanks": "A laptop is sitting ___ ___ the coffee.",
      "choices": ["next", "to", "under"],
      "answer": ["next", "to"]
    },
    "build": {
      "promptChinese": "一台笔记本电脑放在咖啡旁边。",
      "chunks": ["A laptop", "is sitting", "next to", "the coffee"],
      "distractors": ["by working"],
      "answer": ["A laptop", "is sitting", "next to", "the coffee"]
    }
  },
  "variations": [
    {
      "english": "The notebook is next to a small plate.",
      "chinese": "笔记本在一个小盘子旁边。",
      "understand": {},
      "focus": {},
      "build": {},
      "quickResponse": {}
    }
  ]
}
```

Notice 和 Interpret 共用同一结构，只通过生成规则区分内容。

---

# 15. Interact 的 Task Pack

说明：

- `need.meaningChinese` 和 `handle.meaningChinese` 都表示表达释义
- `scenePrompt` 表示当前任务场景说明，不是目标句中文
- `dialogues[*].scene` 表示对话场景说明
- `dialogues[*].need.chunks` / `handle.chunks` 承载的是练习用词块，不是页面任务说明
- 页面里如果出现中文提示文案，应按固定任务说明理解，不要和字段释义混淆

```json
{
  "id": "task_pack_1",
  "taskTitle": "Ask to use a power outlet",
  "scenePrompt": "You need to charge your laptop.",
  "need": {
    "coreExpression": "Could I use this outlet?",
    "meaningChinese": "我可以用这个插座吗？",
    "baseExample": {},
    "variations": []
  },
  "handle": {
    "coreExpression": "Sure, thank you.",
    "meaningChinese": "好的，谢谢你。",
    "baseExample": {},
    "variations": []
  },
  "dialogues": [
    {
      "scene": "You need to charge your laptop.",
      "need": {
        "chunks": ["Could I", "use", "this outlet"],
        "distractors": ["It looks like"],
        "answer": ["Could I", "use", "this outlet"]
      },
      "systemReply": "No problem, take your time.",
      "handle": {
        "chunks": ["Sure", "go ahead"],
        "distractors": ["next to"],
        "answer": ["Sure", "go ahead"]
      }
    }
  ]
}
```

---

# 16. Step In 对话结构

```json
{
  "scene": "You are sitting at a desk with your laptop, and a coworker is nearby.",
  "turns": [
    {
      "speaker": "system",
      "text": "Looks like a long afternoon."
    },
    {
      "speaker": "user",
      "sourceModule": "notice",
      "chunks": [],
      "distractors": [],
      "answer": []
    },
    {
      "speaker": "system",
      "text": "Yeah, it feels pretty calm here."
    },
    {
      "speaker": "user",
      "sourceModule": "interpret",
      "chunks": [],
      "distractors": [],
      "answer": []
    },
    {
      "speaker": "system",
      "text": "I could use a quick break."
    },
    {
      "speaker": "user",
      "sourceModule": "interact_need",
      "chunks": [],
      "distractors": [],
      "answer": []
    },
    {
      "speaker": "system",
      "text": "Sure, go ahead."
    },
    {
      "speaker": "user",
      "sourceModule": "interact_handle",
      "chunks": [],
      "distractors": [],
      "answer": []
    }
  ]
}
```

---

# 17. 生成约束

AI 必须遵守：

- 所有内容必须围绕用户真实照片
- Notice 只能描述客观可见内容
- Interpret 只能做有照片依据的合理推测
- Interact 必须生成现实中可能发生的任务
- Step In 只能复用前面已学核心表达
- 不生成通用主题课
- 不列出大量孤立单词
- 不写长篇语法解释
- 不使用幼稚表达
- 不使用考试式长难句
- 每条基础例句只突出一个核心表达
- 变式例句必须保留同一核心表达
- 所有词块必须自然切分
- 干扰项必须语法或语义上具有一定迷惑性，但不能恶意刁难
- 中文只辅助理解
- 用户端所有输出任务前期只使用点击、选择和词组重排
- 不生成语音输入任务
- 不生成自由文本输入任务

---

# 18. 数据校验规则

课程数据至少满足：

- `mode` 必须为 `deep`
- 必须包含 `overview`
- 必须包含四个模块
- 模块顺序固定为 Notice、Interpret、Interact、Step In
- Notice 和 Interpret 必须包含 Expression Pack
- 每个 Expression Pack 必须包含核心表达、基础例句、变式，且每个基础例句和变式都必须各自包含 Quick Response
- 每条基础例句和变式必须包含 Understand、Focus、Build
- Interact 必须包含 Task Pack
- 每个 Task Pack 必须同时包含 Need 和 Handle
- 每个 Task Pack 必须包含 Dialogue Practice
- Step In 必须抽取并复用四类已学表达
- 题目数量必须符合 config
- 所有 answer 必须能由 chunks 组成
- distractors 不能出现在正确答案中
- 中文词块顺序必须能组成自然中文
- Notice / Interpret 的 Quick Response 必须跟随每个例句单独出现，而不是 pack 末尾统一汇总
- 英文词块顺序必须能组成自然英文
- 核心表达必须真实出现在对应例句中

结构缺少关键字段时，不应让前端猜测，应重新生成或拒绝该课程数据。

---


# 19. AI 课程生成 Prompt

课程生成协议由四部分共同组成：

```text
角色与目标
+ 输入参数
+ 内容生成规则
+ JSON 输出与自检要求
```

JSON Schema 只约束数据形状，Prompt 负责约束 AI 应该如何理解照片、选择内容和组织课程。两者缺一不可。

## 19.1 System Prompt

以下内容作为 Deep Mode 课程生成器的固定系统提示词：

```text
You are the Deep Mode course generator for kaisensei.

Your job is to turn one real user photo into a structured, text-based spoken-English course.

The learner must progress through four stages:

1. Notice:
Learn to describe what is objectively visible in the photo.

2. Interpret:
Learn to make cautious, reasonable inferences about what may be happening, how people may feel, what the atmosphere is like, or why the situation may exist.

3. Interact:
Learn to express a realistic need in this exact scene and respond naturally to another person's reply.

4. Step In:
Reuse expressions already learned in Notice, Interpret, and Interact to complete one coherent scene conversation.

This is not:
- a generic image description,
- a vocabulary list,
- a grammar lesson,
- a test-prep exercise,
- a chatbot conversation,
- or a generic topic lesson loosely inspired by the photo.

All English must be:
- natural,
- practical,
- high-frequency,
- suitable for spoken interaction,
- appropriate for the configured difficulty,
- and strongly grounded in the user's real photo.

The product currently supports text interaction only.
Do not generate voice tasks or open-ended free-text tasks.

Return only valid JSON matching the required schema.
Do not include markdown, explanations, comments, or any text outside the JSON.
```

## 19.2 Runtime Generation Prompt

每次生成课程时，将照片、等级和配置参数注入以下模板。

```text
Generate one complete kaisensei Deep Mode course from the attached image.

USER LEVEL:
{{level}}

COURSE CONFIG:
{{config_json}}

LANGUAGE SUPPORT:
- English is the learning language.
- Chinese is used only for concise meaning support and task prompts.
- Do not translate mechanically. Chinese must be natural.

GLOBAL COURSE RULES:

1. Ground the entire course in the attached photo.
2. First identify objective visible facts.
3. Separate objective facts from reasonable inferences.
4. Choose useful spoken expressions rather than isolated object names.
5. Follow every configured count exactly.
6. Keep one clear core expression per Expression Pack.
7. Every base example and variation must visibly contain its core expression.
8. Every base example and variation must include:
   - Understand,
   - Focus,
   - Build.
9. Every provided answer must be constructible from its chunks.
10. Distractors must not appear in the correct answer.
11. Step In must reuse learned expressions and must not introduce new core expressions.

OVERVIEW:

Generate:
- exactly {{overviewKeywordCount}} objective English keywords,
- one short Chinese scene description,
- the fixed Chinese start prompt provided by the product.

The keywords must name concrete visible content only.
The scene description may make one cautious, reasonable inference about location, activity, or atmosphere.

NOTICE:

Generate exactly {{notice.coreExpressionCount}} Expression Packs.

Each Notice core expression must help the learner describe objective visible content such as:
- objects,
- people,
- visible actions,
- positions,
- spatial relationships,
- or environmental details.

Do not include motives, emotions, relationships, or hidden events.

For each Expression Pack:
- generate one base example,
- generate exactly {{notice.variationsPerExpression}} variations,
- attach one Quick Response to the base example and one to each variation.

The base example and variations must describe different visible aspects where possible.
Do not make all examples describe the same object or repeat the same sentence structure.

INTERPRET:

Generate exactly {{interpret.coreExpressionCount}} Expression Packs.

Each Interpret core expression must help the learner make a cautious inference supported by the photo.

Suitable functions include:
- what may be happening,
- a possible activity,
- a likely state,
- the atmosphere,
- or a possible reason.

Prefer language such as:
- It looks like...
- It seems like...
- They might be...
- Someone may be...
- This place feels...

Do not present inferences as confirmed facts.

For each Expression Pack:
- generate one base example,
- generate exactly {{interpret.variationsPerExpression}} variations,
- attach one Quick Response to the base example and one to each variation.

INTERACT:

Generate exactly {{interact.taskPackCount}} Task Packs.

Each Task Pack must describe one realistic action the learner may need to perform in this exact scene.

Each Task Pack must contain:
- one Need core expression,
- one Handle core expression,
- one Need base example,
- exactly {{interact.variationsPerNeedExpression}} Need variations,
- one Handle base example,
- exactly {{interact.variationsPerHandleExpression}} Handle variations,
- exactly {{interact.dialoguesPerTaskPack}} Dialogue Practices.

The Need expression must:
- express a clear, realistic request, question, or need,
- be polite and natural,
- and be directly relevant to the photo scene.

The Handle expression must:
- naturally respond to the system reply,
- be short and conversational,
- and remain paired with the same task.

Each Dialogue Practice must follow this exact pattern:
1. scene and task are introduced,
2. learner builds the Need line,
3. system gives one realistic reply,
4. learner builds the Handle line.

Do not add extra dialogue turns.

STEP IN:

Create one final conversation using:
- exactly {{stepIn.noticeExpressionCount}} learned Notice expression,
- exactly {{stepIn.interpretExpressionCount}} learned Interpret expression,
- exactly {{stepIn.needExpressionCount}} learned Need expression,
- exactly {{stepIn.handleExpressionCount}} learned Handle expression.

The final conversation must form one coherent situation and feel like one continuous role-play in the same scene.
The system must keep the same in-scene voice throughout, not switch into teacher or quiz-master mode.
It must follow this learning arc:
1. notice the scene,
2. interpret the situation,
3. express a need,
4. respond naturally.

Every learner turn must use chunks and distractors.
Do not introduce a new core expression, task, location, or unrelated scenario.

EXERCISE GENERATION:

Understand:
- show the English sentence,
- split the natural Chinese meaning into reorderable chunks,
- add exactly {{exercise.understandDistractorCount}} distractors.

Focus:
- blank out the core expression using exactly {{exercise.focusBlankCount}} blanks where linguistically possible,
- provide the necessary answer choices,
- add exactly {{exercise.focusDistractorCount}} distractors.

Build:
- provide a natural Chinese prompt,
- split the English answer into natural spoken chunks,
- keep fixed expressions together where possible,
- add exactly {{exercise.buildDistractorCount}} distractors.

Quick Response and Dialogue Practice:
- split answers into natural English chunks,
- add exactly {{exercise.dialogueDistractorCount}} distractors.

DIFFICULTY:

Use the supplied difficulty configuration.

For normal:
- use common daily vocabulary,
- short sentences,
- larger chunks,
- clear distractors,
- and conservative inferences.

For advanced:
- use richer collocations,
- more natural spoken phrasing,
- moderately longer sentences,
- finer chunking,
- and more plausible distractors.

Advanced must not become academic, literary, test-oriented, or grammar-heavy.

OUTPUT:

Return one valid JSON object matching the Deep Mode course schema.
Return JSON only.
```

## 19.3 Prompt 输入变量

生成服务必须向 Prompt 提供以下信息：

```json
{
  "image": "<actual image input>",
  "level": "normal",
  "config": {},
  "fixedCopy": {
    "startPromptChinese": "点击开始这次学习之旅"
  }
}
```

要求：

- 照片必须作为真实多模态输入传给支持识图的模型
- 如果底层模型不能直接识图，必须先得到结构化图片事实，再生成课程
- 不允许只使用文件名、用户随手描述或占位文本代替照片内容
- 固定 UI 文案由产品提供，不应让模型自由改写

## 19.4 生成前的照片理解边界

这一部分不是一次独立的 LLM 调用。

它是同一次课程生成 Prompt 中的内容约束，用来告诉模型在生成课程时，必须先在内部区分三类信息：

```text
Visible facts
Reasonable inferences
Possible interactions
```

例如咖啡桌照片：

```text
Visible facts:
coffee, table, laptop, notebook

Reasonable inferences:
possibly in a café
possibly working or taking a break
quiet or relaxed atmosphere

Possible interactions:
ask whether a seat is free
ask to use an outlet
ask for the Wi-Fi password
```

使用边界：

- Notice 只能使用 Visible facts
- Interpret 可以使用 Reasonable inferences
- Interact 可以使用 Possible interactions
- Step In 只能复用前面已经生成并学习过的表达

规则：

- 不需要先让模型单独返回一份照片分析结果
- 不需要为照片理解单独调用一次 LLM
- 模型在同一次生成课程时，按照以上边界组织内容即可
- 如果某个互动在照片场景中缺乏合理依据，不得生成
- 不要猜测人物姓名、职业、关系、具体地点名称或私人背景

默认不把以下中间分析字段返回给前端：

```json
{
  "visibleFacts": [],
  "reasonableInferences": [],
  "possibleInteractions": []
}
```

这些字段仅在未来需要调试生成质量时考虑加入，MVP 不要求返回。

## 19.5 LLM 输出前检查清单

输出前检查清单属于同一次 LLM 调用中的 Prompt 约束，不代表一次独立自检调用。

模型在返回最终 JSON 前，应检查：

```text
Before returning the JSON, verify all of the following:

STRUCTURE
- overview exists,
- all four modules exist,
- all configured counts are satisfied,
- all required IDs are unique,
- arrays are in the required learning order.

GROUNDING
- Notice contains objective visible content only,
- Interpret uses cautious inference language,
- Interact tasks are realistic for the photo,
- Step In stays in the same scene.

CORE EXPRESSIONS
- every core expression appears verbatim in its base example,
- every variation preserves the same core expression,
- every example-level Quick Response reuses the assigned core expression,
- Step In only reuses previously learned expressions.

EXERCISES
- every answer can be built exactly from answer chunks,
- distractors are not required by the answer,
- Chinese chunks form one natural Chinese meaning,
- English chunks form one natural spoken sentence,
- Focus blanks cover the intended core expression,
- no free-text or voice task exists.

QUALITY
- no generic vocabulary list,
- no long grammar explanation,
- no duplicated examples with trivial word replacement,
- no unsupported personal or situational claims,
- no content outside the JSON.
```

这层检查的作用是减少明显错误，但不能作为最终可信校验。

## 19.6 系统确定性校验

最终有效性由后端 validator / normalizer 负责。

系统校验不调用 LLM，而是使用确定性规则检查：

- JSON 是否可解析
- 四个模块是否存在
- 模块顺序是否正确
- 各模块数量是否符合 config
- 所有 ID 是否唯一
- answerChunkIds 是否全部存在
- distractor 是否误入正确答案
- 核心表达是否真实出现在对应例句中
- 变式例句是否保留同一个核心表达
- Step In 是否只复用已学表达
- 所有题目是否属于允许的输入类型
- 是否出现自由文本或语音任务
- 是否存在前端无法直接消费的缺失字段

确定性校验通过后，课程才可以保存并交给前端播放。

## 19.7 推荐生成流程

MVP 默认采用一次 LLM 调用生成整套 Deep Mode 课程。

```text
原始照片
+ level
+ config
+ System Prompt
+ Runtime Generation Prompt
+ JSON Schema
+ LLM 输出前检查清单
↓
一次生成完整 Deep Course JSON
↓
系统 validator / normalizer 校验
↓
通过：保存并展示课程
失败：带错误原因重新生成
```

不采用固定三次调用：

```text
单独识图
→ 单独生成课程
→ 单独调用 LLM 自检
```

也不默认按模块拆成四次生成。

选择一次生成完整课程的原因：

- Notice、Interpret、Interact 和 Step In 之间关联强
- Step In 必须复用前面模块的表达
- 一次生成更容易保持场景、语气和任务一致
- 调用次数更少，等待时间和成本更低
- MVP 实现和失败恢复更简单

默认配置下的课程规模可以由一次调用完成。

同一套 job 系统可以服务 Quick Mode 和 Deep Mode，但必须通过 `mode` 做 schema 分流，不能把两种输出揉成一个通用 JSON 结构。

## 19.8 失败重试

如果系统校验失败，不把错误数据交给前端。

系统应把校验错误附加到下一次生成请求中，例如：

```text
The previous output failed validation for the following reasons:

- notice.expressionPacks[0].baseExample.build answer cannot be formed from chunks
- stepIn uses an expression that was not taught earlier
- interact.taskPacks count does not match config

Generate the complete course again and correct these problems.
Return the full valid JSON only.
```

MVP 可以直接重新生成整套课程，不需要实现局部修复。

推荐规则：

- 首次生成失败：自动重试一次
- 重试时保留相同照片、level 和 config
- 将确定性校验错误作为修正信息传给模型
- 再次失败：进入 generation_failed 状态
- 用户可以重新生成或返回拍照页

## 19.9 是否按模块生成

MVP 不采用一次生成一个模块。

按模块生成会增加：

- 多次模型调用
- 等待时间
- 上下文传递
- 中间状态管理
- 模块间内容漂移
- Step In 对前面模块的依赖处理

只有在后续出现以下问题时，再考虑拆分：

- 单次输出接近模型上限
- 整课生成稳定性持续不足
- 用户需要边生成边学习
- 局部重生成能显著降低成本

如果未来拆分，必须先生成一个统一的课程骨架，并把已生成模块的核心表达继续传给后续模块，确保 Step In 可以准确复用。

当前默认架构为：

```text
一次生成完整课程
+
一次系统确定性校验
+
失败时重试
```


# 20. 课程播放顺序与导航规则

课程数据必须能够直接决定页面顺序，前端不应自行猜测。

## 20.1 Notice / Interpret 播放顺序

每个 Expression Pack 按以下顺序播放：

```text
例句 1：
核心表达 1 Understand
核心表达 2 Understand
……
核心表达 n Understand
核心表达 1 Focus
核心表达 2 Focus
……
核心表达 n Focus

例句 2：
核心表达 1 Understand
核心表达 2 Understand
……
核心表达 n Understand
核心表达 1 Focus
核心表达 2 Focus
……
核心表达 n Focus

……

例句 n：
核心表达 1 Understand
核心表达 2 Understand
……
核心表达 n Understand
核心表达 1 Focus
核心表达 2 Focus
……
核心表达 n Focus

核心表达 1 Build
核心表达 2 Build
……
核心表达 n Build

核心表达 1 Quick Response
核心表达 2 Quick Response
……
核心表达 n Quick Response

下一例句或模块里程碑
```

其中：

- 先按例句序号横向对齐不同核心表达
- 每个例句先走 Understand，再走 Focus
- 所有例句的 Build 统一在后面一轮完成
- 每个例句的 Quick Response 紧跟 Build 之后完成
- 不再按单个核心表达把完整练习串到底

## 20.2 Interact 播放顺序

每个 Task Pack 按以下顺序播放：

```text
Task Pack 1：
Need 例句 1 Understand
Handle 例句 1 Understand
Need 例句 2 Understand
Handle 例句 2 Understand
……

Need 例句 1 Focus
Handle 例句 1 Focus
Need 例句 2 Focus
Handle 例句 2 Focus
……

Need 例句 1 Build
Handle 例句 1 Build
Need 例句 2 Build
Handle 例句 2 Build
……

该 Task Pack 的 Dialogue Practice

Task Pack 2：
重复同一结构

Interact 里程碑
```

## 20.3 Step In 播放顺序

Step In 固定使用同页对话流，按 turns 数组顺序逐条推进。

用户当前回合完成验证后，才显示下一条系统消息和下一组候选词块。

---

# 21. 课程状态与恢复

Deep Mode 课程较长，必须支持退出后恢复。

MVP 阶段只要求同设备同浏览器可恢复。先把恢复状态做成浏览器侧持久化，状态字段和后续服务端恢复保持一致，方便以后切到服务器托管而不改课程状态模型。

至少保存：

```json
{
  "lessonId": "deep_xxx",
  "currentModule": "notice",
  "currentItemId": "notice_expression_1_base_focus",
  "completedItemIds": [],
  "attemptsByItemId": {},
  "usedHintsByItemId": {},
  "completedModules": [],
  "isCompleted": false
}
```

产品规则：

- 返回拍照页前弹出退出确认
- 退出后课程数据和当前进度保留
- 再次打开该课程时从上次题目继续
- 已完成题目默认不要求重做
- 已完成模块可以回顾，但回顾不改变主进度
- 重新开始课程必须是显式操作，不能因刷新页面自动清空
- 后续如果做服务端恢复，优先复用同一组状态字段，而不是另造第二套恢复模型

---

# 22. 答案判定与题目状态

所有 V1 输入均为选择和词块重排，因此答案判定以结构化答案为准，不依赖 LLM 实时评分。

## 22.1 顺序题

正确条件：

- 用户选择的词块 ID 顺序与 answer 中的词块 ID 顺序一致
- 忽略最终展示文本中的大小写和标点差异
- 不允许遗漏或多选词块

## 22.2 Focus 填空

正确条件：

- 每个空位对应正确 choice ID
- 如果核心表达存在合理缩写形式，应在生成数据中显式提供 acceptedAnswers
- 前端不自行推断同义答案

## 22.3 数据字段

每道练习应提供稳定 ID：

```json
{
  "id": "notice_expression_1_base_build",
  "type": "build",
  "chunks": [
    {"id": "c1", "text": "A laptop"},
    {"id": "c2", "text": "is sitting"},
    {"id": "c3", "text": "next to"},
    {"id": "c4", "text": "the coffee"},
    {"id": "d1", "text": "looks like"}
  ],
  "answerChunkIds": ["c1", "c2", "c3", "c4"]
}
```

不要只依赖重复文本判断，因为候选区可能存在相同文本词块。

---

# 23. 生成失败与降级

## 23.1 结构错误

出现以下情况视为生成失败：

- JSON 无法解析
- 缺少关键模块
- 数量与 config 不一致
- answer 无法由 chunks 组成
- Step In 引入大量新表达
- Notice 明显包含无依据推测
- Interact 与照片场景无关

处理：

- 不把不完整数据交给前端
- 使用同一照片和 config 自动重新生成
- 重试仍失败时显示明确的生成失败状态
- 用户可重新生成或返回拍照页

## 23.2 照片信息不足

如果照片过暗、模糊、遮挡严重或没有足够可识别场景：

- 不要强行编造完整课程
- 返回可识别失败状态
- 提示用户重新拍摄或上传更清楚的照片

## 23.3 内容安全与隐私

- 不推断真实人物身份
- 不推断敏感个人属性
- 不在课程文案中描述可能使用户不适的私人信息
- 对照片中的文字、屏幕和文件内容，只在与学习场景必要相关时使用
- 不把私人文本直接复制进例句

---

# 24. 页面必要状态

每类学习页面至少处理：

```text
ready
selecting
ready_to_check
correct
incorrect
hinted
revealed
completed
```

课程级页面至少处理：

```text
generating
generation_failed
overview_ready
learning
paused
course_completed
```

交互规则：

- 正确反馈后自动前进，但必须给用户足够时间感知结果
- 动画期间禁止重复提交
- 页面切换后清空当前临时选择
- 已保存的完成状态不因页面动画或刷新丢失
- 图片放大、提示弹层和退出确认不改变题目状态


# 25. 最终产品定义

Deep Mode 不是把一张照片扩写成更多英语内容。

它的核心是：

> 把用户真实拍下的场景，转化为一套连续、低压力、可重复的场景口语训练。

用户最终经历：

```text
Notice：我能描述眼前所见
Interpret：我能理解和推测当前情境
Interact：我能表达需求并自然回应
Step In：我能真正进入这个场景完成互动
```
