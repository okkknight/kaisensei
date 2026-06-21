# Kaisensei Deep Mode Frontend Backbone Spec

**目标：** 为 Deep Mode 的前端先定义一套可落地的非视觉基础，让 Codex 能先搭出“能用的前端结构”，再逐步填充视觉设计。

**范围：** 只定义 Deep Mode 的前端骨架、页面流、交互基础、状态边界、数据对接层和组件职责，目标是先把页面结构和交互骨架落下来，再补最终视觉稿。

## 1. 设计目标

前端第一阶段要做到：

- 页面顺序正确
- 交互路径正确
- 数据映射正确
- 状态切换正确
- 组件职责清楚
- 视觉暂时可以是占位态，但布局必须稳定

不做：

- 不追求最终美术效果
- 不追求 1:1 还原参考图的所有细节
- 不把 Deep Mode 和 Quick Mode 混成同一棵页面树
- 不在没有确认的地方擅自加功能

---

## 2. 当前基线

当前仓库里的前端基线如下：

- `prototype/src/App.jsx` 只是薄入口层
- `prototype/src/app/AppShell.jsx` 负责在 Camera / Quick / Deep 之间路由
- `prototype/src/app/CameraEntry.jsx` 负责首屏拍照、上传、模式选择和难度选择
- `prototype/src/quick/` 已经是 Quick Mode 自己的域
- `prototype/src/deep/` 已经有 Deep Mode 的骨架入口、纵览页、阶段模块和完成页

以下基于现有骨架整理成可执行的前端 Backbone。

---

## 3. 前端原则

### 3.1 先骨架，后皮肤

第一阶段只固定：

- 页面层级
- 区块分布
- 交互行为
- 数据流向
- 状态命名

视觉只保留最小可用占位样式，后续再补颜色、质感、插画和细节。

### 3.2 Deep 与 Quick 强隔离

Deep Mode 的前端不能反向依赖 Quick Mode 的 lesson 实现。

允许共享的只有：

- 应用入口层
- 首屏相机入口
- 图片拍摄 / 上传能力
- 无业务语义的 UI 基元
- 无业务语义的媒体工具

不允许共享的有：

- 课程流
- 状态机
- 练习判定
- 课程页面
- 模式专属文案
- Deep 专属数据映射

### 3.3 所有交互都以可点击、可重排为主

Deep Mode 第一阶段只使用：

- 点击
- 选择
- 词块重排
- 确认 / 返回

不引入：

- 语音输入
- 自由文本输入
- 拖拽作为必需能力

### 3.4 结构优先于装饰

结构优先级高于视觉优先级：

1. 模式与页面流
2. 状态和导航
3. 数据映射
4. 练习容器
5. 视觉样式

### 3.6 页面铺层规则

Deep Mode 的页面内容不是塞进一个统一的大外层面板里，而是直接铺在背景页面上。

允许存在的只是最小必要的页面骨架，比如：

- 顶部导航 / 返回区
- 进度提示区
- 页面主体里的独立卡片、练习区、回放区
- 底部操作栏

不允许把所有内容再包进一个大而完整的“课程主卡”里，让页面看起来像单层面板套娃。

要求：

- 每个页面的主体组件直接挂在页面背景层上
- 只在局部区块使用独立卡片
- 卡片负责自己的内容，不负责封装整页
- 页面之间保持呼吸感，留白由背景承担，而不是靠一个大外层面板承担
- 视觉边界用局部卡片、分组和间距来做，不用一整块大面板把所有内容兜住

## 4. 页面总流

Deep Mode 前端按以下顺序运行：

```text
Camera Entry
↓
Loading
↓
Overview
↓
Notice
↓
Interpret
↓
Interact
↓
Step In
↓
Completion
```

### 4.1 入口规则

- 在相机页选择 `Deep` 后，拍照或上传图片，进入 Deep Mode
- 一旦进入 Deep Mode 课程，不能在课程内切到 Quick Mode
- 想换模式必须回到相机页重新拍照或上传

### 4.2 返回规则

- 课程内返回，先回到上一个课程页面
- `Overview` 页返回，回到相机页
- 课程流程内返回时要确认，避免误退出
- `Completion` 页返回，先回到上一页或按产品定义回到课程末尾状态

---

## 5. 页面职责

### 5.0 图示标注规则

当设计图顶部出现类似 `1 Deep Loading`、`2 Course Overview` 这类标注时，它们只表示页面说明标题，不属于真实页面结构。

真实页面结构只从下方完整页面容器开始计算。不要把这些说明标题当作组件、布局或导航的一部分。

### 5.1 Camera Entry

相机入口不属于 Deep Mode 专属页面，但 Deep Mode 要从这里接收输入。

### 必须承载的能力

- 选择 Deep / Quick 模式
- 选择 Normal / Advanced
- 拍照
- 上传图片
- 把图片和模式上下文交给对应模式入口

### 第一阶段的非视觉要求

- 提供稳定的模式入口数据
- 不把 Deep Mode 的课程状态带回相机页
- 不在相机页内展示课程内容

---

## 6. Deep Mode 状态机

Deep Mode 前端状态机必须和产品设计一致。

### 6.1 顶层状态

```ts
type DeepPhase =
  | "loading"
  | "overview"
  | "notice"
  | "interpret"
  | "interact"
  | "stepIn"
  | "completion";
```

### 6.2 子状态

每个模块内部还需要自己的练习状态：

```ts
type ExerciseStatus = "idle" | "ready" | "checking" | "correct" | "incorrect" | "hinted";
```

对于对话型模块，还需要：

```ts
type DialogueTurnState = "system" | "userPending" | "userComplete";
```

### 6.3 状态切换原则

