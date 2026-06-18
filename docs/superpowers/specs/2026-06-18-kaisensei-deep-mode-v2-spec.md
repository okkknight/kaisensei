# Kaisensei Deep Mode V2 Spec

**目标：** 为 kaisensei 增加一套与 Quick Mode 并列的独立 Deep Mode，入口仍在现有相机页里，通过模式切换进入；课程系统、校验逻辑和 UI flow 独立实现，但共享与课程无关的通用壳能力。

---

## 1. 已确认的产品决策

- Deep Mode 是独立模式，不是 Quick Mode 的加长版
- Deep Mode 的入口在现有相机页里的模式切换
- 与具体课程实现无关的能力可以共享
- 课程生成、课程结构、校验逻辑、题型和课程 UI flow 必须独立
- V1 必须端到端完整，不做半成品交付
- 课程必须支持真实图片端到端生成
- 前期不做语音输入
- 英文 TTS 播放保留，题目朗读按钮保留
- `short_answer` 先只做 tolerant 文本匹配
- 对结构严重错误的输出先严格拒绝，不做轻量补全
- 后续是否做轻量补全，留到验收后再决定

---

## 2. 产品定位

Deep Mode 不是：

- 图片描述课
- 单词表
- 语法课
- 聊天机器人
- Quick Mode 加长版
- 通用英语主题课

Deep Mode 是：

> 基于真实照片生成的文字版场景口语训练。

它要让用户围绕一张照片，完成一段观察、推测、需求表达、主动开口、接话回应和场景收束的完整训练。

---

## 3. 入口与状态

### 3.1 入口

- 仍从现有相机页进入
- 相机页保留模式切换
- Quick Mode 和 Deep Mode 在同一外壳里切换
- 不新增独立首页

### 3.2 共享壳能力

可以共享的能力包括但不限于：

- 拍照入口
- 图片上传
- loading 外壳
- 基础按钮和反馈组件
- 基础 TTS 播放能力

必须独立的能力包括：

- 课程生成 prompt
- lesson schema
- normalizer
- module 结构
- 题型规则
- Deep Mode UI flow

### 3.3 Deep Mode 运行状态

Deep Mode 自身仍然经过这些外层状态：

1. Camera Mode
2. Loading Mode
3. Deep Lesson Mode

Deep Lesson Mode 内部不是 `See / Learn / Build / Use`，而是：

`See it -> Read it -> Need it -> Say it -> Handle it -> Scene Wrap`

---

## 4. Deep Mode 课程定义

Deep Mode 课程要基于真实照片，但核心不是“把照片说完”，而是“把场景练出来”。

### 4.1 六个模块

- `See it`：观察型表达
- `Read it`：推测型表达
- `Need it`：需求型表达
- `Say it`：主动开口
- `Handle it`：接话和回应
- `Scene Wrap`：综合挑战

### 4.2 题型范围

V1 支持四类文字题型：

- `fill_blank`
- `word_order`
- `multiple_choice`
- `short_answer`

其中：

- `short_answer` 只做 tolerant 文本匹配
- tolerant 规则至少要忽略大小写、标点和多余空格

### 4.3 内容原则

- 必须基于真实照片场景
- 不要把课程做成图片描述课
- 不要列出照片里的所有物体
- 不要变成单词表
- 不要变成长篇解释
- 不要设计语音输入
- 不要要求严格语法考试式回答
- 表达要自然、口语、高频、实用
- 中文只用于辅助理解，不要喧宾夺主

---

## 5. 标准输出结构

Deep Mode 的输出 schema 独立于 Quick Mode。

### 5.1 顶层结构

```json
{
  "mode": "deep",
  "level": "normal",
  "scene": {
    "title": "Working from a cafe",
    "summary": "A person is sitting at a cafe with a laptop and coffee.",
    "interactionGoal": "Talk about working or studying in a cafe."
  },
  "modules": [],
  "sceneWrap": {},
  "takeaways": []
}
```

### 5.2 模块结构

每个模块都要有：

```json
{
  "id": "read_it",
  "title": "Read it",
  "goal": "Guess what may be happening in the scene.",
  "corePack": []
}
```

### 5.3 Core Pack 结构

每个 core expression 至少包含：

- `expression`
- `meaningChinese`
- `usage`
- `variations`

每个 variation 至少包含：

- `sentence`
- `meaningChinese`
- `build`
- `try`

### 5.4 Scene Wrap 结构

Scene Wrap 必须：

- 存在
- 要求复用至少 3 个模块的表达
- 包含若干短任务
- 作为最终综合检验，而不是普通总结

---

## 6. 校验与失败策略

### 6.1 严格拒绝

以下情况要直接拒绝：

- `mode` 不是 `deep`
- 模块顺序不完整
- 模块缺失
- corePack 缺失
- variation 缺少必填字段
- `sceneWrap` 缺失
- 输出结构严重错误
- 题型不在允许列表里

### 6.2 轻量补全边界

当前阶段默认不做轻量补全。

如果输出只是轻微格式瑕疵，可以先保留为后续验收决策项，但不要在本轮产品定义里假设会自动修复。

---

## 7. 页面与交互边界

### 7.1 可以共享的交互外壳

- 相机按钮
- 上传按钮
- loading 动效壳
- TTS 播放按钮外观
- 通用错误页样式

### 7.2 不共享的交互

- Deep Mode 的模块页
- Deep Mode 的题型页
- Deep Mode 的反馈规则
- Deep Mode 的校验规则
- Deep Mode 的课程推进逻辑

### 7.3 播放策略

- 保留英文 TTS
- 保留题目朗读按钮
- 不做语音输入
- 不朗读中文

---

## 8. 验收标准

Deep Mode V2 的产品定义可以进入实现，前提是：

1. 入口仍在现有相机页里的模式切换中。
2. Quick Mode 与 Deep Mode 的课程系统互不干扰。
3. Deep Mode 支持真实图片端到端生成。
4. Deep Mode 课程完整覆盖 `See it -> Read it -> Need it -> Say it -> Handle it -> Scene Wrap`。
5. 题型范围固定为 `fill_blank`、`word_order`、`multiple_choice`、`short_answer`。
6. `short_answer` 先只做 tolerant 文本匹配。
7. 英文 TTS 和题目朗读按钮保留。
8. 不做语音输入。
9. 结构严重错误的输出会被严格拒绝。
10. V1 不以半成品形式交付。