- `loading -> overview`：课程生成完成后进入纵览页
- `overview -> notice`：点击整张引导卡片
- `notice -> interpret -> interact -> stepIn`：按模块顺序推进
- `stepIn -> completion`：最终对话完成后进入完成页
- `completion -> camera`：通过返回拍照页或再次练习入口退出

---

## 7. 页面结构规范

### 7.1 Loading

#### 页面作用

Loading 页只负责过渡。用户在这里看到系统正在读取场景、生成练习、准备挑战，不做任何课程决策。

#### 复用关系

- 复用最小品牌区、阶段轨道和进度值
- 只和 Deep Mode 的加载态共享，不和课程页共享题目结构
- 不复用 Quick Mode 的练习卡

#### 组件清单

- 品牌区 `kaisensei / Deep Mode`
- 三段阶段进度卡
- 当前阶段高亮状态
- 进度百分比或等价完成度提示
- 固定加载文案

#### 布局说明

- 整页是居中的纵向大容器，外层留足留白
- 上半部居中放品牌区，只放标识和模式名
- 下半部放独立阶段卡，左侧是步骤轨道，右侧是文案区
- 阶段卡按顺序显示 `Reading the scene`、`Building your practice`、`Preparing your challenge`
- 当前进行中的步骤高亮，未进行步骤保持弱色
- 底部单独放整体进度值，与阶段卡分离

#### 组件说明与来源

- `kaisensei` 和 `Deep Mode`：前端固定品牌文案
- 三条英文阶段文案：`Reading the scene...`、`Building your practice...`、`Preparing your challenge...`，来自 Loading 参考图的固定文案
- 三条中文辅助文案：`正在读取场景...`、`正在生成练习内容...`、`正在准备挑战...`，来自前端固定 copy
- 当前进行中的步骤高亮：来自前端 loading 子状态或 job 生命周期状态
- 底部进度值：来自前端 loading 状态机的展示值

#### 交互流程与状态流转

- 不可中途切换模式
- 不可进入课程内容页
- 发生错误时切到 Error 状态，不停留在 loading

---

### 7.2 Overview

#### 页面作用

Overview 页是 Deep Mode 的课程入口页。它只回答一件事：这张图被识别成什么场景，值不值得开始这节课。

#### 复用关系

- 复用顶部工具栏、主卡片和开始 CTA
- 复用照片预览来源
- 不复用练习页的题目卡、词块池和对话轨道

#### 组件清单

- 顶部辅助状态行
- 中央主卡片
- 照片预览
- 关键词行
- 场景描述
- 开始引导语
- 底部开始按钮或整卡点击区域

#### 布局说明

- 页面顶部是一条单行工具栏，左侧放状态位，中心放品牌名，右侧放设置入口
- 中间只有一张主卡片，卡片是整页视觉重心
- 主卡片上半部放照片预览，下半部放文字信息和开始区域
- 文字信息在卡内按从上到下排列为关键词行、场景描述、开始引导语
- 开始引导语区域可以做成卡内底部 CTA，也可以让整张卡可点击
- 关键词区、场景区、引导语区必须是三个独立语义块

#### 组件说明与来源

- `photoPreviewUrl`：来自 `useDeepModeFlow.photoPreviewUrl`，由 `initialFile` 生成的 object URL 提供，不来自后端 `lesson`
- 关键词行：来自后端 `lesson.overview.keywords`，长度受后端 config `overviewKeywordCount` 约束
- 场景描述：来自后端 `lesson.overview.sceneDescriptionChinese`
- 开始引导语：固定为 `Ready to explore this scene?`
- 开始按钮：固定为 `Start Deep Mode →`
- 顶部 `Overview` 和 `Deep Mode` 文案：前端固定文案

#### 交互流程与状态流转

- 整张卡片可点击进入课程
- 也可以保留一个明确的开始按钮，但不应改变主交互含义
- 返回回到相机页

---

### 7.4 Notice / Interpret

#### Notice - Understand 页面

##### 页面作用

完成 Notice 阶段里某个核心表达的第 1 步理解练习：把英文例句重新排序，确认这个表达在句子里的位置和用法。

##### 复用关系

- 与 `Interpret - Understand` 共用同一页面模板
- 与本组内的 `Focus`、`Build` 共享顶部进度、返回按钮和底部操作栏
- 不与 Quick Response 共享题目结构

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 英文例句
- 核心表达高亮
- 中文词块排序区
- 干扰块
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶部放导航和主进度
- 中部上方是题目卡，卡内先放题目说明，再放英文例句
- 英文例句下方的核心表达单独高亮
- 题目卡下方放中文词块池和干扰块
- 底：独立操作栏

##### 组件说明与来源

- 页内进度 `Step 1 of 3`：由当前表达在 `Understand -> Focus -> Build` 里的页序动态计算
- 题目标签：来自 `expressionPack.coreExpression`
- 题目说明：固定为 `Reorder to understand the sentence.`
- 英文例句：来自 `expressionPack.baseExample.english`
- 中文例句基准：来自 `expressionPack.baseExample.chinese`
- 中文词块排序区：来自 `expressionPack.baseExample.understand.chunks`
- 干扰块：来自 `expressionPack.baseExample.understand.distractors`
- 正确答案：来自 `expressionPack.baseExample.understand.answer`
- 核心表达高亮：来自 `expressionPack.coreExpression`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 用户拖拽或点选中文词块完成排序
- 可随时 Reset 回到初始状态
- Hint 用于高亮当前线索，不跳页
- Check 校验正确后进入当前表达的 `Focus` 页

#### Notice - Focus 页面

##### 页面作用

完成 Notice 阶段里某个核心表达的第 2 步：把目标表达补回句子空位里。

##### 复用关系

- 与 `Interpret - Focus` 共用同一页面模板
- 与 `Notice - Understand / Build` 共享同一表达和同一底部操作栏

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 带空位的英文句子
- 中文基准句
- 候选词块区
- 已填空位区
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡第一行放题目说明
- 第二行放带空位的英文句子
- 第三行放中文基准句
- 题目卡下方分开显示已填空位区和候选词块区
- 底：独立操作栏

##### 组件说明与来源

- 页内进度 `Step 2 of 3`：由当前表达在三步页序中的位置计算
- 题目标签：来自 `expressionPack.coreExpression`
- 题目说明：固定为 `Fill in the blanks with the core expression.`
- 带空位句子：来自 `expressionPack.baseExample.focus.sentenceWithBlanks`
- 中文基准句：来自 `expressionPack.baseExample.chinese`
- 候选词块：来自 `expressionPack.baseExample.focus.choices`
- 干扰词块：来自 `expressionPack.baseExample.focus.distractors`
- 正确答案：来自 `expressionPack.baseExample.focus.answer`
- 空位数量：由 `sentenceWithBlanks` 自身决定，并与后端 config 对齐
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 用户选择词块填入空位
- 可撤回已选词块
- Check 通过后进入当前表达的 `Build` 页

#### Notice - Build 页面

##### 页面作用

完成 Notice 阶段里某个核心表达的第 3 步：根据中文句子重排英文表达。

##### 复用关系

- 与 `Interpret - Build` 共用同一页面模板
- 与 `Notice - Understand / Focus` 共享同一表达和同一底部操作栏

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 固定任务说明
- 目标句中文
- 用户答案区
- 英文词块池
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡第一行放固定任务说明
- 第二行放目标句中文
- 中部放用户答案区
- 用户答案区下方放英文词块池
- 底部操作栏固定在页面底部

##### 组件说明与来源

- 页内进度 `Step 3 of 3`：由当前表达在三步页序中的位置计算
- 题目标签：来自 `expressionPack.coreExpression`
- 题目说明：固定为 `Build the sentence.`
- 目标句中文：来自 `expressionPack.baseExample.build.promptChinese`
- 用户答案区候选词块：来自 `expressionPack.baseExample.build.chunks`
- 干扰词块：来自 `expressionPack.baseExample.build.distractors`
- 正确答案：来自 `expressionPack.baseExample.build.answer`
- 固定任务说明：前端固定 copy
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 用户重排英文词块
- 可撤回已选词块
- Check 通过后进入当前表达的 Quick Response 页

#### Notice - Quick Response 页面

##### 页面作用

让用户回答一个围绕当前核心表达的快速问题，确认表达的实际含义或原因。

##### 复用关系

- 与 `Interpret - Quick Response` 共用同一页面模板
- 与本组前 3 页共享同一表达和底部操作栏

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 问题卡
- 中文辅助问题
- 用户答案区
- 答案词块池
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 中：问题卡
- 问题卡下：答案区
- 答案区下：答案词块池
- 底：独立操作栏

##### 组件说明与来源

- 页内进度：由当前 quick response 在该表达的题目序列里动态计算
- 问题句：来自 `expressionPack.quickResponses[i].question`
- Notice 辅助问题：固定为 `这个句子表达的主要原因是什么？`
- Interpret 辅助问题：固定为 `目前可能正在发生什么？`
- 用户答案区占位：固定为 `Build your answer / 在此形成句组`
- 答案词块池：来自 `expressionPack.quickResponses[i].chunks`
- 干扰词块：来自 `expressionPack.quickResponses[i].distractors`
- 正确答案：来自 `expressionPack.quickResponses[i].answer`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 用户重排答案词块
- Check 通过后进入当前表达的完成页

#### Notice Milestone 页面

##### 页面作用

完成整个 Notice 阶段后，回收本阶段已经学到的核心表达，并把用户导向 Interpret 阶段。

##### 复用关系

- 与 `Interpret Milestone` 共用同一张完成卡模板
- 不再复用题目卡、词块池或回答区

##### 组件清单

- 完成图标
- 完成文案块
- 核心表达列表块
- `Continue to Interpret →` 按钮

##### 布局说明

- 中：完成卡
- 卡顶：完成图标
- 卡中：完成文案块
- 卡下：核心表达列表块
- 底：Continue 按钮

##### 组件说明与来源

- 主标题 `Great job!`：固定文案
- 说明 `You've completed the Notice stage.`：固定文案
- 中文说明 `你已完成 Notice 阶段！`：固定文案
- 分组标题 `Core expressions you noticed`：固定文案
- 核心表达列表项：来自 `modules.notice.expressionPacks[*].coreExpression` 和 `meaningChinese`
- 按钮 `Continue to Interpret →`：固定文案

##### 交互流程与状态流转

- 点击 Continue 进入 Interpret 阶段

#### Interpret - Understand 页面

##### 页面作用

完成 Interpret 阶段里某个核心表达的第 1 步理解练习。

##### 复用关系

- 与 `Notice - Understand` 共用同一页面模板
- 只替换为 Interpret 模块的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 英文例句
- 核心表达高亮
- 中文词块排序区
- 干扰块
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 中部上方是题目卡
- 题目卡内先放题目说明，再放英文例句
- 核心表达单独高亮
- 题目卡下方放中文词块池和干扰块
- 底：独立操作栏

##### 组件说明与来源

- 页内进度 `Step 1 of 3`
- 题目标签：来自 `expressionPack.coreExpression`
- 题目说明：固定为 `Reorder to understand the sentence.`
- 英文例句：来自 `expressionPack.baseExample.english`
- 中文例句基准：来自 `expressionPack.baseExample.chinese`
- 中文词块排序区：来自 `expressionPack.baseExample.understand.chunks`
- 干扰块：来自 `expressionPack.baseExample.understand.distractors`
- 正确答案：来自 `expressionPack.baseExample.understand.answer`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 排序完成后进入 Interpret 的 `Focus` 页

#### Interpret - Focus 页面

##### 页面作用

完成 Interpret 阶段里某个核心表达的第 2 步：补空练习。

##### 复用关系

- 与 `Notice - Focus` 共用同一页面模板
- 只替换为 Interpret 模块的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 带空位的英文句子
- 中文基准句
- 候选词块区
- 已填空位区
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡第一行放题目说明
- 第二行放带空位的英文句子
- 第三行放中文基准句
- 题目卡下方分开显示已填空位区和候选词块区
- 底：独立操作栏

##### 组件说明与来源

- 页内进度 `Step 2 of 3`
- 题目标签：来自 `expressionPack.coreExpression`
- 题目说明：固定为 `Fill in the blanks with the core expression.`
- 带空位句子：来自 `expressionPack.baseExample.focus.sentenceWithBlanks`
- 中文基准句：来自 `expressionPack.baseExample.chinese`
- 候选词块：来自 `expressionPack.baseExample.focus.choices`
- 干扰词块：来自 `expressionPack.baseExample.focus.distractors`
- 正确答案：来自 `expressionPack.baseExample.focus.answer`
- 空位数量：由 `sentenceWithBlanks` 自身决定，并与后端 config 对齐
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 通过后进入 Interpret 的 `Build` 页

#### Interpret - Build 页面

##### 页面作用

完成 Interpret 阶段里某个核心表达的第 3 步：根据中文句子重排英文表达。

##### 复用关系

- 与 `Notice - Build` 共用同一页面模板
- 只替换为 Interpret 模块的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 固定任务说明
- 目标句中文
- 用户答案区
- 英文词块池
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡第一行放固定任务说明
- 第二行放目标句中文
- 中部放用户答案区
- 用户答案区下方放英文词块池
- 底部操作栏固定

##### 组件说明与来源

- 页内进度 `Step 3 of 3`
- 题目标签：来自 `expressionPack.coreExpression`
- 题目说明：固定为 `Build the sentence.`
- 目标句中文：来自 `expressionPack.baseExample.build.promptChinese`
- 用户答案区候选词块：来自 `expressionPack.baseExample.build.chunks`
- 干扰词块：来自 `expressionPack.baseExample.build.distractors`
- 正确答案：来自 `expressionPack.baseExample.build.answer`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 通过后进入 Interpret 的 Quick Response 页

#### Interpret - Quick Response 页面

##### 页面作用

让用户回答一个围绕当前核心表达的快速问题，确认这个表达在场景里的理解。

##### 复用关系

- 与 `Notice - Quick Response` 共用同一页面模板
- 只替换为 Interpret 模块的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 问题卡
- 中文辅助问题
- 用户答案区
- 答案词块池
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 中：问题卡
- 问题卡下：答案区
- 答案区下：答案词块池
- 底：独立操作栏

##### 组件说明与来源

- 页内进度：由当前 quick response 在该表达的题目序列里动态计算
- 问题句：来自 `expressionPack.quickResponses[i].question`
- Notice 辅助问题：固定为 `这个句子表达的主要原因是什么？`
- Interpret 辅助问题：固定为 `目前可能正在发生什么？`
- 用户答案区占位：固定为 `Build your answer / 在此形成句组`
- 答案词块池：来自 `expressionPack.quickResponses[i].chunks`
- 干扰词块：来自 `expressionPack.quickResponses[i].distractors`
- 正确答案：来自 `expressionPack.quickResponses[i].answer`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 通过后进入 Interpret 的完成页

#### Interpret Milestone 页面

##### 页面作用

完成整个 Interpret 阶段后，回收本阶段已经学到的核心表达，并导向 Interact 阶段。

##### 复用关系

- 与 `Notice Milestone` 共用同一张完成卡模板
- 不复用题目卡、词块池或回答区

##### 组件清单

- 完成图标
- 完成文案块
- 核心表达列表块
- `Continue to Interact →` 按钮

##### 布局说明

- 中：完成卡
- 卡顶：完成图标
- 卡中：完成文案块
- 卡下：核心表达列表块
- 底：Continue 按钮

##### 组件说明与来源

- 主标题 `Great job!`：固定文案
- 说明 `You've completed the Interpret stage.`：固定文案
- 中文说明 `你已完成 Interpret 阶段！`：固定文案
- 分组标题 `Core expressions you interpreted`：固定文案
- 核心表达列表项：来自 `modules.interpret.expressionPacks[*].coreExpression` 和 `meaningChinese`
- 按钮 `Continue to Interact →`：固定文案

##### 交互流程与状态流转

- 点击 Continue 进入 Interact 阶段

### 7.5 Interact

#### 任务包引导页

##### 页面作用

让用户在进入练习前先看清当前任务包的场景、Need 表达和 Handle 表达。

##### 复用关系

- 与后面的 `Need / Handle` 三步页共享同一任务包数据
- 复用顶部返回按钮、主进度和缩略图入口
- 不复用对话页的消息时间线

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 任务包标题
- 场景说明
- Need Expression 预览卡
- Handle Expression 预览卡
- `Start Practice →` 按钮

##### 布局说明

- 顶：导航 + 主进度
- 中部放一张任务包总览卡
- 总览卡先显示任务标题，再显示场景说明
- Need 与 Handle 预览卡纵向堆叠
- 底部只放一个主按钮

##### 组件说明与来源

- 顶部模块标签 `Interact`：固定文案
- 任务包标题：来自 `taskPacks[i].taskTitle`
- 场景说明：来自 `taskPacks[i].scenePrompt`
- 场景中文辅助说明：来自后端返回的场景中文描述文本
- Need 预览表达：来自 `taskPacks[i].need.coreExpression`
- Need 释义：来自 `taskPacks[i].need.meaningChinese`
- Handle 预览表达：来自 `taskPacks[i].handle.coreExpression`
- Handle 释义：来自 `taskPacks[i].handle.meaningChinese`
- 按钮：固定为 `Start Practice →`

##### 交互流程与状态流转

- 点击 Start Practice 后进入当前任务包的 `Need - Understand` 页

#### Need - Understand 页面

##### 页面作用

完成 Need 表达的第 1 步：理解并重排当前例句。

##### 复用关系

- 与 `Handle - Understand` 共用同一页面模板
- 与本组 `Focus / Build` 共享同一表达和底部操作栏

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 英文例句
- 核心表达高亮
- 中文词块排序区
- 干扰块
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡放在中上部
- 题目卡第一行放题目标签和说明
- 第二行放英文例句
- 第三行放中文词块提示
- 题目卡下方放中文词块池和干扰块
- 底部操作栏固定

##### 组件说明与来源

- 页内进度 `Step 1 of 3`
- 题目标签：来自 `taskPacks[i].need.coreExpression`
- 题目说明：固定为 `Reorder the chunks.`
- 英文例句：来自 `taskPacks[i].need.baseExample.english` 或 `variations[k].english`
- 中文例句基准：来自 `taskPacks[i].need.baseExample.chinese` 或 `variations[k].chinese`
- 中文词块排序区：来自 `understand.chunks`
- 干扰块：来自 `understand.distractors`
- 正确答案：来自 `understand.answer`
- 核心表达高亮：来自 `taskPacks[i].need.coreExpression`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 排序完成后进入 `Need - Focus`

#### Need - Focus 页面

##### 页面作用

完成 Need 表达的第 2 步：把核心表达补进空位。

##### 复用关系

- 与 `Handle - Focus` 共用同一页面模板
- 只替换为 Need 模块数据

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 带空位的英文句子
- 中文基准句
- 候选词块区
- 已填空位区
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡第一行放题目说明
- 第二行放带空位的英文句子
- 第三行放中文基准句
- 卡下方分开显示已填空位区和候选词块区
- 底：独立操作栏

##### 组件说明与来源

- 页内进度 `Step 2 of 3`
- 题目标签：来自 `taskPacks[i].need.coreExpression`
- 题目说明：固定为 `Fill in the blanks with the core expression.`
- 带空位句子：来自 `focus.sentenceWithBlanks`
- 中文基准句：来自 `baseExample.chinese` 或 `variations[k].chinese`
- 候选词块：来自 `focus.choices`
- 干扰词块：来自 `focus.distractors`
- 正确答案：来自 `focus.answer`
- 空位数量：由 `sentenceWithBlanks` 自身决定，并与后端 config 对齐
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 通过后进入 `Need - Build`

#### Need - Build 页面

##### 页面作用

完成 Need 表达的第 3 步：按中文句子重排英文表达。

##### 复用关系

- 与 `Handle - Build` 共用同一页面模板
- 只替换为 Need 模块数据

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 固定任务说明
- 目标句中文
- 用户答案区
- 英文词块池
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡第一行放固定任务说明
- 第二行放目标句中文
- 中部放用户答案区
- 下方放英文词块池
- 底：独立操作栏

##### 组件说明与来源

- 页内进度 `Step 3 of 3`
- 题目标签：来自 `taskPacks[i].need.coreExpression`
- 题目说明：固定为 `Build the sentence.`
- 目标句中文：来自 `build.promptChinese`
- 用户答案区候选词块：来自 `build.chunks`
- 干扰词块：来自 `build.distractors`
- 正确答案：来自 `build.answer`
- 固定任务说明：前端固定 copy
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 通过后进入当前任务包的 `Handle - Understand` 页

#### Handle - Understand 页面

##### 页面作用

完成 Handle 表达的第 1 步：理解并重排当前例句。

##### 复用关系

- 与 `Need - Understand` 共用同一页面模板
- 只替换为 Handle 模块数据

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 英文例句
- 核心表达高亮
- 中文词块排序区
- 干扰块
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡放在中上部
- 题目卡第一行放题目标签和说明
- 第二行放英文例句
- 第三行放中文词块提示
- 题目卡下方放中文词块池和干扰块
- 底部操作栏固定

##### 组件说明与来源

- 页内进度 `Step 1 of 3`
- 题目标签：来自 `taskPacks[i].handle.coreExpression`
- 题目说明：固定为 `Reorder the chunks.`
- 英文例句：来自 `handle.baseExample.english` 或 `variations[k].english`
- 中文例句基准：来自 `handle.baseExample.chinese` 或 `variations[k].chinese`
- 中文词块排序区：来自 `understand.chunks`
- 干扰块：来自 `understand.distractors`
- 正确答案：来自 `understand.answer`
- 核心表达高亮：来自 `taskPacks[i].handle.coreExpression`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 排序完成后进入 `Handle - Focus`

#### Handle - Focus 页面

##### 页面作用

完成 Handle 表达的第 2 步：补空练习。

##### 复用关系

- 与 `Need - Focus` 共用同一页面模板
- 只替换为 Handle 模块数据

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 带空位的英文句子
- 中文基准句
- 候选词块区
- 已填空位区
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡第一行放题目说明
- 第二行放带空位的英文句子
- 第三行放中文基准句
- 卡下方分开显示已填空位区和候选词块区
- 底：独立操作栏

##### 组件说明与来源

- 页内进度 `Step 2 of 3`
- 题目标签：来自 `taskPacks[i].handle.coreExpression`
- 题目说明：固定为 `Fill in the blanks with the core expression.`
- 带空位句子：来自 `focus.sentenceWithBlanks`
- 中文基准句：来自 `baseExample.chinese` 或 `variations[k].chinese`
- 候选词块：来自 `focus.choices`
- 干扰词块：来自 `focus.distractors`
- 正确答案：来自 `focus.answer`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 通过后进入 `Handle - Build`

#### Handle - Build 页面

##### 页面作用

完成 Handle 表达的第 3 步：按中文句子重排英文表达。

##### 复用关系

- 与 `Need - Build` 共用同一页面模板
- 只替换为 Handle 模块数据

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 题目卡
- 固定任务说明
- 目标句中文
- 用户答案区
- 英文词块池
- 底部 `Reset / Hint / Check`

##### 布局说明

- 顶：导航 + 主进度
- 题目卡第一行放固定任务说明
- 第二行放目标句中文
- 中部放用户答案区
- 下方放英文词块池
- 底：独立操作栏

##### 组件说明与来源

- 页内进度 `Step 3 of 3`
- 题目标签：来自 `taskPacks[i].handle.coreExpression`
- 题目说明：固定为 `Build the sentence.`
- 目标句中文：来自 `build.promptChinese`
- 用户答案区候选词块：来自 `build.chunks`
- 干扰词块：来自 `build.distractors`
- 正确答案：来自 `build.answer`
- 底部按钮：固定为 `Reset / Hint / Check`

##### 交互流程与状态流转

- 通过后进入 `Dialogue Practice - Need`

#### Dialogue Practice - Need 页面

##### 页面作用

完成对话场景里 Need 轮次的用户回答，开始把前面学到的内容串成真实对话。

##### 复用关系

- 与 `Dialogue Practice - Handle` 共用同一对话时间线模板
- 与前面三步页共享当前任务包的 Need 表达，但不共享题目卡结构

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 场景说明卡
- 对方开场气泡
- 用户回答提示
- Need 答案区
- 候选词块池
- 底部 `Reset / Hint / Send`

##### 布局说明

- 顶：导航 + 主进度
- 中部先放场景说明卡
- 场景卡下方放对方开场气泡
- 再下方放用户回答提示
- 提示下：答案区 + 候选词块池
- 底：`Send` 操作栏

##### 组件说明与来源

- 场景标题 `Scene`：固定文案
- 场景说明：来自 `taskPacks[i].dialogues[j].scene`
- 场景中文辅助说明：来自后端返回的场景中文描述文本
- 对方开场气泡：来自当前 dialogue turn 的前置 system 文本
- 用户提示：固定为 `Your turn: Build your Need`
- Need 用户输入区：来自 `dialogues[j].need.chunks / distractors / answer`
- 底部按钮：固定为 `Reset / Hint / Send`

##### 交互流程与状态流转

- 用户提交后进入 `Dialogue Practice - Handle`

#### Dialogue Practice - Handle 页面

##### 页面作用

完成对话场景里 Handle 轮次的用户回答，接住系统给出的桥接回复并继续对话。

##### 复用关系

- 与 `Dialogue Practice - Need` 共用同一对话时间线模板
- 只替换为 Handle 轮次的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 场景说明卡
- 上一轮 Need 的正确用户气泡
- 系统回复气泡
- 用户回答提示
- Handle 答案区
- 候选词块池
- 底部 `Reset / Hint / Send`

##### 布局说明

- 顶：导航 + 主进度
- 中部先放场景说明卡
- 场景卡下方依次放上一轮 Need 的正确用户气泡和系统回复气泡
- 系统回复下方放用户回答提示
- 提示下：答案区 + 候选词块池
- 底：`Send` 操作栏

##### 组件说明与来源

- 场景标题 `Scene`：固定文案
- 场景说明：来自 `taskPacks[i].dialogues[j].scene`
- 场景中文辅助说明：来自后端返回的场景中文描述文本
- 上一轮 Need 气泡：来自 `dialogues[j].need.answer`
- 系统回复气泡：来自 `dialogues[j].systemReply`，它必须是一个不暴露 Handle 目标表达的桥接句
- 用户提示：固定为 `Your turn: Build your Handle`
- Handle 用户输入区：来自 `dialogues[j].handle.chunks / distractors / answer`
- 底部按钮：固定为 `Reset / Hint / Send`

##### 交互流程与状态流转

- 用户提交后进入 Interact 阶段完成页

#### Interact Milestone 页面

##### 页面作用

收束整个 Interact 阶段，展示已经完成的任务包和可回收的核心表达。

##### 复用关系

- 与 `Notice Milestone`、`Interpret Milestone` 共用同一完成卡模板
- 不再出现题目卡、词块池或对话输入区

##### 组件清单

- 完成图标
- 完成文案块
- Need expressions
- Handle expressions
- Capability summary
- `Continue to Step In →` 按钮

##### 布局说明

- 中：完成卡
- 卡顶：完成图标
- 完成文案块在图标下方
- Need 和 Handle 表达列表分开显示
- 能力总结单独成块
- 底：Continue 按钮

##### 组件说明与来源

- 主标题 `Excellent!`：固定文案
- 说明 `You've completed the Interact stage.`：固定文案
- 中文说明 `你已完成 Interact 阶段！`：固定文案
- Need expressions：来自 `taskPacks[i].need.coreExpression` 和 `meaningChinese`
- Handle expressions：来自 `taskPacks[i].handle.coreExpression` 和 `meaningChinese`
- Capability summary：固定完成态 copy
- 按钮 `Continue to Step In →`：固定文案

##### 交互流程与状态流转

- 点击 Continue 进入 Step In

### 7.6 Step In

#### 挑战引导卡页面

##### 页面作用

让用户进入最终综合挑战前，先明确这轮要在同一场景里用前面学到的内容持续接话。

##### 复用关系

- 复用顶部返回按钮、主进度和缩略图入口
- 与后续对话轮次共享同一条时间线
- 不复用前面练习页的词块池布局

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 挑战卡
- 标题 `Challenge`
- 目标说明
- 追加入门语
- 中文说明

##### 布局说明

- 顶：导航 + 主进度
- 中部放一张简短的挑战引导卡
- 卡内先放标题，再放目标说明
- 目标说明下方放追加入门语和中文说明
- 不在这一页单独放词块池或输入区

##### 组件说明与来源

- 标题 `Challenge`：固定文案
- 目标说明：来自 `modules.stepIn.goal`
- 追加入门语：固定为 `Stay in character and keep the scene moving!`
- 中文说明：固定为 `保持在场景里，继续接话！`
- 场景说明：来自 `modules.stepIn.dialogue.scene`

##### 交互流程与状态流转

- 进入后直接展开后续对话轮次

#### Notice 轮次页面

##### 页面作用

完成 Step In 的第 1 段对话，使用 Notice 阶段学到的内容接住系统角色的开场。

##### 复用关系

- 与后续轮次共用同一对话时间线模板
- 只替换当前轮次的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 对话时间线
- 当前系统开场
- 用户输入区
- 候选词块池
- 底部 `Reset / Hint / Send`

##### 布局说明

- 顶：导航 + 主进度
- 中部从场景说明和历史消息开始
- 当前系统开场显示在时间线末尾
- 用户输入区放在系统开场下方
- 词块池放在输入区下方
- 底：`Send` 操作栏

##### 组件说明与来源

- 系统开场：来自 `modules.stepIn.dialogue.turns` 中当前 Notice turn 的前一条 system turn
- 历史消息：来自已完成的前置 turns
- 当前用户输入区：来自当前 Notice turn 的 `chunks / distractors / answer`
- 当前来源标记：`sourceModule = notice`
- 底部按钮：固定为 `Reset / Hint / Send`

##### 交互流程与状态流转

- 提交后进入 Interpret 轮次

#### Interpret 轮次页面

##### 页面作用

完成 Step In 的第 2 段对话，接住系统连续接话并继续表达。

##### 复用关系

- 与 Notice 轮次共用同一对话时间线模板
- 只替换当前轮次的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 对话时间线
- 当前系统接话
- 用户输入区
- 候选词块池
- 底部 `Reset / Hint / Send`

##### 布局说明

- 顶：导航 + 主进度
- 中部延续同一条对话时间线
- 当前系统接话显示在时间线末尾
- 用户输入区放在接话下方
- 词块池放在输入区下方
- 底：`Send` 操作栏

##### 组件说明与来源

- 系统接话：来自 `modules.stepIn.dialogue.turns` 中当前 Interpret turn 的前一条 system turn
- 历史消息：来自已完成的前置 turns
- 当前用户输入区：来自当前 Interpret turn 的 `chunks / distractors / answer`
- 当前来源标记：`sourceModule = interpret`
- 底部按钮：固定为 `Reset / Hint / Send`

##### 交互流程与状态流转

- 提交后进入 Interact - Need 轮次

#### Interact - Need 轮次页面

##### 页面作用

在最终挑战中完成 Interact 的 Need 轮次，继续接住场景里的任务提示。

##### 复用关系

- 与 Notice / Interpret 轮次共用同一对话时间线模板
- 只替换当前轮次的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 对话时间线
- 当前任务提示
- 用户输入区
- 候选词块池
- 底部 `Reset / Hint / Send`

##### 布局说明

- 顶：导航 + 主进度
- 中部延续同一条对话时间线
- 当前任务提示显示在时间线末尾
- 用户输入区放在任务提示下方
- 词块池放在输入区下方
- 底：`Send` 操作栏

##### 组件说明与来源

- 当前任务提示：来自当前 `interact_need` turn 的前一条 system turn
- 历史消息：来自已完成的前置 turns
- 当前用户输入区：来自当前 `interact_need` turn 的 `chunks / distractors / answer`
- 当前来源标记：`sourceModule = interact_need`
- 底部按钮：固定为 `Reset / Hint / Send`

##### 交互流程与状态流转

- 提交后进入 Interact - Handle 轮次

#### Interact - Handle 轮次页面

##### 页面作用

在最终挑战中完成 Interact 的 Handle 轮次，接住系统回复并把这一段对话收尾。

##### 复用关系

- 与前面的对话轮次共用同一对话时间线模板
- 只替换当前轮次的数据源

##### 组件清单

- 顶部返回按钮、主进度、缩略图入口
- 对话时间线
- 当前系统回复
- 用户输入区
- 候选词块池
- 底部 `Reset / Hint / Send`

##### 布局说明

- 顶：导航 + 主进度
- 中部延续同一条对话时间线
- 当前系统回复显示在时间线末尾
- 用户输入区放在系统回复下方
- 词块池放在输入区下方
- 底：`Send` 操作栏

##### 组件说明与来源

- 当前系统回复：来自当前 `interact_handle` turn 的前一条 system turn
- 历史消息：来自已完成的前置 turns
- 当前用户输入区：来自当前 `interact_handle` turn 的 `chunks / distractors / answer`
- 当前来源标记：`sourceModule = interact_handle`
- 底部按钮：固定为 `Reset / Hint / Send`

##### 交互流程与状态流转

- 提交后进入 Step In 完成反馈

#### 完成反馈页面

##### 页面作用

在 Step In 结束后短暂收束，告诉用户整段挑战完成。

##### 复用关系

- 可复用 Completion 页的数据，但不再新建输入结构
- 不再出现词块池或回答区

##### 组件清单

- 完成文案
- 完成回放摘要
- `Practice again`
- `Back to camera`

##### 布局说明

- 完成反馈只做短暂收束
- 不再显示新的练习区
- 可以复用完成页的结果卡样式

##### 组件说明与来源

- 完成文案：固定为 `Great job! / You've completed the Deep Mode course. / 你已完成 Deep Mode 课程！`
- Practice again：固定按钮
- Back to camera：固定按钮
- 完整回放：来自 `modules.stepIn.dialogue.turns`

##### 交互流程与状态流转

- 用户可选择重新练习或返回相机页

### 7.7 Completion

#### 页面作用

课程最终结果页，展示完整阶段回收和整段 Step In 对话回放。

#### 复用关系

- 与 Step In 的完成反馈共享结果数据
- 不再复用任何输入型页面结构

#### 组件清单

- 顶部完成视觉锚点
- 完成提示区
- 四阶段表达摘要区
- 完整对话回放区
- 底部双 CTA 区

#### 布局说明

- 顶部保留照片或完成徽章作为视觉锚点
- 视觉锚点下方放完成提示区
- 中部放四阶段表达摘要区
- 摘要区下方放完整对话回放区
- 底部放两个并列按钮

#### 组件说明与来源

- 顶部照片或完成徽章：来自 `useDeepModeFlow.photoPreviewUrl` 或前端固定 completion 图标
- 完成主标题：固定为 `Great job!`
- 完成说明：固定为 `You've completed the Deep Mode course.`
- 中文完成说明：固定为 `你已完成 Deep Mode 课程！`
- Notice 摘要：来自 `modules.notice.expressionPacks[*].coreExpression` 和 `meaningChinese`
- Interpret 摘要：来自 `modules.interpret.expressionPacks[*].coreExpression` 和 `meaningChinese`
- Interact 摘要：来自 `modules.interact.taskPacks[*].need.coreExpression` / `meaningChinese` 与 `handle.coreExpression` / `meaningChinese`
- Step In 回放：来自 `modules.stepIn.dialogue.turns`
- 再次练习按钮：固定为 `Practice again`
- 返回拍照页按钮：固定为 `Back to camera`

#### 交互流程与状态流转

- 点击 Practice again 返回课程起点
- 点击 Back to camera 返回相机页

## 8. 组件与职责

组件职责如下。它们只描述边界，不描述视觉外壳。

### 8.1 入口与路由

- `AppShell`
  - 只负责模式分发
  - 不写课程业务

- `DeepModeApp`
  - 只负责 Deep Mode 的入口编排
  - 不承担具体练习判定

- `useDeepModeFlow`
  - 只负责 Deep 模式状态、阶段推进、照片预览 URL 生命周期
  - 不负责渲染

### 8.2 页面层

- `DeepOverviewScreen`
  - 只负责 Overview 页

- `DeepCourseShell`
  - 只负责 phase 到页面模板的映射
  - 不产出额外可见外壳，只把当前页面需要的字段传给对应页面

- `NoticeModule`
- `InterpretModule`
- `InteractModule`
- `StepInModule`
  - 各自负责本模块页面渲染和状态推进

- `DeepCompletionScreen`
  - 只负责完成页

## 9. 数据与对接层

### 9.1 后端输入

前端接收的 Deep Mode 课程数据以后端 `lesson` 为准，来自 `mode=deep` 的课程 JSON。
缺字段时优先报错或重新请求，不在 UI 里猜字段。

### 核心输入

- `mode`
- `level`
- `overview`
- `modules.notice`
- `modules.interpret`
- `modules.interact`
- `modules.stepIn`

### 9.2 前端 view model

前端把后端 JSON 映射成只给页面用的 view model，页面不要直接依赖原始 payload。

页面级 view model 只保留这些分组：

- `overviewVM`
  - `photoPreviewUrl`
  - `keywords`
  - `sceneDescriptionChinese`
- `noticeVM`
  - `expressionPacks`
- `interpretVM`
  - `expressionPacks`
- `interactVM`
  - `taskPacks`
  - `dialogues`
- `stepInVM`
  - `title`
  - `goal`
  - `scene`
  - `turns`
- `completionVM`
  - `photoPreviewUrl`
  - 四阶段摘要数据
  - `turns` 回放数据

映射时遵守这三条：

- 数据层只关心字段
- 页面层只关心当前页面内容
- 交互层只关心当前状态

不要让页面组件直接依赖后端 payload 细节。

---

## 10. 交互细则

### 10.1 选择方式

Deep Mode 第一版只用点击或选择，不做拖拽必需交互。

### 10.2 验证行为

- 验证按钮在输入未完成时禁用
- 正确时给轻量反馈并推进下一步
- 错误时先局部提示，不直接暴露完整答案

### 10.3 Hint 行为

- Hint 只提示局部信息
- Hint 不能一次性展示完整答案
- Hint 可以减少干扰项、突出核心表达或固定首块

### 10.4 进度行为

- 顶部主进度固定四段
- 模块内进度单独显示
- 里程碑页不计入题目进度

### 10.5 返回行为

- 课程内返回先确认
- overview 返回直接回相机页
- completion 返回按照产品定义回到上一层或相机页

---

## 11. 非视觉验收标准

Deep Mode 前端 backbone 的验收条件：

1. 能从相机页进入 Deep Mode
2. 能经历 `loading -> overview -> notice -> interpret -> interact -> stepIn -> completion`
3. 能正确展示四阶段主进度
4. 能正确展示模块内题目进度
5. 能正确承接后端 Deep Course JSON
6. 练习交互只用点击 / 选择 / 重排
7. 课程内不会混入 Quick Mode 业务
8. 视觉样式可以先简陋，但区块关系必须稳定
9. 发生错误时有明确 error state，而不是空白页

---

## 12. 已确认项

以下前端骨架决策已经确认：

1. **照片缩略图放大**
   - 第一版不做原图 modal
   - 课程页只保留缩略图入口和占位承接位，放大能力后置

2. **完成页 CTA**
   - Completion 页保留 `再次练习` 和 `返回拍照页` 两个按钮
   - 两个按钮都属于首版结构

3. **TTS 入口**
   - Deep Mode 前端第一版纳入英文 TTS 播放按钮结构
   - 具体播放实现可后续接入，但结构位要先预留

4. **首版 loading 文案**
   - 直接沿用 loading 文案

5. **页面外层结构**
   - Deep Mode 页面只保留必要的导航、进度、内容区和底部操作栏
   - 不再额外加一层可见的课程主壳
   - 具体区块直接铺在页面背景上

---
